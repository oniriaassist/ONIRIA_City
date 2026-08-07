import pytest
import re
import subprocess
from pathlib import Path

from app.config import Settings, get_settings
from app.api.admin_auth_routes import session_cookie_delete_options, session_cookie_options


def test_local_cookie_defaults_are_lax_and_not_secure(monkeypatch):
    monkeypatch.setenv("SESSION_COOKIE_SECURE", "false")
    monkeypatch.setenv("SESSION_COOKIE_SAMESITE", "lax")
    monkeypatch.delenv("SESSION_COOKIE_DOMAIN", raising=False)
    get_settings.cache_clear()
    options = session_cookie_options()
    delete_options = session_cookie_delete_options()
    assert options["secure"] is False
    assert options["samesite"] == "lax"
    assert options["httponly"] is True
    assert options["max_age"] == 8 * 60 * 60
    assert delete_options["secure"] is False
    assert delete_options["samesite"] == "lax"
    assert "domain" not in delete_options


def test_production_cross_site_cookie_can_use_secure_none(monkeypatch):
    monkeypatch.setenv("SESSION_COOKIE_SECURE", "true")
    monkeypatch.setenv("SESSION_COOKIE_SAMESITE", "none")
    monkeypatch.setenv("SESSION_COOKIE_DOMAIN", "")
    get_settings.cache_clear()
    options = session_cookie_options()
    assert options["secure"] is True
    assert options["samesite"] == "none"
    assert "domain" not in options


def test_samesite_none_requires_secure_cookie():
    with pytest.raises(ValueError):
        Settings(session_cookie_secure=False, session_cookie_samesite="none")


def test_rejects_non_mysql_database_url():
    with pytest.raises(ValueError):
        Settings(database_url="postgresql://user:pass@localhost/db")


def test_rejects_database_url_and_mysql_field_disagreement():
    with pytest.raises(ValueError, match="disagree"):
        Settings(
            database_url="mysql://root:pw@127.0.0.1:3306/oniria_city",
            mysql_host="localhost",
            mysql_port=3306,
            mysql_database="oniria_city",
            mysql_user="root",
            mysql_password="pw",
        )


def test_rejects_invalid_resend_configuration():
    with pytest.raises(ValueError):
        Settings(mail_provider="resend", resend_api_key="key", mail_from="oniriaassist.com", sales_notification_email="sales@example.com")
    with pytest.raises(ValueError, match="MAIL_PROVIDER=resend requires"):
        Settings(mail_provider="resend", mail_from="onboarding@resend.dev")


def test_accepts_valid_resend_configuration():
    Settings(
        mail_provider="resend",
        resend_api_key="key",
        mail_from="onboarding@resend.dev",
        sales_notification_email="sales@example.com",
    )


def test_rejects_invalid_smtp_configuration():
    with pytest.raises(ValueError, match="MAIL_PROVIDER=smtp requires"):
        Settings(mail_provider="smtp", mail_from="enquiries@example.com")
    with pytest.raises(ValueError):
        Settings(mail_provider="smtp", smtp_host="smtp.example.com", mail_from="oniriaassist.com", sales_notification_email="sales@example.com")


def test_accepts_valid_smtp_configuration():
    Settings(
        mail_provider="smtp",
        smtp_host="smtp.example.com",
        smtp_port=587,
        smtp_username="mailer",
        smtp_password="secret",
        mail_from="enquiries@example.com",
        sales_notification_email="sales@example.com",
    )


def test_private_env_files_are_not_git_tracked():
    root = Path(__file__).resolve().parents[2]
    tracked = subprocess.check_output(["git", "ls-files"], cwd=root, text=True).splitlines()
    assert ".env" not in tracked
    assert "backend/.env" not in tracked
    assert "frontend/.env" not in tracked
    assert "frontend/.env.local" not in tracked


def test_env_examples_contain_placeholders_only():
    root = Path(__file__).resolve().parents[2]
    forbidden = ["mysql+mysqlconnector", "oniria_password", "oniria_root_password"]
    for relative_path in [".env.example", "backend/.env.example", "frontend/.env.example"]:
        text = (root / relative_path).read_text(encoding="utf-8")
        for value in forbidden:
            assert value not in text
        for key in ["RESEND_API_KEY", "SMTP_PASSWORD", "MYSQL_PASSWORD", "MYSQL_ROOT_PASSWORD", "WHATSAPP_APP_SECRET", "ONIRIA_ADMIN_PASSWORD"]:
            match = re.search(rf"^{key}=(.+)$", text, flags=re.MULTILINE)
            if match:
                assert match.group(1).strip() in {"", "<resend-api-key>", "<strong-password>"}
        admin_email = re.search(r"^ONIRIA_ADMIN_EMAIL=(.+)$", text, flags=re.MULTILINE)
        if admin_email:
            assert admin_email.group(1).strip() == ""
