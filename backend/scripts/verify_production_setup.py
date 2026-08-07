from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
from urllib.error import URLError
from urllib.request import Request, urlopen

import aiomysql

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent
SCRIPTS_DIR = Path(__file__).resolve().parent
for path in (BACKEND_DIR, SCRIPTS_DIR):
    if str(path) not in sys.path:
        sys.path.insert(0, str(path))

from app.config import get_settings
from migration_manifest import MYSQL_MIGRATION_FILES


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
    missing = [name for name in MYSQL_MIGRATION_FILES if not (migrations_dir / name).exists()]
    return ok(
        "Migration files 001-016",
        not missing and len(MYSQL_MIGRATION_FILES) == 16,
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


async def table_exists(connection, database_name: str, table: str) -> bool:
    async with connection.cursor() as cursor:
        await cursor.execute(
            """
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_schema = %s AND table_name = %s
            """,
            (database_name, table),
        )
        row = await cursor.fetchone()
    return bool(row and int(row[0]) == 1)


async def check_database(settings) -> bool:
    params = settings.mysql_connection_params
    if not params:
        return ok("MySQL connectivity", False, "missing MySQL configuration")

    try:
        connection = await aiomysql.connect(**params)
    except Exception:
        return ok("MySQL connectivity", False)

    try:
        database_name = str(params["db"])
        checks: list[bool] = [ok("MySQL connectivity", True)]
        table_results = {table: await table_exists(connection, database_name, table) for table in REQUIRED_TABLES}
        missing_tables = [table for table, exists in table_results.items() if not exists]
        checks.append(ok("Required tables", not missing_tables, None if not missing_tables else f"missing {', '.join(missing_tables)}"))
        checks.append(ok("Newsletter table", table_results.get("newsletter_subscriptions", False)))

        admin_email = settings.oniria_admin_email
        if not admin_email:
            checks.append(ok("Active administrator", False, "ONIRIA_ADMIN_EMAIL missing"))
            checks.append(ok("Administrator role", False, "ONIRIA_ADMIN_EMAIL missing"))
        else:
            async with connection.cursor() as cursor:
                await cursor.execute(
                    """
                    SELECT su.is_active,
                           EXISTS (
                               SELECT 1
                               FROM staff_user_roles sur
                               JOIN staff_roles sr ON sr.id = sur.role_id
                               WHERE sur.staff_user_id = su.id AND sr.role_key = 'administrator'
                           ) AS has_administrator_role
                    FROM staff_users su
                    WHERE LOWER(su.email) = LOWER(%s)
                    LIMIT 1
                    """,
                    (admin_email,),
                )
                row = await cursor.fetchone()
            checks.append(ok("Active administrator", bool(row and row[0])))
            checks.append(ok("Administrator role", bool(row and row[1])))
        return all(checks)
    finally:
        connection.close()
        await connection.ensure_closed()


async def main() -> int:
    parser = argparse.ArgumentParser(description="Safely verify an ONIRIA City production backend setup.")
    parser.add_argument("--backend-url", default=os.getenv("ONIRIA_BACKEND_URL"), help="Backend origin, for example https://api.oniriacity.com")
    args = parser.parse_args()

    try:
        settings = get_settings()
    except Exception:
        print("Settings: no (configuration validation failed; check required Railway variables)")
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
