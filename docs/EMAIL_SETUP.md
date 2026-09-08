# Email Setup

Email delivery is optional in local development. If `MAIL_PROVIDER` is blank, delivery is skipped safely and reset tokens are not printed in normal logs.

## Resend

1. Verify a sender domain or sender address in Resend.
2. Fill `backend/.env`:

```text
MAIL_PROVIDER=resend
RESEND_API_KEY=<resend-api-key>
MAIL_FROM=hello@example.com
MAIL_FROM_NAME=Roho
SALES_NOTIFICATION_EMAIL=sales@example.com
SALES_NOTIFICATION_EMAILS=
REPLY_TO_EMAIL=
```

`SALES_NOTIFICATION_EMAIL` is the backward-compatible single-recipient option. `SALES_NOTIFICATION_EMAILS` accepts comma-separated recipients.

## What Sends

- Staff password reset emails.
- Sales enquiry notifications after the enquiry is saved.

The enquiry remains saved in MySQL if Resend fails. Provider errors are logged without API keys and are not exposed to public users.

## Test

With MySQL and env configured:

```powershell
python backend\scripts\validate_configuration.py
```
