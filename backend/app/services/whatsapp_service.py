from __future__ import annotations

import hashlib
import hmac
import logging
import re
from dataclasses import dataclass
from pathlib import Path

import httpx

from app.config import Settings

logger = logging.getLogger(__name__)


@dataclass
class WhatsAppSendResult:
    delivered: bool
    provider: str = "whatsapp_cloud"
    status: str = "skipped"
    message_id: str | None = None
    error_message: str | None = None


class WhatsAppService:
    def __init__(self, settings: Settings | None = None, app_secret: str | None = None) -> None:
        self.settings = settings
        self.app_secret = app_secret or (settings.whatsapp_app_secret if settings else None)

    def verify_signature(self, body: bytes, signature_header: str | None) -> bool:
        if not self.app_secret:
            logger.warning("WHATSAPP_APP_SECRET is not configured; accepting webhook in demo mode")
            return True
        if not signature_header or not signature_header.startswith("sha256="):
            return False
        expected = hmac.new(self.app_secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
        received = signature_header.removeprefix("sha256=")
        return hmac.compare_digest(expected, received)

    def process_payload(self, payload: dict) -> int:
        count = 0
        for entry in payload.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                count += len(value.get("messages", []))
        logger.info("whatsapp webhook processed", extra={"processed_messages": count})
        return count

    async def send_brochure_document(
        self,
        *,
        recipient: str,
        customer_name: str,
        reference_number: str,
        brochure_path: Path,
    ) -> WhatsAppSendResult:
        if not self.settings:
            return WhatsAppSendResult(delivered=False, status="skipped", error_message="WhatsApp settings are unavailable")
        token = (self.settings.whatsapp_access_token or "").strip()
        phone_number_id = (self.settings.whatsapp_phone_number_id or "").strip()
        if not token or not phone_number_id:
            return WhatsAppSendResult(
                delivered=False,
                status="skipped",
                error_message="WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are required",
            )

        graph_base = f"https://graph.facebook.com/{self.settings.whatsapp_graph_version}"
        headers = {"Authorization": f"Bearer {token}"}
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                with brochure_path.open("rb") as brochure_file:
                    upload = await client.post(
                        f"{graph_base}/{phone_number_id}/media",
                        headers=headers,
                        data={"messaging_product": "whatsapp", "type": "application/pdf"},
                        files={"file": (brochure_path.name, brochure_file, "application/pdf")},
                    )
                if not 200 <= upload.status_code < 300:
                    return WhatsAppSendResult(
                        delivered=False,
                        status="failed",
                        error_message=f"WhatsApp media upload failed ({upload.status_code}): {upload.text[:300]}",
                    )
                media_id = upload.json().get("id")
                if not media_id:
                    return WhatsAppSendResult(delivered=False, status="failed", error_message="WhatsApp media upload returned no media id")

                template_name = (self.settings.whatsapp_brochure_template_name or "").strip()
                if template_name:
                    message_payload = {
                        "messaging_product": "whatsapp",
                        "to": self._digits_only(recipient),
                        "type": "template",
                        "template": {
                            "name": template_name,
                            "language": {"code": self.settings.whatsapp_brochure_template_language},
                            "components": [
                                {
                                    "type": "header",
                                    "parameters": [{
                                        "type": "document",
                                        "document": {"id": media_id, "filename": "ONIRIA_City_Brochure.pdf"},
                                    }],
                                },
                                {
                                    "type": "body",
                                    "parameters": [
                                        {"type": "text", "text": customer_name},
                                        {"type": "text", "text": reference_number},
                                    ],
                                },
                            ],
                        },
                    }
                else:
                    message_payload = {
                        "messaging_product": "whatsapp",
                        "recipient_type": "individual",
                        "to": self._digits_only(recipient),
                        "type": "document",
                        "document": {
                            "id": media_id,
                            "filename": "ONIRIA_City_Brochure.pdf",
                            "caption": (
                                f"Hello {customer_name}, here is your ONIRIA City brochure. "
                                f"Reference: {reference_number}."
                            ),
                        },
                    }
                send = await client.post(
                    f"{graph_base}/{phone_number_id}/messages",
                    headers={**headers, "Content-Type": "application/json"},
                    json=message_payload,
                )
            if 200 <= send.status_code < 300:
                messages = send.json().get("messages") or []
                message_id = messages[0].get("id") if messages else None
                return WhatsAppSendResult(delivered=True, status="sent", message_id=message_id)
            return WhatsAppSendResult(
                delivered=False,
                status="failed",
                error_message=f"WhatsApp message failed ({send.status_code}): {send.text[:300]}",
            )
        except (OSError, httpx.HTTPError) as exc:
            logger.exception("WhatsApp brochure delivery failed")
            return WhatsAppSendResult(delivered=False, status="failed", error_message=str(exc)[:500])

    @staticmethod
    def _digits_only(value: str) -> str:
        return re.sub(r"\D", "", value)
