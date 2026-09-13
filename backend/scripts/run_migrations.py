from __future__ import annotations

import argparse
import asyncio
import hashlib
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
from migration_manifest import POSTGRES_MIGRATION_FILES, POSTGRES_SEED_FILES

DATABASE_DIR = Path(
    os.getenv("ONIRIA_DATABASE_DIR", str(PROJECT_ROOT / "database"))
).resolve()
MIGRATIONS = DATABASE_DIR / "migrations"
SEEDS = DATABASE_DIR / "seed"


def database_url() -> str:
    try:
        settings = get_settings()
    except Exception as exc:
        raise SystemExit(f"Settings validation failed: {exc}") from exc
    if not settings.asyncpg_database_url:
        raise SystemExit(
            "DATABASE_URL or POSTGRES_HOST, POSTGRES_DATABASE, "
            "POSTGRES_USER and POSTGRES_PASSWORD are required."
        )
    return settings.asyncpg_database_url


def checksum(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


async def ensure_migration_table(connection) -> None:
    await connection.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations (
          filename varchar(255) PRIMARY KEY,
          checksum char(64) NOT NULL,
          applied_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
    )


async def apply_migration(connection, path: Path) -> str:
    digest = checksum(path)
    existing = await connection.fetchrow(
        "SELECT checksum FROM schema_migrations WHERE filename = $1", path.name
    )
    if existing:
        if existing["checksum"] != digest:
            raise RuntimeError(
                f"Migration {path.name} was already applied but its checksum changed. "
                "Create a new migration instead of editing an applied migration."
            )
        return "already applied"

    sql_text = path.read_text(encoding="utf-8").strip()
    async with connection.transaction():
        if sql_text:
            await connection.execute(sql_text)
        await connection.execute(
            "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)",
            path.name,
            digest,
        )
    return "applied"


async def apply_seed(connection, path: Path) -> None:
    sql_text = path.read_text(encoding="utf-8").strip()
    if not sql_text:
        return
    async with connection.transaction():
        await connection.execute(sql_text)


async def main(*, seed: bool) -> None:
    if asyncpg is None:
        raise SystemExit(
            "asyncpg is not installed. Install backend requirements first."
        )

    try:
        connection = await asyncpg.connect(
            database_url(), statement_cache_size=0
        )
    except Exception as exc:
        raise SystemExit(f"Could not connect to PostgreSQL: {exc}") from exc

    try:
        await ensure_migration_table(connection)
        for file_name in POSTGRES_MIGRATION_FILES:
            path = MIGRATIONS / file_name
            status = await apply_migration(connection, path)
            print(f"Migration {file_name}: {status}")

        if seed:
            for seed_name in POSTGRES_SEED_FILES:
                path = SEEDS / seed_name
                print(f"Applying seed {seed_name}")
                await apply_seed(connection, path)
            print("Reference seed data applied.")
        else:
            print("Seed data skipped. Use --seed for the initial/reference-data load.")
    except Exception as exc:
        raise SystemExit(f"Migration failed: {exc}") from exc
    finally:
        await connection.close()

    print("PostgreSQL migrations completed successfully.")


def cli() -> None:
    parser = argparse.ArgumentParser(
        description="Apply ONIRIA PostgreSQL migrations safely."
    )
    parser.add_argument(
        "--seed",
        action="store_true",
        help="also apply the idempotent reference/catalogue seed files",
    )
    args = parser.parse_args()

    for file_name in POSTGRES_MIGRATION_FILES:
        path = MIGRATIONS / file_name
        if not path.exists():
            raise SystemExit(f"Missing migration file: {path}")
    for seed_name in POSTGRES_SEED_FILES:
        path = SEEDS / seed_name
        if not path.exists():
            raise SystemExit(f"Missing seed file: {path}")

    asyncio.run(main(seed=args.seed))


if __name__ == "__main__":
    cli()
