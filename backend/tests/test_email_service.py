import asyncio

from app.config import Settings
from app.services.email_service import EmailService


class FakeSMTP:
    instances = []

    def __init__(self, host, port, timeout):
        self.host = host
        self.port = port
        self.timeout = timeout
        self.started_tls = False
        self.login_args = None
        self.sent = None
        FakeSMTP.instances.append(self)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def starttls(self, context):
        self.started_tls = True

    def login(self, username, password):
        self.login_args = (username, password)

    def send_message(self, message, from_addr, to_addrs):
        self.sent = (message, from_addr, to_addrs)


def test_smtp_provider_sends_message(monkeypatch):
    FakeSMTP.instances = []
    monkeypatch.setattr("app.services.email_service.smtplib.SMTP", FakeSMTP)

    settings = Settings(
        mail_provider="smtp",
        smtp_host="smtp.example.com",
        smtp_port=587,
        smtp_username="mailer",
        smtp_password="smtp-secret",
        mail_from="enquiries@example.com",
        mail_from_name="ONIRIA City",
        sales_notification_email="sales@example.com",
    )
    service = EmailService(settings)

    result = asyncio.run(service.send_test_email(recipient="buyer@example.com"))

    assert result.delivered is True
    assert result.provider == "smtp"
    assert result.status == "sent"
    smtp = FakeSMTP.instances[0]
    assert smtp.host == "smtp.example.com"
    assert smtp.port == 587
    assert smtp.started_tls is True
    assert smtp.login_args == ("mailer", "smtp-secret")
    message, from_addr, to_addrs = smtp.sent
    assert from_addr == "enquiries@example.com"
    assert to_addrs == ["buyer@example.com"]
    assert message["From"] == "ONIRIA City <enquiries@example.com>"
    assert message["To"] == "buyer@example.com"


def test_smtp_provider_failure_is_reported(monkeypatch):
    class BrokenSMTP(FakeSMTP):
        def send_message(self, message, from_addr, to_addrs):
            raise OSError("smtp down")

    monkeypatch.setattr("app.services.email_service.smtplib.SMTP", BrokenSMTP)
    settings = Settings(
        mail_provider="smtp",
        smtp_host="smtp.example.com",
        mail_from="enquiries@example.com",
        sales_notification_email="sales@example.com",
    )
    service = EmailService(settings)

    result = asyncio.run(service.send_test_email(recipient="buyer@example.com"))

    assert result.delivered is False
    assert result.provider == "smtp"
    assert result.status == "failed"
