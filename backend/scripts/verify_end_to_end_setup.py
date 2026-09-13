from __future__ import annotations

import asyncio
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
from migration_manifest import POSTGRES_MIGRATION_FILES

ROOT = BACKEND_DIR.parent
REQUIRED_TABLES = (
    "staff_users",
    "staff_roles",
    "staff_user_roles",
    "staff_sessions",
    "customers",
    "leads",
    "enquiries",
    "lead_activities",
    "brochure_requests",
    "consultations",
    "site_visits",
    "newsletter_subscriptions",
    "audit_logs",
)


def print_check(label: str, ok: bool, detail: str | None = None) -> None:
    suffix = f" ({detail})" if detail else ""
    print(f"{label}: {'yes' if ok else 'no'}{suffix}")


async def table_exists(connection, table_name: str) -> bool:
    return bool(
        await connection.fetchval(
            """
            SELECT EXISTS (
              SELECT 1
              FROM information_schema.tables
              WHERE table_schema = 'public' AND table_name = $1
            )
            """,
            table_name,
        )
    )


async def main() -> int:
    if asyncpg is None:
        print("asyncpg installed: no")
        return 1

    settings = get_settings()
    print(f"Environment file: {settings.resolved_env_file}")
    print(f"Configuration source: {settings.database_configuration_source}")
    summary = settings.database_log_summary
    print(f"Host: {summary.get('postgres_host')}")
    print(f"Port: {summary.get('postgres_port')}")
    print(f"Database: {summary.get('postgres_database')}")
    print(f"User: {summary.get('postgres_user')}")

    migration_dir = ROOT / "database" / "migrations"
    missing_migrations = [name for name in POSTGRES_MIGRATION_FILES if not (migration_dir / name).exists()]
    print_check("Active migration files present", not missing_migrations, f"{len(POSTGRES_MIGRATION_FILES)} expected")
    if missing_migrations:
        print(f"Missing migration files: {', '.join(missing_migrations)}")
        return 1

    if not settings.effective_database_url:
        print("PostgreSQL configuration complete: no")
        return 1

    try:
        connection = await asyncpg.connect(settings.effective_database_url)
    except Exception as exc:
        print(f"PostgreSQL reachable: no ({exc.__class__.__name__})")
        return 1

    try:
        print_check("PostgreSQL reachable", True)
        table_results = {}
        for table in REQUIRED_TABLES:
            table_results[table] = await table_exists(connection, table)
        print_check("Required tables exist", all(table_results.values()))
        for table, exists in table_results.items():
            print_check(f"Table {table}", exists)

        admin_email = settings.oniria_admin_email
        if admin_email:
            admin = await connection.fetchrow(
                """
                SELECT su.is_active,
                       EXISTS (
                           SELECT 1
                           FROM staff_user_roles sur
                           JOIN staff_roles sr ON sr.id = sur.role_id
                           WHERE sur.staff_user_id = su.id AND sr.role_key = 'administrator'
                       ) AS has_administrator_role
                FROM staff_users su
                WHERE LOWER(su.email) = LOWER($1)
                LIMIT 1
                """,
                admin_email,
            )
            print_check("Administrator exists", bool(admin))
            print_check("Administrator active", bool(admin and admin["is_active"]))
            print_check("Administrator role assigned", bool(admin and admin["has_administrator_role"]))
        else:
            print_check("Administrator email configured", False)

        print_check("Newsletter table available", table_results.get("newsletter_subscriptions", False))
        print_check("Enquiry dependencies available", all(table_results.get(table, False) for table in ("customers", "leads", "enquiries", "lead_activities")))
        resend_enabled = (settings.mail_provider or "").lower() == "resend"
        resend_ready = bool(settings.resend_api_key and settings.mail_from and settings.sales_notification_recipient_list)
        print_check("Resend enabled", resend_enabled)
        if resend_enabled:
            print_check("Resend configuration complete", resend_ready)
    finally:
        await connection.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
