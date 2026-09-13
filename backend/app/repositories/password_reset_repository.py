from __future__ import annotations

from datetime import datetime
from typing import Any


class PasswordResetRepository:
    def __init__(self, pool: Any) -> None:
        self.pool = pool

    async def create_token(
        self,
        *,
        staff_user_id: int,
        token_hash: str,
        expires_at: datetime,
        requested_ip: str | None,
        requested_user_agent: str | None,
    ) -> int:
        return await self.pool.insert_and_get_id(
            """
            INSERT INTO staff_password_reset_tokens
              (staff_user_id, token_hash, expires_at, requested_ip, requested_user_agent)
            VALUES (%s, %s, %s, %s, %s)
            """,
            staff_user_id,
            token_hash,
            expires_at.replace(tzinfo=None),
            requested_ip,
            requested_user_agent[:300] if requested_user_agent else None,
        )

    async def get_valid_token(self, token_hash: str) -> dict[str, Any] | None:
        return await self.pool.fetchrow(
            """
            SELECT prt.*, su.email, su.password_hash, su.is_active
            FROM staff_password_reset_tokens prt
            JOIN staff_users su ON su.id = prt.staff_user_id
            WHERE prt.token_hash = %s
              AND prt.used_at IS NULL
              AND prt.revoked_at IS NULL
              AND prt.expires_at > CURRENT_TIMESTAMP
              AND su.is_active = TRUE
            LIMIT 1
            """,
            token_hash,
        )

    async def mark_used(self, token_id: int) -> None:
        await self.pool.execute("UPDATE staff_password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = %s", token_id)

    async def revoke_unused_for_staff(self, staff_user_id: int) -> int:
        return await self.pool.execute(
            """
            UPDATE staff_password_reset_tokens
            SET revoked_at = CURRENT_TIMESTAMP
            WHERE staff_user_id = %s AND used_at IS NULL AND revoked_at IS NULL
            """,
            staff_user_id,
        )
