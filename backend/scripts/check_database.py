from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

try:
    import asyncpg
except ModuleNotFoundError:
    asyncpg = None

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import get_settings


async def main() -> None:
    os.environ["APP_ENV"] = "local"
    get_settings.cache_clear()

    try:
        settings = get_settings()
    except Exception as exc:
        raise SystemExit(f"Settings validation failed: {exc}") from exc

    if not settings.effective_database_url:
        print(f"Environment file: {settings.resolved_env_file}")
        raise SystemExit(
            "Missing required environment values: DATABASE_URL or "
            "POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PASSWORD"
        )

    summary = settings.database_log_summary
    print(f"Environment file: {settings.resolved_env_file}")
    print(f"Configuration source: {settings.database_configuration_source}")
    print(f"Host: {summary['postgres_host']}")
    print(f"Port: {summary['postgres_port']}")
    print(f"Database: {summary['postgres_database']}")
    print(f"User: {summary['postgres_user']}")

    if asyncpg is None:
        raise SystemExit("asyncpg is not installed. Run: backend\\.venv\\Scripts\\python.exe -m pip install -r backend\\requirements.txt")

    try:
        connection = await asyncpg.connect(settings.asyncpg_database_url, statement_cache_size=0)
    except Exception as exc:
        raise SystemExit(f"Connection: failed ({exc.__class__.__name__})") from exc

    try:
        staff_roles = await connection.fetchval("SELECT COUNT(*) FROM staff_roles")
        print("Connection: successful")
        print(f"staff_roles: {staff_roles}")

        required_columns = {
            "customers": {
                "id", "full_name", "email", "phone", "country",
                "preferred_language", "preferred_contact_method",
                "marketing_consent", "privacy_consent",
            },
            "leads": {
                "id", "reference_number", "customer_id", "anonymous_session_id",
                "name", "email", "phone", "property_interest",
                "property_interests", "collection_interests", "bedroom_preference",
                "budget_range", "buying_purpose", "purchase_timeframe", "score",
                "lead_score", "follow_up_status", "lead_status", "source_platform",
                "campaign_name", "utm_source", "utm_medium", "utm_campaign",
                "utm_content", "utm_term", "landing_page", "referral_url",
                "last_activity_at",
            },
            "enquiries": {
                "id", "reference_number", "lead_id", "enquiry_type", "message",
                "preferred_contact_time", "payload", "score", "follow_up_status",
                "notification_status",
            },
            "lead_activities": {
                "id", "lead_id", "reference_number", "activity_type", "summary",
                "campaign", "created_at",
            },
            "enquiry_reference_sequence": {"id"},
        }

        schema_ok = True
        for table, expected in required_columns.items():
            rows = await connection.fetch(
                """
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = $1
                """,
                table,
            )
            actual = {row["column_name"] for row in rows}
            missing = sorted(expected - actual)
            if missing:
                schema_ok = False
                print(f"{table}: missing columns -> {', '.join(missing)}")
            else:
                print(f"{table}: schema OK")

        migration_020 = await connection.fetchval(
            "SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE filename = $1)",
            "020_enquiry_pipeline_compatibility.sql",
        )
        print(f"migration 020 applied: {'yes' if migration_020 else 'no'}")

        if not schema_ok or not migration_020:
            raise SystemExit(
                "Database schema is not current. Run: python backend/scripts/run_migrations.py"
            )
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(main())
