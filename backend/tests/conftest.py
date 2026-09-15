import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["APP_ENV"] = "local"
os.environ["APP_DEBUG"] = "true"
os.environ["CORS_ORIGINS"] = "http://localhost:3000,http://127.0.0.1:3000"
os.environ["FRONTEND_URL"] = "http://localhost:3000"
os.environ["SESSION_COOKIE_SECURE"] = "false"
os.environ["SESSION_COOKIE_SAMESITE"] = "lax"
os.environ["DATABASE_URL"] = ""
for name in (
    "POSTGRES_HOST",
    "POSTGRES_DATABASE",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
    "MAIL_PROVIDER",
    "RESEND_API_KEY",
    "SMTP_HOST",
    "SMTP_USERNAME",
    "SMTP_PASSWORD",
    "MAIL_FROM",
    "SALES_NOTIFICATION_EMAIL",
    "SALES_NOTIFICATION_EMAILS",
    "REPLY_TO_EMAIL",
    "ONIRIA_ADMIN_EMAIL",
    "ONIRIA_ADMIN_PASSWORD",
    "ONIRIA_ADMIN_PASSWORD_CONFIRM",
):
    os.environ[name] = ""
