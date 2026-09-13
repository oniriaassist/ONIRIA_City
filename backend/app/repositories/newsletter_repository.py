from __future__ import annotations

from typing import Any


class NewsletterRepository:
    def __init__(self, pool: Any) -> None:
        self.pool = pool

    async def get_by_email(self, email: str) -> dict[str, Any] | None:
        return await self.pool.fetchrow("SELECT * FROM newsletter_subscriptions WHERE email = %s LIMIT 1", email.lower())

    async def subscribe(self, values: dict[str, Any]) -> tuple[dict[str, Any] | None, bool]:
        email = values["email"].lower()
        existing = await self.get_by_email(email)
        if existing:
            if existing.get("status") != "active":
                await self.pool.execute(
                    """
                    UPDATE newsletter_subscriptions
                    SET status = 'active', consent = TRUE, source_page = %s, anonymous_session_id = %s,
                        utm_source = %s, utm_medium = %s, utm_campaign = %s, utm_content = %s,
                        subscribed_at = CURRENT_TIMESTAMP, unsubscribed_at = NULL
                    WHERE email = %s
                    """,
                    values.get("source_page"),
                    values.get("anonymous_session_id"),
                    values.get("utm_source"),
                    values.get("utm_medium"),
                    values.get("utm_campaign"),
                    values.get("utm_content"),
                    email,
                )
                return await self.get_by_email(email), False
            return existing, False

        subscriber_id = await self.pool.insert_and_get_id(
            """
            INSERT INTO newsletter_subscriptions
              (email, status, source_page, anonymous_session_id, utm_source, utm_medium,
               utm_campaign, utm_content, consent, subscribed_at)
            VALUES (%s, 'active', %s, %s, %s, %s, %s, %s, TRUE, CURRENT_TIMESTAMP)
            """,
            email,
            values.get("source_page"),
            values.get("anonymous_session_id"),
            values.get("utm_source"),
            values.get("utm_medium"),
            values.get("utm_campaign"),
            values.get("utm_content"),
        )
        return await self.pool.fetchrow("SELECT * FROM newsletter_subscriptions WHERE id = %s", subscriber_id), True

    async def unsubscribe(self, email: str) -> None:
        await self.pool.execute(
            """
            UPDATE newsletter_subscriptions
            SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP
            WHERE email = %s
            """,
            email.lower(),
        )

    async def list_subscribers(self, filters: dict[str, Any]) -> dict[str, Any]:
        where = []
        params: list[Any] = []
        if filters.get("q"):
            where.append("email LIKE %s")
            params.append(f"%{filters['q'].lower()}%")
        if filters.get("status"):
            where.append("status = %s")
            params.append(filters["status"])
        if filters.get("campaign"):
            where.append("utm_campaign = %s")
            params.append(filters["campaign"])
        where_sql = f"WHERE {' AND '.join(where)}" if where else ""
        page = max(int(filters.get("page") or 1), 1)
        page_size = min(max(int(filters.get("page_size") or 25), 1), 100)
        offset = (page - 1) * page_size
        rows = await self.pool.fetch(
            f"""
            SELECT email, status, source_page, utm_source, utm_campaign, subscribed_at
            FROM newsletter_subscriptions
            {where_sql}
            ORDER BY subscribed_at DESC, created_at DESC
            LIMIT %s OFFSET %s
            """,
            *params,
            page_size,
            offset,
        )
        total = int(await self.pool.fetchval(f"SELECT COUNT(*) FROM newsletter_subscriptions {where_sql}", *params) or 0)
        return {"items": rows, "page": page, "page_size": page_size, "total": total}
