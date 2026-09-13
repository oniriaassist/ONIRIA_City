from __future__ import annotations

import asyncio
import json
import logging
import re
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from app.config import Settings

logger = logging.getLogger(__name__)

try:
    import asyncpg
except ModuleNotFoundError:
    asyncpg = None


_PLACEHOLDER_RE = re.compile(r"%s")


class Database:
    def __init__(self) -> None:
        self.pool: Any | None = None

    @property
    def is_configured(self) -> bool:
        return self.pool is not None

    async def connect(self, settings: Settings) -> None:
        if self.pool is not None:
            logger.info("PostgreSQL connection pool is already established")
            return

        if not settings.effective_database_url:
            logger.warning(
                "PostgreSQL is not configured; using seeded public content data"
            )
            return

        if asyncpg is None:
            raise RuntimeError(
                "asyncpg is required when PostgreSQL is configured. "
                "Install backend requirements first."
            )

        logger.info(
            "PostgreSQL configuration loaded",
            extra={
                **settings.database_log_summary,
                "env_file": str(settings.resolved_env_file),
                "configuration_source": settings.database_configuration_source,
            },
        )

        last_error: Exception | None = None
        max_attempts = 10

        for attempt in range(1, max_attempts + 1):
            try:
                self.pool = await asyncpg.create_pool(
                    dsn=settings.asyncpg_database_url,
                    min_size=settings.database_min_size,
                    max_size=settings.database_max_size,
                    timeout=15,
                    statement_cache_size=0,
                    init=self._init_connection,
                )
                break

            except Exception as exc:
                last_error = exc

                logger.warning(
                    "PostgreSQL connection attempt %s/%s failed: %s",
                    attempt,
                    max_attempts,
                    self._safe_connection_error(exc),
                )

                if attempt < max_attempts:
                    await asyncio.sleep(2)

        if self.pool is None:
            detail = self._safe_connection_error(last_error)
            raise RuntimeError(
                f"Could not connect to PostgreSQL: {detail}"
            ) from last_error

        logger.info(
            "PostgreSQL connection pool established",
            extra={
                **settings.database_log_summary,
                "env_file": str(settings.resolved_env_file),
                "configuration_source": settings.database_configuration_source,
            },
        )

    async def disconnect(self) -> None:
        if self.pool is None:
            return

        await self.pool.close()
        self.pool = None

        logger.info("PostgreSQL connection pool closed")

    async def healthcheck(self) -> bool:
        if self.pool is None:
            return False

        try:
            result = await self.fetchval("SELECT 1")
            return result == 1
        except Exception:
            logger.exception("PostgreSQL health check failed")
            return False

    async def fetch(
        self,
        query: str,
        *params: Any,
    ) -> list[dict[str, Any]]:
        pool = self._require_pool()
        rows = await pool.fetch(self._convert_query(query), *params)
        return [dict(row) for row in rows]

    async def fetchrow(
        self,
        query: str,
        *params: Any,
    ) -> dict[str, Any] | None:
        pool = self._require_pool()
        row = await pool.fetchrow(self._convert_query(query), *params)
        return dict(row) if row else None

    async def fetchval(
        self,
        query: str,
        *params: Any,
    ) -> Any:
        pool = self._require_pool()
        return await pool.fetchval(self._convert_query(query), *params)

    async def insert_and_get_id(
        self,
        query: str,
        *params: Any,
    ) -> int:
        query = query.strip().rstrip(";")
        if " returning " not in query.lower():
            query = f"{query} RETURNING id"
        value = await self.fetchval(query, *params)
        return int(value)

    async def execute(
        self,
        query: str,
        *params: Any,
    ) -> int:
        pool = self._require_pool()
        result = await pool.execute(self._convert_query(query), *params)
        return self._rows_affected(result)

    @asynccontextmanager
    async def transaction(self) -> AsyncIterator["PostgresTransaction"]:
        pool = self._require_pool()

        async with pool.acquire() as connection:
            async with connection.transaction():
                yield PostgresTransaction(connection, self._convert_query)

    def _require_pool(self) -> Any:
        if self.pool is None:
            raise RuntimeError("Database pool is not configured")

        return self.pool

    async def _init_connection(self, connection: Any) -> None:
        await connection.set_type_codec(
            "json",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
        )
        await connection.set_type_codec(
            "jsonb",
            encoder=json.dumps,
            decoder=json.loads,
            schema="pg_catalog",
        )

    def _convert_query(self, query: str) -> str:
        index = 0

        def replace(_: re.Match[str]) -> str:
            nonlocal index
            index += 1
            return f"${index}"

        return _PLACEHOLDER_RE.sub(replace, query)

    def _rows_affected(self, command_tag: str) -> int:
        try:
            return int(command_tag.rsplit(" ", 1)[-1])
        except (TypeError, ValueError):
            return 0

    def _safe_connection_error(
        self,
        exc: Exception | None,
    ) -> str:
        if exc is None:
            return "unknown connection error"

        message = str(exc)
        lowered = message.lower()

        if "password authentication failed" in lowered:
            return (
                "authentication failed for the configured PostgreSQL user; "
                "check DATABASE_URL or POSTGRES_PASSWORD"
            )

        if (
            "connection refused" in lowered
            or "connect call failed" in lowered
            or "name or service not known" in lowered
        ):
            return (
                "could not reach PostgreSQL; check host, port and whether "
                "the database is accepting connections"
            )

        if "does not exist" in lowered:
            return "the configured PostgreSQL database or role does not exist"

        if "timed out" in lowered:
            return "the PostgreSQL connection timed out"

        return f"{exc.__class__.__name__}: {message}"


class PostgresTransaction:
    def __init__(self, connection: Any, convert_query: Any) -> None:
        self.connection = connection
        self._convert_query = convert_query

    async def fetch(
        self,
        query: str,
        *params: Any,
    ) -> list[dict[str, Any]]:
        rows = await self.connection.fetch(self._convert_query(query), *params)
        return [dict(row) for row in rows]

    async def fetchrow(
        self,
        query: str,
        *params: Any,
    ) -> dict[str, Any] | None:
        row = await self.connection.fetchrow(self._convert_query(query), *params)
        return dict(row) if row else None

    async def fetchval(
        self,
        query: str,
        *params: Any,
    ) -> Any:
        return await self.connection.fetchval(self._convert_query(query), *params)

    async def execute(
        self,
        query: str,
        *params: Any,
    ) -> int:
        result = await self.connection.execute(self._convert_query(query), *params)
        try:
            return int(result.rsplit(" ", 1)[-1])
        except (TypeError, ValueError):
            return 0

    async def insert_and_get_id(
        self,
        query: str,
        *params: Any,
    ) -> int:
        query = query.strip().rstrip(";")
        if " returning " not in query.lower():
            query = f"{query} RETURNING id"
        value = await self.fetchval(query, *params)
        return int(value)


db = Database()
