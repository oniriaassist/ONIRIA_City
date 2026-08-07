from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


class BrochureDeliveryRepository:
    def __init__(self, database: Any | None) -> None:
        self.database = database
        self.memory_attempts: list[dict[str, Any]] = []

    async def create_attempt(
        self,
        *,
        reference_number: str,
        lead_id: int,
        method: str,
        recipient: str,
        provider: str,
    ) -> int:
        if not self.database:
            attempt_id = len(self.memory_attempts) + 1
            self.memory_attempts.append({
                "id": attempt_id,
                "reference_number": reference_number,
                "lead_id": lead_id,
                "method": method,
                "recipient": recipient,
                "provider": provider,
                "status": "pending",
            })
            return attempt_id

        enquiry = await self.database.fetchrow(
            "SELECT id FROM enquiries WHERE reference_number = %s LIMIT 1",
            reference_number,
        )
        enquiry_id = enquiry["id"] if enquiry else None
        return await self.database.insert_and_get_id(
            """
            INSERT INTO brochure_delivery_attempts
              (reference_number, enquiry_id, lead_id, delivery_method, recipient, provider, status)
            VALUES (%s, %s, %s, %s, %s, %s, 'pending')
            """,
            reference_number,
            enquiry_id,
            lead_id,
            method,
            recipient,
            provider,
        )

    async def finish_attempt(
        self,
        *,
        attempt_id: int,
        reference_number: str,
        status: str,
        provider_message_id: str | None = None,
        error_message: str | None = None,
    ) -> None:
        if not self.database:
            for attempt in self.memory_attempts:
                if attempt["id"] == attempt_id:
                    attempt.update({
                        "status": status,
                        "provider_message_id": provider_message_id,
                        "error_message": error_message,
                        "delivered_at": datetime.now(timezone.utc) if status == "sent" else None,
                    })
                    return
            return

        await self.database.execute(
            """
            UPDATE brochure_delivery_attempts
            SET status = %s,
                provider_message_id = %s,
                error_message = %s,
                delivered_at = CASE WHEN %s = 'sent' THEN CURRENT_TIMESTAMP ELSE NULL END
            WHERE id = %s
            """,
            status,
            provider_message_id,
            error_message,
            status,
            attempt_id,
        )
        await self.database.execute(
            """
            UPDATE brochure_requests br
            JOIN enquiries e ON e.id = br.enquiry_id
            SET br.delivery_status = %s,
                br.delivered_at = CASE WHEN %s = 'sent' THEN CURRENT_TIMESTAMP ELSE NULL END
            WHERE e.reference_number = %s
            """,
            status,
            status,
            reference_number,
        )

    async def set_request_method(self, reference_number: str, method: str) -> None:
        if not self.database:
            return
        await self.database.execute(
            """
            UPDATE brochure_requests br
            JOIN enquiries e ON e.id = br.enquiry_id
            SET br.delivery_method = %s
            WHERE e.reference_number = %s
            """,
            method,
            reference_number,
        )
