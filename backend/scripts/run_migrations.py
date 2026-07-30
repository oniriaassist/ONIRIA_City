from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path
from typing import Any

try:
    import aiomysql
except ModuleNotFoundError:
    aiomysql = None


SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = SCRIPT_DIR.parent
PROJECT_ROOT = BACKEND_ROOT.parent

sys.path.insert(0, str(SCRIPT_DIR))
sys.path.insert(0, str(BACKEND_ROOT))

from migration_manifest import (
    MYSQL_MIGRATION_FILES,
    MYSQL_SEED_FILES,
)
from app.config import get_settings


DATABASE_DIR = Path(
    os.getenv(
        "ONIRIA_DATABASE_DIR",
        str(PROJECT_ROOT / "database"),
    )
).resolve()

MIGRATIONS = DATABASE_DIR / "migrations"
SEEDS = DATABASE_DIR / "seed"


def mysql_settings(
    database: str | None = None,
) -> dict[str, Any]:
    try:
        app_settings = get_settings()
        connection_params = app_settings.mysql_connection_params
    except Exception as exc:
        raise SystemExit(
            f"Settings validation failed: {exc}"
        ) from exc

    if not connection_params:
        raise SystemExit(
            "DATABASE_URL or MYSQL_HOST, MYSQL_DATABASE, "
            "MYSQL_USER and MYSQL_PASSWORD are required."
        )

    settings: dict[str, Any] = {
        **connection_params,
        "charset": "utf8mb4",
        "autocommit": True,
        "connect_timeout": 15,
    }

    if database:
        settings["db"] = database

    return settings


def split_mysql_script(
    sql_text: str,
) -> list[str]:
    statements: list[str] = []
    delimiter = ";"
    buffer: list[str] = []

    for raw_line in sql_text.splitlines():
        line = raw_line.strip()

        if line.upper().startswith("DELIMITER "):
            pending = "\n".join(buffer).strip()

            if pending:
                statements.append(pending)

            buffer = []
            delimiter = line.split(maxsplit=1)[1]
            continue

        buffer.append(raw_line)
        current = "\n".join(buffer).strip()

        if current.endswith(delimiter):
            statement = current[: -len(delimiter)].strip()

            if statement:
                statements.append(statement)

            buffer = []

    pending = "\n".join(buffer).strip()

    if pending:
        statements.append(pending)

    return [
        statement
        for statement in statements
        if statement
        and any(
            line.strip()
            and not line.strip().startswith("--")
            for line in statement.splitlines()
        )
    ]


async def apply_sql(
    cursor: Any,
    path: Path,
) -> None:
    print(f"Applying {path}")

    sql_text = path.read_text(encoding="utf-8")

    for statement in split_mysql_script(sql_text):
        await cursor.execute(statement)


async def main() -> None:
    if aiomysql is None:
        raise SystemExit(
            "aiomysql is not installed. Run: "
            r"backend\.venv\Scripts\python.exe -m pip install "
            r"-r backend\requirements.txt"
        )

    try:
        connection = await aiomysql.connect(
            **mysql_settings()
        )
    except Exception as exc:
        raise SystemExit(
            f"Could not connect to MySQL: {exc}"
        ) from exc

    try:
        async with connection.cursor() as cursor:
            for file_name in MYSQL_MIGRATION_FILES:
                await apply_sql(
                    cursor,
                    MIGRATIONS / file_name,
                )

            for seed_name in MYSQL_SEED_FILES:
                seed_path = SEEDS / seed_name

                if seed_path.exists():
                    await apply_sql(
                        cursor,
                        seed_path,
                    )

    except Exception as exc:
        raise SystemExit(
            f"Migration failed: {exc}"
        ) from exc

    finally:
        connection.close()

    print("Migrations and safe seed data applied.")


def cli() -> None:
    for file_name in MYSQL_MIGRATION_FILES:
        path = MIGRATIONS / file_name

        if not path.exists():
            raise SystemExit(
                f"Missing migration file: {path}"
            )

    for seed_name in MYSQL_SEED_FILES:
        path = SEEDS / seed_name

        if not path.exists():
            raise SystemExit(
                f"Missing seed file: {path}"
            )

    asyncio.run(main())


if __name__ == "__main__":
    cli()
    