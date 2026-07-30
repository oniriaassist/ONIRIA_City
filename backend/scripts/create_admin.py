from __future__ import annotations

import asyncio
import sys
from pathlib import Path
from typing import Any

try:
    import aiomysql
except ModuleNotFoundError:
    raise SystemExit(
        "aiomysql is not installed. Run: "
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


def connection_settings() -> tuple[dict[str, Any], Any]:
    try:
        settings = get_settings()
        connection_params = settings.mysql_connection_params
    except Exception as exc:
        raise SystemExit(
            f"Settings validation failed: {exc}"
        ) from exc

    if not connection_params:
        raise SystemExit(
            "Required values are missing: DATABASE_URL or MYSQL_HOST, "
            "MYSQL_DATABASE, MYSQL_USER and MYSQL_PASSWORD"
        )

    params: dict[str, Any] = {
        **connection_params,
        "autocommit": False,
        "charset": "utf8mb4",
        "connect_timeout": 15,
    }

    return params, settings


async def main() -> None:
    params, settings = connection_settings()

    try:
        connection = await aiomysql.connect(**params)
    except Exception as exc:
        raise SystemExit(
            f"Could not connect to MySQL: {exc}"
        ) from exc

    try:
        result = await bootstrap_administrator(
            connection,
            settings,
        )

        await connection.commit()

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
        await connection.rollback()
        raise SystemExit(str(exc)) from exc

    except BaseException:
        await connection.rollback()
        raise

    finally:
        connection.close()


if __name__ == "__main__":
    asyncio.run(main())

    