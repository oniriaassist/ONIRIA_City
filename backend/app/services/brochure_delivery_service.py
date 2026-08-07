from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

from app.config import Settings
from app.repositories.brochure_delivery_repository import BrochureDeliveryRepository
from app.schemas.enquiry_schemas import BrochureRequestCreate, BrochureRequestResponse
from app.services.email_service import EmailService
from app.services.lead_service import LeadService
from app.services.notification_service import NotificationService
from app.services.whatsapp_service import WhatsAppService

logger = logging.getLogger(__name__)


@dataclass
class DeliveryOutcome:
    status: str
    provider: str
    provider_message_id: str | None = None
    error_message: str | None = None


class BrochureDeliveryService:
    def __init__(
        self,
        *,
        settings: Settings,
        lead_service: LeadService,
        repository: BrochureDeliveryRepository,
        email_service: EmailService,
        whatsapp_service: WhatsAppService,
        notification_service: NotificationService,
    ) -> None:
        self.settings = settings
        self.lead_service = lead_service
        self.repository = repository
        self.email_service = email_service
        self.whatsapp_service = whatsapp_service
        self.notification_service = notification_service

    async def process(self, payload: BrochureRequestCreate) -> BrochureRequestResponse:
        enquiry = await self.lead_service.process_enquiry(payload, notify_sales=False)
        method = payload.delivery_method
        recipient = payload.email if method == "email" else payload.phone
        assert recipient is not None

        await self.repository.set_request_method(enquiry.reference_number, method)
        provider = "resend" if method == "email" else "whatsapp_cloud"
        attempt_id = await self.repository.create_attempt(
            reference_number=enquiry.reference_number,
            lead_id=enquiry.lead_id,
            method=method,
            recipient=recipient,
            provider=provider,
        )

        try:
            outcome = await self._deliver(payload, enquiry.reference_number)
        except Exception as exc:  # delivery failure must never lose the saved lead
            logger.exception("brochure delivery failed", extra={"reference_number": enquiry.reference_number})
            outcome = DeliveryOutcome(status="failed", provider=provider, error_message=str(exc)[:500])

        await self.repository.finish_attempt(
            attempt_id=attempt_id,
            reference_number=enquiry.reference_number,
            status=outcome.status,
            provider_message_id=outcome.provider_message_id,
            error_message=outcome.error_message,
        )

        notification_status = await self.notification_service.notify_sales_team(
            payload=payload,
            reference_number=enquiry.reference_number,
            lead_id=enquiry.lead_id,
            score=enquiry.lead_score,
        )
        await self.lead_service.repository.update_notification_status(
            enquiry.reference_number,
            notification_status,
        )

        delivered = outcome.status == "sent"
        message = (
            f"Your ONIRIA City brochure has been sent by {method.title()}."
            if delivered
            else "Your request has been saved. Our sales team will contact you shortly because automatic delivery could not be completed."
        )
        return BrochureRequestResponse(
            reference_number=enquiry.reference_number,
            lead_id=enquiry.lead_id,
            lead_score=enquiry.lead_score,
            follow_up_status=enquiry.follow_up_status,
            message=message,
            delivery_method=method,
            delivery_status=outcome.status,
            delivered=delivered,
        )

    async def _deliver(self, payload: BrochureRequestCreate, reference_number: str) -> DeliveryOutcome:
        brochure_path = self.settings.brochure_pdf_path
        if not brochure_path.is_file():
            return DeliveryOutcome(
                status="failed",
                provider="local_asset",
                error_message=f"Brochure PDF not found at {brochure_path}",
            )

        if payload.delivery_method == "email":
            result = await self.email_service.send_brochure_email(
                recipient=str(payload.email),
                customer_name=payload.name,
                reference_number=reference_number,
                brochure_path=brochure_path,
            )
            return DeliveryOutcome(
                status=result.status,
                provider=result.provider,
                provider_message_id=result.message_id,
                error_message=result.error_message,
            )

        result = await self.whatsapp_service.send_brochure_document(
            recipient=str(payload.phone),
            customer_name=payload.name,
            reference_number=reference_number,
            brochure_path=brochure_path,
        )
        return DeliveryOutcome(
            status=result.status,
            provider=result.provider,
            provider_message_id=result.message_id,
            error_message=result.error_message,
        )
