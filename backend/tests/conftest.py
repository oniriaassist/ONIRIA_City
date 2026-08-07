import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["DATABASE_URL"] = ""
for name in (
    "MYSQL_HOST",
    "MYSQL_DATABASE",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
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
