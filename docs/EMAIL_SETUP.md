# Email Setup

Email delivery is optional. Database writes are preserved in PostgreSQL even if mail delivery fails.

For Resend:

```text
MAIL_PROVIDER=resend
RESEND_API_KEY=<resend-api-key>
MAIL_FROM=verified-sender@example.com
MAIL_FROM_NAME=Roho
SALES_NOTIFICATION_EMAIL=team@example.com
```

For SMTP:

```text
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=<smtp-user>
SMTP_PASSWORD=<smtp-password>
SMTP_STARTTLS=true
MAIL_FROM=sales@example.com
SALES_NOTIFICATION_EMAIL=sales@example.com
```

Verify with a public enquiry after migrations and admin bootstrap are complete.
