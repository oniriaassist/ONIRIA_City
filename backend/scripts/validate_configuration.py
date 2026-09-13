from __future__ import annotations

import asyncio
import sys
from pathlib import Path

try:
    import asyncpg
except ModuleNotFoundError:
    asyncpg = None

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import POSTGRES_SCHEMES, get_settings
from scripts.migration_manifest import POSTGRES_MIGRATION_FILES, POSTGRES_SEED_FILES

ROOT = Path(__file__).resolve().parents[2]


def check_static_configuration() -> list[str]:
    errors: list[str] = []
    try:
        settings = get_settings()
    except Exception as exc:
        return [f"settings validation failed: {exc}"]

    if settings.database_url:
        scheme = settings.database_url.split(":", 1)[0]
        if scheme not in POSTGRES_SCHEMES:
            errors.append("effective database scheme is not PostgreSQL")
    elif not settings.has_postgres_connection_settings:
        errors.append("database is not configured")

    for file_name in POSTGRES_MIGRATION_FILES:
        if not (ROOT / "database" / "migrations" / file_name).exists():
            errors.append(f"missing migration: {file_name}")
    for file_name in POSTGRES_SEED_FILES:
        if not (ROOT / "database" / "seed" / file_name).exists():
            errors.append(f"missing seed: {file_name}")

    staff_roles = ROOT / "database" / "seed" / "staff_roles.sql"
    if "administrator" not in staff_roles.read_text(encoding="utf-8"):
        errors.append("staff_roles.sql does not contain administrator")

    if (settings.mail_provider or "").strip().lower() == "resend":
        required = {
            "RESEND_API_KEY": settings.resend_api_key,
            "MAIL_FROM": settings.mail_from,
            "SALES_NOTIFICATION_EMAIL or SALES_NOTIFICATION_EMAILS": settings.sales_notification_recipient_list,
        }
        for name, value in required.items():
            if not value:
                errors.append(f"missing email setting: {name}")
    return errors


async def check_database_configuration() -> list[str]:
    errors: list[str] = []
    try:
        settings = get_settings()
    except Exception:
        return []
    if asyncpg is None:
        return ["asyncpg is not installed"]
    if not settings.effective_database_url:
        return ["DATABASE_URL or POSTGRES_* values are required for database validation"]

    connection = await asyncpg.connect(settings.effective_database_url)
    try:
        role = await connection.fetchrow("SELECT id FROM staff_roles WHERE role_key = 'administrator' LIMIT 1")
        if not role:
            errors.append("administrator role is missing")
        if settings.oniria_admin_email:
            staff = await connection.fetchrow(
                "SELECT id, is_active FROM staff_users WHERE email = $1 LIMIT 1",
                settings.oniria_admin_email.lower(),
            )
            if not staff:
                errors.append("configured admin does not exist")
            elif not bool(staff["is_active"]):
                errors.append("configured admin is inactive")
            elif role:
                has_role = await connection.fetchval(
                    """
                    SELECT EXISTS (
                        SELECT 1
                        FROM staff_user_roles
                        WHERE staff_user_id = $1 AND role_id = $2
                    )
                    """,
                    staff["id"],
                    role["id"],
                )
                if not has_role:
                    errors.append("configured admin is missing administrator role")
        else:
            errors.append("ONIRIA_ADMIN_EMAIL is not configured")
    finally:
        await connection.close()
    return errors


async def main() -> None:
    errors = check_static_configuration()
    errors.extend(await check_database_configuration())
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        raise SystemExit(1)
    print("Configuration validation passed.")


if __name__ == "__main__":
    asyncio.run(main())
