from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

import asyncpg

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent
SCRIPTS_DIR = Path(__file__).resolve().parent
for path in (BACKEND_DIR, SCRIPTS_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from app.config import get_settings
from migration_manifest import POSTGRES_MIGRATION_FILES


REQUIRED_TABLES = (
    "staff_users",
    "staff_roles",
    "staff_user_roles",
    "staff_sessions",
    "customers",
    "leads",
    "lead_activities",
    "enquiries",
    "newsletter_subscriptions",
)


def ok(label: str, passed: bool, detail: str | None = None) -> bool:
    status = "yes" if passed else "no"
    suffix = f" ({detail})" if detail else ""
    print(f"{label}: {status}{suffix}")
    return passed


def database_dir() -> Path:
    configured = os.getenv("ONIRIA_DATABASE_DIR")
    return Path(configured).resolve() if configured else (REPO_ROOT / "database").resolve()


def check_migration_files() -> bool:
    migrations_dir = database_dir() / "migrations"
    missing = [name for name in POSTGRES_MIGRATION_FILES if not (migrations_dir / name).exists()]
    return ok(
        "Migration files 001-018",
        not missing and len(POSTGRES_MIGRATION_FILES) == 18,
        None if not missing else f"missing {', '.join(missing)}",
    )


def check_email_configuration(settings) -> bool:
    provider = (settings.mail_provider or "").strip().lower()
    has_recipients = bool(settings.sales_notification_recipient_list)
    if provider == "smtp":
        ready = bool(settings.smtp_host and settings.mail_from and has_recipients)
        return ok("Email configuration", ready, None if ready else "missing SMTP host, sender, or recipient")
    if provider == "resend":
        ready = bool(settings.resend_api_key and settings.mail_from and has_recipients)
        return ok("Email configuration", ready, None if ready else "missing Resend key, sender, or recipient")
    return ok("Email configuration", False, "MAIL_PROVIDER is not smtp or resend")


def check_backend_health(backend_url: str | None) -> bool:
    if not backend_url:
        return ok("Backend health", False, "provide --backend-url")
    base = backend_url.rstrip("/")
    health_url = f"{base}/api/health" if not base.endswith("/api") else f"{base}/health"
    try:
        request = Request(health_url, headers={"Accept": "application/json"})
        with urlopen(request, timeout=10) as response:
            body = json.loads(response.read().decode("utf-8"))
        healthy = response.status == 200 and body.get("success") is True
    except (OSError, URLError, json.JSONDecodeError):
        healthy = False
    return ok("Backend health", healthy)


async def table_exists(connection, table: str) -> bool:
    return bool(
        await connection.fetchval(
            """
            SELECT EXISTS (
              SELECT 1
              FROM information_schema.tables
              WHERE table_schema = 'public' AND table_name = $1
            )
            """,
            table,
        )
    )


async def check_database(settings) -> bool:
    if not settings.effective_database_url:
        return ok("PostgreSQL connectivity", False, "missing PostgreSQL configuration")

    try:
        connection = await asyncpg.connect(settings.effective_database_url)
    except Exception:
        return ok("PostgreSQL connectivity", False)

    try:
        checks: list[bool] = [ok("PostgreSQL connectivity", True)]
        table_results = {table: await table_exists(connection, table) for table in REQUIRED_TABLES}
        missing_tables = [table for table, exists in table_results.items() if not exists]
        checks.append(ok("Required tables", not missing_tables, None if not missing_tables else f"missing {', '.join(missing_tables)}"))
        checks.append(ok("Newsletter table", table_results.get("newsletter_subscriptions", False)))

        admin_email = settings.oniria_admin_email
        if not admin_email:
            checks.append(ok("Active administrator", False, "ONIRIA_ADMIN_EMAIL missing"))
            checks.append(ok("Administrator role", False, "ONIRIA_ADMIN_EMAIL missing"))
        else:
            row = await connection.fetchrow(
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
            checks.append(ok("Active administrator", bool(row and row["is_active"])))
            checks.append(ok("Administrator role", bool(row and row["has_administrator_role"])))
        return all(checks)
    finally:
        await connection.close()


async def main() -> int:
    parser = argparse.ArgumentParser(description="Safely verify an Roho production backend setup.")
    parser.add_argument("--backend-url", default=os.getenv("ONIRIA_BACKEND_URL"), help="Backend origin, for example https://api.oniriacity.com")
    args = parser.parse_args()

    try:
        settings = get_settings()
    except Exception:
        print("Settings: no (configuration validation failed; check required Vercel variables)")
        return 1

    checks = [
        check_migration_files(),
        check_email_configuration(settings),
        check_backend_health(args.backend_url),
        await check_database(settings),
    ]
    return 0 if all(checks) else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
