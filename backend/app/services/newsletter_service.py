from __future__ import annotations

from typing import Any

from app.repositories.newsletter_repository import NewsletterRepository
from app.schemas.newsletter_schemas import NewsletterSubscribeRequest


NEWSLETTER_SUBSCRIBED_MESSAGE = "Thank you for subscribing to Roho updates."
NEWSLETTER_ALREADY_SUBSCRIBED_MESSAGE = "This email is already subscribed to Roho updates."


class NewsletterService:
    def __init__(self, pool: Any) -> None:
        self.repo = NewsletterRepository(pool)

    async def subscribe(self, payload: NewsletterSubscribeRequest) -> dict[str, str]:
        values = payload.model_dump()
        values["email"] = str(payload.email).lower()
        _, created = await self.repo.subscribe(values)
        return {
            "message": NEWSLETTER_SUBSCRIBED_MESSAGE if created else NEWSLETTER_ALREADY_SUBSCRIBED_MESSAGE,
        }

    async def unsubscribe(self, email: str) -> dict[str, str]:
        await self.repo.unsubscribe(email)
        return {"message": "You have been unsubscribed from Roho updates."}
