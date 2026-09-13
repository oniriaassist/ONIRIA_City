from __future__ import annotations

import asyncio
import sys
from pathlib import Path

try:
    import asyncpg
except ModuleNotFoundError:
    asyncpg = None

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import get_settings


async def main() -> None:
    try:
        settings = get_settings()
    except Exception as exc:
        raise SystemExit(f"Settings validation failed: {exc}") from exc

    if not settings.effective_database_url:
        print(f"Environment file: {settings.resolved_env_file}")
        raise SystemExit(
            "Missing required environment values: DATABASE_URL or "
            "POSTGRES_HOST, POSTGRES_DATABASE, POSTGRES_USER, POSTGRES_PASSWORD"
        )

    summary = settings.database_log_summary
    print(f"Environment file: {settings.resolved_env_file}")
    print(f"Configuration source: {settings.database_configuration_source}")
    print(f"Host: {summary['postgres_host']}")
    print(f"Port: {summary['postgres_port']}")
    print(f"Database: {summary['postgres_database']}")
    print(f"User: {summary['postgres_user']}")

    if asyncpg is None:
        raise SystemExit("asyncpg is not installed. Run: backend\\.venv\\Scripts\\python.exe -m pip install -r backend\\requirements.txt")

    try:
        connection = await asyncpg.connect(settings.asyncpg_database_url, statement_cache_size=0)
    except Exception as exc:
        raise SystemExit(f"Connection: failed ({exc.__class__.__name__})") from exc

    try:
        staff_roles = await connection.fetchval("SELECT COUNT(*) FROM staff_roles")
        print("Connection: successful")
        print(f"staff_roles: {staff_roles}")
    finally:
        await connection.close()


if __name__ == "__main__":
    asyncio.run(main())
