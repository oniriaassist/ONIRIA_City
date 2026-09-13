from __future__ import annotations

import asyncio
import os
import sys
from pathlib import Path

try:
    import asyncpg
except ModuleNotFoundError:
    asyncpg = None


SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = SCRIPT_DIR.parent
PROJECT_ROOT = BACKEND_ROOT.parent

sys.path.insert(0, str(SCRIPT_DIR))
sys.path.insert(0, str(BACKEND_ROOT))

from app.config import get_settings
from migration_manifest import (
    POSTGRES_MIGRATION_FILES,
    POSTGRES_SEED_FILES,
)


DATABASE_DIR = Path(
    os.getenv(
        "ONIRIA_DATABASE_DIR",
        str(PROJECT_ROOT / "database"),
    )
).resolve()

MIGRATIONS = DATABASE_DIR / "migrations"
SEEDS = DATABASE_DIR / "seed"


def database_url() -> str:
    try:
        app_settings = get_settings()
    except Exception as exc:
        raise SystemExit(
            f"Settings validation failed: {exc}"
        ) from exc

    if not app_settings.effective_database_url:
        raise SystemExit(
            "DATABASE_URL or POSTGRES_HOST, POSTGRES_DATABASE, "
            "POSTGRES_USER and POSTGRES_PASSWORD are required."
        )

    return app_settings.effective_database_url


async def apply_sql(
    connection,
    path: Path,
) -> None:
    print(f"Applying {path}")
    sql_text = path.read_text(encoding="utf-8").strip()
    if sql_text:
        await connection.execute(sql_text)


async def main() -> None:
    if asyncpg is None:
        raise SystemExit(
            "asyncpg is not installed. Run: "
            r"backend\.venv\Scripts\python.exe -m pip install "
            r"-r backend\requirements.txt"
        )

    try:
        connection = await asyncpg.connect(database_url())
    except Exception as exc:
        raise SystemExit(
            f"Could not connect to PostgreSQL: {exc}"
        ) from exc

    try:
        async with connection.transaction():
            for file_name in POSTGRES_MIGRATION_FILES:
                await apply_sql(
                    connection,
                    MIGRATIONS / file_name,
                )

            for seed_name in POSTGRES_SEED_FILES:
                seed_path = SEEDS / seed_name

                if seed_path.exists():
                    await apply_sql(
                        connection,
                        seed_path,
                    )

    except Exception as exc:
        raise SystemExit(
            f"Migration failed: {exc}"
        ) from exc

    finally:
        await connection.close()

    print("PostgreSQL migrations and safe seed data applied.")


def cli() -> None:
    for file_name in POSTGRES_MIGRATION_FILES:
        path = MIGRATIONS / file_name

        if not path.exists():
            raise SystemExit(
                f"Missing migration file: {path}"
            )

    for seed_name in POSTGRES_SEED_FILES:
        path = SEEDS / seed_name

        if not path.exists():
            raise SystemExit(
                f"Missing seed file: {path}"
            )

    asyncio.run(main())


if __name__ == "__main__":
    cli()
