from __future__ import annotations

from datetime import datetime
from typing import Any


class StaffRepository:
    def __init__(self, pool: Any) -> None:
        self.pool = pool

    async def get_staff_by_email(self, email: str) -> dict[str, Any] | None:
        row = await self.pool.fetchrow("SELECT * FROM staff_users WHERE email = %s LIMIT 1", email.lower())
        if not row:
            return None
        row["roles"] = await self.get_staff_roles(row["id"])
        return row

    async def get_staff_by_id(self, staff_id: int) -> dict[str, Any] | None:
        row = await self.pool.fetchrow("SELECT id, full_name, email, is_active, last_login_at, created_at FROM staff_users WHERE id = %s", staff_id)
        if not row:
            return None
        row["roles"] = await self.get_staff_roles(staff_id)
        return row

    async def get_staff_roles(self, staff_id: int) -> list[str]:
        rows = await self.pool.fetch(
            """
            SELECT sr.role_key
            FROM staff_user_roles sur
            JOIN staff_roles sr ON sr.id = sur.role_id
            WHERE sur.staff_user_id = %s
            ORDER BY sr.role_key
            """,
            staff_id,
        )
        return [row["role_key"] for row in rows]

    async def record_login_attempt(self, email: str, ip_address: str | None, succeeded: bool, reason: str | None = None) -> None:
        await self.pool.execute(
            "INSERT INTO staff_login_attempts (email, ip_address, succeeded, failure_reason) VALUES (%s, %s, %s, %s)",
            email.lower(),
            ip_address,
            bool(succeeded),
            reason,
        )

    async def count_recent_failed_logins(self, email: str) -> int:
        value = await self.pool.fetchval(
            """
            SELECT COUNT(*)
            FROM staff_login_attempts
            WHERE email = %s
              AND succeeded = FALSE
              AND created_at > (CURRENT_TIMESTAMP - INTERVAL '15 minutes')
            """,
            email.lower(),
        )
        return int(value or 0)

    async def create_session(self, staff_id: int, token_hash: str, expires_at: datetime) -> dict[str, Any]:
        session_id = await self.pool.insert_and_get_id(
            "INSERT INTO staff_sessions (staff_user_id, token_hash, expires_at) VALUES (%s, %s, %s)",
            staff_id,
            token_hash,
            expires_at.replace(tzinfo=None),
        )
        await self.pool.execute("UPDATE staff_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = %s", staff_id)
        return {"id": session_id, "staff_user_id": staff_id, "expires_at": expires_at}

    async def get_session(self, token_hash: str) -> dict[str, Any] | None:
        row = await self.pool.fetchrow(
            """
            SELECT ss.id AS session_id, ss.expires_at, su.id, su.full_name, su.email, su.is_active
            FROM staff_sessions ss
            JOIN staff_users su ON su.id = ss.staff_user_id
            WHERE ss.token_hash = %s
              AND ss.revoked_at IS NULL
              AND ss.expires_at > CURRENT_TIMESTAMP
            LIMIT 1
            """,
            token_hash,
        )
        if not row:
            return None
        row["roles"] = await self.get_staff_roles(row["id"])
        return row

    async def revoke_session(self, token_hash: str) -> None:
        await self.pool.execute("UPDATE staff_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = %s", token_hash)

    async def revoke_staff_sessions(self, staff_id: int) -> int:
        return await self.pool.execute(
            "UPDATE staff_sessions SET revoked_at = CURRENT_TIMESTAMP WHERE staff_user_id = %s AND revoked_at IS NULL",
            staff_id,
        )

    async def update_password(self, staff_id: int, password_hash: str) -> None:
        await self.pool.execute("UPDATE staff_users SET password_hash = %s WHERE id = %s", password_hash, staff_id)

    async def list_staff(self) -> list[dict[str, Any]]:
        rows = await self.pool.fetch("SELECT id, full_name, email, is_active, last_login_at, created_at FROM staff_users ORDER BY full_name")
        if not rows:
            return rows
        staff_ids = [row["id"] for row in rows]
        placeholders = ", ".join(["%s"] * len(staff_ids))
        role_rows = await self.pool.fetch(
            f"""
            SELECT sur.staff_user_id, sr.role_key
            FROM staff_user_roles sur
            JOIN staff_roles sr ON sr.id = sur.role_id
            WHERE sur.staff_user_id IN ({placeholders})
            ORDER BY sr.role_key
            """,
            *staff_ids,
        )
        roles_by_staff_id: dict[int, list[str]] = {staff_id: [] for staff_id in staff_ids}
        for role_row in role_rows:
            roles_by_staff_id.setdefault(role_row["staff_user_id"], []).append(role_row["role_key"])
        for row in rows:
            row["roles"] = roles_by_staff_id.get(row["id"], [])
        return rows

    async def create_staff(self, *, full_name: str, email: str, password_hash: str, roles: list[str]) -> dict[str, Any]:
        staff_id = await self.pool.insert_and_get_id(
            "INSERT INTO staff_users (full_name, email, password_hash) VALUES (%s, %s, %s)",
            full_name,
            email.lower(),
            password_hash,
        )
        await self.set_roles(staff_id, roles)
        return await self.get_staff_by_id(staff_id)

    async def set_roles(self, staff_id: int, roles: list[str]) -> None:
        await self.pool.execute("DELETE FROM staff_user_roles WHERE staff_user_id = %s", staff_id)
        for role in roles:
            await self.pool.execute(
                """
                INSERT INTO staff_user_roles (staff_user_id, role_id)
                SELECT %s, id FROM staff_roles WHERE role_key = %s
                ON CONFLICT (staff_user_id, role_id) DO NOTHING
                """,
                staff_id,
                role,
            )

    async def update_staff(self, staff_id: int, values: dict[str, Any]) -> dict[str, Any] | None:
        if "full_name" in values:
            await self.pool.execute("UPDATE staff_users SET full_name = %s WHERE id = %s", values["full_name"], staff_id)
        if "is_active" in values:
            await self.pool.execute("UPDATE staff_users SET is_active = %s WHERE id = %s", bool(values["is_active"]), staff_id)
        if "roles" in values:
            await self.set_roles(staff_id, values["roles"])
        return await self.get_staff_by_id(staff_id)
