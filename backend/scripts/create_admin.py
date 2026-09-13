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
    bootstrap_administrator,
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

    return settings.asyncpg_database_url, settings


async def main() -> None:
    database_url, settings = connection_url()

    try:
        connection = await asyncpg.connect(database_url, statement_cache_size=0)
    except Exception as exc:
        raise SystemExit(
            f"Could not connect to PostgreSQL: {exc}"
        ) from exc

    try:
        async with connection.transaction():
            result = await bootstrap_administrator(
                connection,
                settings,
            )

            verification = await verify_administrator(
                connection,
                str(settings.oniria_admin_email),
            )

            if (
                not verification.active
                or not verification.has_administrator_role
            ):
                raise SystemExit(
                    "Administrator verification failed after bootstrap."
                )

        print(result.status)

    except ValueError as exc:
        raise SystemExit(str(exc)) from exc

    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(main())
