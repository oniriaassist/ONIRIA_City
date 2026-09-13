from __future__ import annotations

import json
from typing import Any


class AccountRecoveryRepository:
    def __init__(self, pool: Any) -> None:
        self.pool = pool

    async def next_reference_sequence(self) -> int:
        value = await self.pool.fetchval("SELECT COUNT(*) + 1 FROM staff_account_recovery_requests WHERE DATE(created_at) = CURRENT_DATE")
        return int(value or 1)

    async def create(self, values: dict[str, Any]) -> dict[str, Any]:
        request_id = await self.pool.insert_and_get_id(
            """
            INSERT INTO staff_account_recovery_requests
              (reference_number, full_name, known_email, phone, staff_identifier, department,
               claimed_role, recovery_reason, preferred_contact_method, message)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            values["reference_number"],
            values["full_name"],
            values.get("known_email"),
            values["phone"],
            values.get("staff_identifier"),
            values.get("department"),
            values.get("claimed_role"),
            values["recovery_reason"],
            values["preferred_contact_method"],
            values.get("message"),
        )
        return await self.get(request_id) or {"id": request_id, **values}

    async def list(self) -> list[dict[str, Any]]:
        return await self.pool.fetch(
            """
            SELECT arr.*, su.full_name AS assigned_admin_name
            FROM staff_account_recovery_requests arr
            LEFT JOIN staff_users su ON su.id = arr.assigned_admin_id
            ORDER BY arr.created_at DESC
            """
        )

    async def get(self, request_id: int) -> dict[str, Any] | None:
        row = await self.pool.fetchrow(
            """
            SELECT arr.*, su.full_name AS assigned_admin_name
            FROM staff_account_recovery_requests arr
            LEFT JOIN staff_users su ON su.id = arr.assigned_admin_id
            WHERE arr.id = %s
            LIMIT 1
            """,
            request_id,
        )
        if not row:
            return None
        row["staff_candidates"] = await self.match_staff_candidates(row)
        return row

    async def match_staff_candidates(self, request_row: dict[str, Any]) -> list[dict[str, Any]]:
        candidates: list[dict[str, Any]] = []
        params: list[Any] = []
        where: list[str] = []
        if request_row.get("known_email"):
            where.append("su.email = %s")
            params.append(str(request_row["known_email"]).lower())
        if request_row.get("full_name"):
            where.append("su.full_name LIKE %s")
            params.append(f"%{request_row['full_name']}%")
        if not where:
            return []
        rows = await self.pool.fetch(
            f"""
            SELECT su.id, su.full_name, su.email, su.is_active, su.last_login_at,
                   STRING_AGG(sr.role_key, ', ' ORDER BY sr.role_key) AS roles
            FROM staff_users su
            LEFT JOIN staff_user_roles sur ON sur.staff_user_id = su.id
            LEFT JOIN staff_roles sr ON sr.id = sur.role_id
            WHERE {' OR '.join(where)}
            GROUP BY su.id, su.full_name, su.email, su.is_active, su.last_login_at
            ORDER BY su.full_name
            LIMIT 10
            """,
            *params,
        )
        for row in rows:
            candidates.append({**row, "roles": [role.strip() for role in (row.get("roles") or "").split(",") if role.strip()]})
        return candidates

    async def update(self, request_id: int, values: dict[str, Any]) -> dict[str, Any] | None:
        if "status" in values and values["status"] is not None:
            await self.pool.execute("UPDATE staff_account_recovery_requests SET status = %s WHERE id = %s", values["status"], request_id)
        if "resolution_note" in values and values["resolution_note"] is not None:
            await self.pool.execute("UPDATE staff_account_recovery_requests SET resolution_note = %s WHERE id = %s", values["resolution_note"], request_id)
        return await self.get(request_id)

    async def assign(self, request_id: int, admin_id: int) -> dict[str, Any] | None:
        await self.pool.execute(
            "UPDATE staff_account_recovery_requests SET assigned_admin_id = %s, status = 'under_review' WHERE id = %s",
            admin_id,
            request_id,
        )
        return await self.get(request_id)

    async def resolve(self, request_id: int, note: str, status: str) -> dict[str, Any] | None:
        await self.pool.execute(
            """
            UPDATE staff_account_recovery_requests
            SET status = %s, resolution_note = %s, resolved_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            status,
            note,
            request_id,
        )
        return await self.get(request_id)

    async def audit(self, actor_staff_id: int | None, action: str, request_id: int, before: Any, after: Any, ip: str | None = None, user_agent: str | None = None) -> None:
        await self.pool.execute(
            """
            INSERT INTO audit_logs (actor_staff_id, action, entity_type, entity_id, before_json, after_json, ip_address, user_agent)
            VALUES (%s, %s, 'staff_account_recovery_request', %s, %s, %s, %s, %s)
            """,
            actor_staff_id,
            action,
            str(request_id),
            None if before is None else json.loads(json.dumps(before, default=str)),
            None if after is None else json.loads(json.dumps(after, default=str)),
            ip,
            user_agent[:300] if user_agent else None,
        )
