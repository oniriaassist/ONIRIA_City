from __future__ import annotations

import base64
import asyncio
import logging
import smtplib
import ssl
from dataclasses import dataclass
from email.message import EmailMessage
from html import escape
from pathlib import Path
from typing import Any

import httpx
from pydantic import EmailStr, TypeAdapter

from app.config import Settings
from app.schemas.enquiry_schemas import EnquiryCreate

logger = logging.getLogger(__name__)
email_adapter = TypeAdapter(EmailStr)


@dataclass
class EmailSendResult:
    delivered: bool
    provider: str
    status: str = "skipped"
    message_id: str | None = None
    error_message: str | None = None


class EmailService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    async def send_staff_password_reset(self, *, recipient: str, reset_url: str, expires_minutes: int) -> EmailSendResult:
        subject = "Reset your ONIRIA City staff password"
        text = (
            "A password reset was requested for your ONIRIA City staff account.\n\n"
            f"Reset link: {reset_url}\n\n"
            f"This link expires in {expires_minutes} minutes. If you did not request it, ignore this message."
        )
        html = (
            "<p>A password reset was requested for your ONIRIA City staff account.</p>"
            f"<p><a href=\"{escape(reset_url)}\">Reset your password</a></p>"
            f"<p>This link expires in {expires_minutes} minutes. If you did not request it, ignore this message.</p>"
        )
        return await self._send_email(to=[recipient], subject=subject, text=text, html=html)


    async def send_brochure_email(
        self,
        *,
        recipient: str,
        customer_name: str,
        reference_number: str,
        brochure_path: Path,
    ) -> EmailSendResult:
        subject = "Your ONIRIA City brochure"
        text = (
            f"Hello {customer_name},\n\n"
            "Thank you for your interest in ONIRIA City. Your approved brochure is attached.\n\n"
            f"Reference: {reference_number}\n\n"
            "Our sales team is available to help with availability, consultations and private site visits."
        )
        html = (
            f"<p>Hello {escape(customer_name)},</p>"
            "<p>Thank you for your interest in ONIRIA City. Your approved brochure is attached.</p>"
            f"<p><strong>Reference:</strong> {escape(reference_number)}</p>"
            "<p>Our sales team is available to help with availability, consultations and private site visits.</p>"
        )
        return await self._send_email(
            to=[recipient],
            subject=subject,
            text=text,
            html=html,
            reply_to=self.settings.reply_to_email,
            attachments=[{
                "filename": "ONIRIA_City_Brochure.pdf",
                "content": base64.b64encode(brochure_path.read_bytes()).decode("ascii"),
            }],
        )

    async def send_sales_enquiry_notification(
        self,
        *,
        payload: EnquiryCreate,
        reference_number: str,
        lead_id: int,
        score: int,
    ) -> EmailSendResult:
        recipients = self.settings.sales_notification_recipient_list
        if not recipients:
            logger.info("sales notification skipped; no sales notification recipients configured")
            return EmailSendResult(delivered=False, provider=self._provider_name(), status="skipped")

        admin_url = f"{self.settings.frontend_url.rstrip('/')}/admin/leads/{lead_id}"
        subject = f"ONIRIA enquiry {reference_number}"
        rows = {
            "Reference number": reference_number,
            "Lead ID": str(lead_id),
            "Enquiry type": payload.enquiry_type.value,
            "Score": str(score),
            "Customer full name": payload.name,
            "Email": payload.email or "",
            "Phone": payload.phone or "",
            "Property interest": payload.property_slug or payload.collection_slug or "",
            "Budget": payload.budget or "",
            "Message": payload.message,
            "Admin lead URL": admin_url,
        }
        text = "\n".join(f"{label}: {value}" for label, value in rows.items() if value)
        html = "<table>" + "".join(
            f"<tr><th align=\"left\">{escape(label)}</th><td>{escape(value)}</td></tr>"
            for label, value in rows.items()
            if value
        ) + "</table>"
        reply_to = self._safe_reply_to(payload.email)
        return await self._send_email(to=recipients, subject=subject, text=text, html=html, reply_to=reply_to)

    async def send_test_email(self, *, recipient: str) -> EmailSendResult:
        return await self._send_email(
            to=[recipient],
            subject="ONIRIA City email test",
            text="This is a test email from ONIRIA City.",
            html="<p>This is a test email from ONIRIA City.</p>",
        )

    def _provider_name(self) -> str:
        return (self.settings.mail_provider or "").strip().lower() or "development_fallback"

    async def _send_email(
        self,
        *,
        to: list[str],
        subject: str,
        text: str,
        html: str,
        reply_to: str | None = None,
        attachments: list[dict[str, str]] | None = None,
    ) -> EmailSendResult:
        provider = self._provider_name()
        if provider == "development_fallback":
            logger.info("email delivery skipped; MAIL_PROVIDER is not configured")
            return EmailSendResult(delivered=False, provider=provider, status="skipped")
        if provider == "smtp":
            return await self._send_smtp(to=to, subject=subject, text=text, html=html, reply_to=reply_to, attachments=attachments)
        if provider != "resend":
            logger.warning("email delivery skipped; unsupported MAIL_PROVIDER configured")
            return EmailSendResult(delivered=False, provider=provider, status="skipped")
        return await self._send_resend(to=to, subject=subject, text=text, html=html, reply_to=reply_to, attachments=attachments)

    async def _send_smtp(
        self,
        *,
        to: list[str],
        subject: str,
        text: str,
        html: str,
        reply_to: str | None,
        attachments: list[dict[str, str]] | None = None,
    ) -> EmailSendResult:
        if not self.settings.smtp_host or not self.settings.mail_from:
            logger.warning("SMTP email skipped; SMTP_HOST and MAIL_FROM are required")
            return EmailSendResult(delivered=False, provider="smtp", status="skipped")

        try:
            message = self._build_smtp_message(
                to=to,
                subject=subject,
                text=text,
                html=html,
                reply_to=reply_to,
                attachments=attachments,
            )
            await asyncio.to_thread(self._send_smtp_sync, message, to)
            return EmailSendResult(delivered=True, provider="smtp", status="sent")
        except Exception:
            logger.exception("SMTP email request failed")
            return EmailSendResult(delivered=False, provider="smtp", status="failed", error_message="SMTP server rejected the message or could not be reached")

    def _build_smtp_message(
        self,
        *,
        to: list[str],
        subject: str,
        text: str,
        html: str,
        reply_to: str | None,
        attachments: list[dict[str, str]] | None,
    ) -> EmailMessage:
        message = EmailMessage()
        message["From"] = self._from_address() or str(self.settings.mail_from)
        message["To"] = ", ".join(to)
        message["Subject"] = subject
        if reply_to:
            message["Reply-To"] = reply_to
        message.set_content(text)
        message.add_alternative(html, subtype="html")

        for attachment in attachments or []:
            filename = attachment.get("filename") or "attachment"
            content = attachment.get("content") or ""
            message.add_attachment(
                base64.b64decode(content),
                maintype="application",
                subtype="octet-stream",
                filename=filename,
            )

        return message

    def _send_smtp_sync(self, message: EmailMessage, recipients: list[str]) -> None:
        context = ssl.create_default_context()
        smtp_class = smtplib.SMTP_SSL if self.settings.smtp_use_tls else smtplib.SMTP
        with smtp_class(
            str(self.settings.smtp_host),
            int(self.settings.smtp_port),
            timeout=int(self.settings.smtp_timeout_seconds),
        ) as server:
            if self.settings.smtp_starttls and not self.settings.smtp_use_tls:
                server.starttls(context=context)
            if self.settings.smtp_username and self.settings.smtp_password:
                server.login(self.settings.smtp_username, self.settings.smtp_password)
            server.send_message(message, from_addr=str(self.settings.mail_from), to_addrs=recipients)

    async def _send_resend(
        self,
        *,
        to: list[str],
        subject: str,
        text: str,
        html: str,
        reply_to: str | None,
        attachments: list[dict[str, str]] | None = None,
    ) -> EmailSendResult:
        api_key = (self.settings.resend_api_key or "").strip()
        mail_from = self._from_address()
        if not api_key or not mail_from:
            logger.warning("Resend email skipped; RESEND_API_KEY and MAIL_FROM are required")
            return EmailSendResult(delivered=False, provider="resend", status="skipped")

        body: dict[str, Any] = {
            "from": mail_from,
            "to": to,
            "subject": subject,
            "text": text,
            "html": html,
        }
        if reply_to:
            body["reply_to"] = reply_to
        if attachments:
            body["attachments"] = attachments

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json=body,
                )
            if 200 <= response.status_code < 300:
                payload = response.json() if response.content else {}
                return EmailSendResult(delivered=True, provider="resend", status="sent", message_id=payload.get("id"))
            logger.warning("Resend email failed", extra={"status_code": response.status_code})
        except httpx.HTTPError:
            logger.exception("Resend email request failed")
        return EmailSendResult(delivered=False, provider="resend", status="failed", error_message="Resend rejected the message or could not be reached")

    def _from_address(self) -> str | None:
        if not self.settings.mail_from:
            return None
        name = (self.settings.mail_from_name or "").strip()
        return f"{name} <{self.settings.mail_from}>" if name else self.settings.mail_from

    def _safe_reply_to(self, value: str | None) -> str | None:
        if not value:
            return self.settings.reply_to_email
        try:
            email_adapter.validate_python(value)
        except Exception:
            return self.settings.reply_to_email
        return value
