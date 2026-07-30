from __future__ import annotations

import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any
from urllib.parse import unquote, urlparse

from app.config import Settings

logger = logging.getLogger(__name__)

try:
    import aiomysql
except ModuleNotFoundError:
    aiomysql = None


class Database:
    def __init__(self) -> None:
        self.pool: Any | None = None

    @property
    def is_configured(self) -> bool:
        return self.pool is not None

    async def connect(self, settings: Settings) -> None:
        if self.pool is not None:
            logger.info("MySQL connection pool is already established")
            return

        if not settings.database_url and not settings.has_mysql_connection_settings:
            logger.warning(
                "MySQL is not configured; using seeded public content data"
            )
            return

        if aiomysql is None:
            raise RuntimeError(
                "aiomysql is required when MySQL is configured. "
                "Install backend requirements first."
            )

        connection_params = (
            self._parse_mysql_url(settings.database_url)
            if settings.database_url
            else settings.mysql_connection_params
        )

        if not connection_params:
            logger.warning(
                "MySQL settings are incomplete; using seeded public content data"
            )
            return

        logger.info(
            "MySQL configuration loaded",
            extra={
                **settings.mysql_log_summary,
                "env_file": str(settings.resolved_env_file),
                "configuration_source": settings.mysql_configuration_source,
            },
        )

        last_error: Exception | None = None
        max_attempts = 10

        for attempt in range(1, max_attempts + 1):
            try:
                self.pool = await aiomysql.create_pool(
                    **connection_params,
                    minsize=settings.database_min_size,
                    maxsize=max(
                        settings.database_max_size,
                        settings.mysql_pool_size,
                    ),
                    autocommit=True,
                    charset="utf8mb4",
                    connect_timeout=15,
                )
                break

            except Exception as exc:
                last_error = exc

                logger.warning(
                    "MySQL connection attempt %s/%s failed: %s",
                    attempt,
                    max_attempts,
                    self._safe_connection_error(exc),
                )

                if attempt < max_attempts:
                    await asyncio.sleep(2)

        if self.pool is None:
            detail = self._safe_connection_error(last_error)
            raise RuntimeError(
                f"Could not connect to MySQL: {detail}"
            ) from last_error

        logger.info(
            "MySQL connection pool established",
            extra={
                **settings.mysql_log_summary,
                "env_file": str(settings.resolved_env_file),
                "configuration_source": settings.mysql_configuration_source,
            },
        )

    async def disconnect(self) -> None:
        if self.pool is None:
            return

        self.pool.close()
        await self.pool.wait_closed()
        self.pool = None

        logger.info("MySQL connection pool closed")

    async def healthcheck(self) -> bool:
        if self.pool is None:
            return False

        try:
            result = await self.fetchval("SELECT 1")
            return result == 1
        except Exception:
            logger.exception("MySQL health check failed")
            return False

    async def fetch(
        self,
        query: str,
        *params: Any,
    ) -> list[dict[str, Any]]:
        pool = self._require_pool()

        async with pool.acquire() as connection:
            async with connection.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, params)
                rows = await cursor.fetchall()
                return list(rows)

    async def fetchrow(
        self,
        query: str,
        *params: Any,
    ) -> dict[str, Any] | None:
        pool = self._require_pool()

        async with pool.acquire() as connection:
            async with connection.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, params)
                return await cursor.fetchone()

    async def fetchval(
        self,
        query: str,
        *params: Any,
    ) -> Any:
        pool = self._require_pool()

        async with pool.acquire() as connection:
            async with connection.cursor() as cursor:
                await cursor.execute(query, params)
                row = await cursor.fetchone()
                return row[0] if row else None

    async def insert_and_get_id(
        self,
        query: str,
        *params: Any,
    ) -> int:
        pool = self._require_pool()

        async with pool.acquire() as connection:
            async with connection.cursor() as cursor:
                await cursor.execute(query, params)
                return int(cursor.lastrowid)

    async def execute(
        self,
        query: str,
        *params: Any,
    ) -> int:
        pool = self._require_pool()

        async with pool.acquire() as connection:
            async with connection.cursor() as cursor:
                return int(await cursor.execute(query, params))

    @asynccontextmanager
    async def transaction(self) -> AsyncIterator[Any]:
        pool = self._require_pool()

        async with pool.acquire() as connection:
            await connection.begin()

            try:
                yield connection
            except Exception:
                await connection.rollback()
                raise
            else:
                await connection.commit()

    def _require_pool(self) -> Any:
        if self.pool is None:
            raise RuntimeError("Database pool is not configured")

        return self.pool

    def _parse_mysql_url(
        self,
        database_url: str,
    ) -> dict[str, Any]:
        parsed = urlparse(database_url)

        if parsed.scheme not in {
            "mysql",
            "mysql+pymysql",
            "mysql+aiomysql",
        }:
            raise ValueError(
                "DATABASE_URL must use mysql://, mysql+pymysql://, "
                "or mysql+aiomysql://"
            )

        if not parsed.hostname or not parsed.path.strip("/"):
            raise ValueError(
                "DATABASE_URL must include a hostname and database name"
            )

        return {
            "host": parsed.hostname,
            "port": parsed.port or 3306,
            "user": unquote(parsed.username or ""),
            "password": unquote(parsed.password or ""),
            "db": parsed.path.lstrip("/"),
        }

    def _safe_connection_error(
        self,
        exc: Exception | None,
    ) -> str:
        if exc is None:
            return "unknown connection error"

        message = str(exc)
        lowered = message.lower()

        if "access denied" in lowered:
            return (
                "access denied for the configured MySQL user; "
                "check MYSQL_USER and MYSQL_PASSWORD"
            )

        if (
            "can't connect" in lowered
            or "connect call failed" in lowered
            or "connection refused" in lowered
        ):
            return (
                "could not reach MySQL; check MYSQL_HOST, MYSQL_PORT "
                "and whether the MySQL server is running"
            )

        if "unknown database" in lowered:
            return "the configured MySQL database does not exist"

        if "timed out" in lowered:
            return "the MySQL connection timed out"

        return f"{exc.__class__.__name__}: {message}"


db = Database()
