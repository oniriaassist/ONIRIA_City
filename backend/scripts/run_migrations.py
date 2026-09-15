from __future__ import annotations

import argparse
import asyncio
import hashlib
import os
import sys
from pathlib import Path
from urllib.parse import parse_qsl, quote, urlencode, urlparse, urlunparse

try:
    import asyncpg
except ModuleNotFoundError:
    asyncpg = None

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_ROOT = SCRIPT_DIR.parent
PROJECT_ROOT = BACKEND_ROOT.parent

sys.path.insert(0, str(SCRIPT_DIR))
sys.path.insert(0, str(BACKEND_ROOT))

from migration_manifest import POSTGRES_MIGRATION_FILES, POSTGRES_SEED_FILES

DATABASE_DIR = Path(
    os.getenv("ONIRIA_DATABASE_DIR", str(PROJECT_ROOT / "database"))
).resolve()
MIGRATIONS = DATABASE_DIR / "migrations"
SEEDS = DATABASE_DIR / "seed"
ENV_FILES = (PROJECT_ROOT / ".env", BACKEND_ROOT / ".env")
POSTGRES_SCHEMES = {"postgres", "postgresql", "postgresql+asyncpg"}
DATABASE_URL_PLACEHOLDERS = {
    "YOUR_PRODUCTION_SUPABASE_DATABASE_URL",
    "<SUPABASE_DATABASE_URL>",
    "<SUPABASE_SESSION_POOLER_OR_DIRECT_URL>",
    "<DATABASE_URL>",
}


def is_database_url_placeholder(value: str) -> bool:
    return value in DATABASE_URL_PLACEHOLDERS or value.startswith("YOUR_")


def parse_env_file(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}

    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if "#" in value and not value.startswith(("'", '"')):
            value = value.split("#", 1)[0].strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        if key:
            values[key] = value
    return values


def env_value_with_source(key: str) -> tuple[str | None, str | None]:
    value = os.getenv(key)
    if value is not None and value.strip():
        value = value.strip()
        if key != "DATABASE_URL" or not is_database_url_placeholder(value):
            return value, "current shell environment"

    for env_file in reversed(ENV_FILES):
        file_value = parse_env_file(env_file).get(key)
        if file_value and file_value.strip():
            file_value = file_value.strip()
            if key != "DATABASE_URL" or not is_database_url_placeholder(file_value):
                return file_value, str(env_file)

    return None, None


def env_value(key: str) -> str | None:
    value, _source = env_value_with_source(key)
    return value


def redact_database_url(value: str) -> str:
    parsed = urlparse(value)
    if not parsed.scheme or not parsed.netloc:
        return "<not a URL>"

    username = parsed.username or ""
    hostname = parsed.hostname or ""
    port = f":{parsed.port}" if parsed.port else ""
    path = parsed.path or ""
    return f"{parsed.scheme}://{username}:***@{hostname}{port}{path}"


def normalize_database_url(value: str) -> str:
    if is_database_url_placeholder(value):
        raise SystemExit(
            "DATABASE_URL is still a placeholder. Replace it with the real "
            "Supabase PostgreSQL connection string from Supabase Dashboard "
            "> Project Settings > Database > Connection string."
        )

    if r"\@" in value:
        raise SystemExit(
            "DATABASE_URL contains \\@. Backslash does not escape @ in a "
            "PostgreSQL URL. If your password contains @, replace it with "
            "%40. Example: password Oniria_2026.@ becomes Oniria_2026.%40"
        )

    parsed = urlparse(value)
    if parsed.scheme not in POSTGRES_SCHEMES:
        raise SystemExit(
            "DATABASE_URL must be a PostgreSQL URL, for example "
            "postgresql://postgres.<project-ref>:<password>@"
            "aws-0-<region>.pooler.supabase.com:6543/postgres"
        )
    if not parsed.hostname or not parsed.path.strip("/"):
        raise SystemExit("DATABASE_URL must include a host and database name.")

    scheme = (
        "postgresql"
        if parsed.scheme in {"postgres", "postgresql+asyncpg"}
        else parsed.scheme
    )
    query_items = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if "supabase" in (parsed.hostname or "").lower():
        query_items.setdefault("sslmode", "require")
    return urlunparse(parsed._replace(scheme=scheme, query=urlencode(query_items)))


def database_url() -> str:
    configured_database_url, _source = env_value_with_source("DATABASE_URL")
    if configured_database_url:
        return normalize_database_url(configured_database_url)

    postgres_host = env_value("POSTGRES_HOST")
    postgres_database = env_value("POSTGRES_DATABASE")
    postgres_user = env_value("POSTGRES_USER")
    postgres_password = env_value("POSTGRES_PASSWORD")
    postgres_port = env_value("POSTGRES_PORT") or "5432"

    if all([postgres_host, postgres_database, postgres_user, postgres_password]):
        return normalize_database_url(
            "postgresql://"
            f"{quote(postgres_user)}:{quote(postgres_password)}@"
            f"{postgres_host}:{postgres_port}/{postgres_database}"
        )

    env_locations = ", ".join(str(path) for path in ENV_FILES)
    raise SystemExit(
        "PostgreSQL database configuration is missing.\n"
        "Add your Supabase connection string to backend/.env as DATABASE_URL, "
        "or set POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_USER, "
        "and POSTGRES_PASSWORD.\n"
        f"Checked: {env_locations}"
    )


def checksum(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def executable_sql(sql_text: str) -> str:
    lines = [
        line
        for line in sql_text.splitlines()
        if line.strip() and not line.strip().startswith("--")
    ]
    return "\n".join(lines).strip()


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

    sql_text = executable_sql(path.read_text(encoding="utf-8"))
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
    sql_text = executable_sql(path.read_text(encoding="utf-8"))
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
    parser.add_argument(
        "--show-database-source",
        action="store_true",
        help="show where DATABASE_URL is being read from without printing the password",
    )
    args = parser.parse_args()

    if args.show_database_source:
        value, source = env_value_with_source("DATABASE_URL")
        if not value:
            print("DATABASE_URL is not set.")
        else:
            print(f"DATABASE_URL source: {source}")
            print(f"DATABASE_URL value: {redact_database_url(value)}")
        return

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
