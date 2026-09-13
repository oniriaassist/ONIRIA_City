from __future__ import annotations

import asyncio
import sys
from pathlib import Path

try:
    import asyncpg
except ModuleNotFoundError:
    raise SystemExit(
        "asyncpg is not installed. Run: "
        r"backend\.venv\Scripts\python.exe -m pip install "
        r"-r backend\requirements.txt"
    )


BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.config import get_settings
from app.services.admin_bootstrap_service import (
    verify_administrator,
)


def connection_url():
    try:
        settings = get_settings()
    except Exception as exc:
        raise SystemExit(
            f"Settings validation failed: {exc}"
        ) from exc

    if not settings.effective_database_url:
        raise SystemExit(
            "Required values are missing: DATABASE_URL or POSTGRES_HOST, "
            "POSTGRES_DATABASE, POSTGRES_USER and POSTGRES_PASSWORD"
        )

    if not settings.oniria_admin_email:
        raise SystemExit(
            "Required values are missing: ONIRIA_ADMIN_EMAIL"
        )

    return settings.effective_database_url, settings


async def main() -> None:
    database_url, settings = connection_url()

    try:
        connection = await asyncpg.connect(database_url)
    except Exception as exc:
        raise SystemExit(
            f"Could not connect to PostgreSQL: {exc}"
        ) from exc

    try:
        result = await verify_administrator(
            connection,
            str(settings.oniria_admin_email),
        )
    finally:
        await connection.close()

    print(f"Administrator email: {result.email}")
    print(f"Active: {'yes' if result.active else 'no'}")
    print(
        "Administrator role: "
        f"{'yes' if result.has_administrator_role else 'no'}"
    )

    if (
        not result.active
        or not result.has_administrator_role
    ):
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
