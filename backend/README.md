# Roho Backend

FastAPI backend for public content, enquiries, newsletter, AI, WhatsApp, staff authentication, and admin lead management.

The only supported database is MySQL 8.4. Do not use PostgreSQL, SQLite, SQLAlchemy, Alembic, or Supabase for this backend.

## Local Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Fill `backend/.env`. Use either:

```text
DATABASE_URL=mysql://root:<percent-encoded-password-if-needed>@127.0.0.1:3306/oniria_city
```

or raw `MYSQL_*` fields:

```text
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=oniria_city
MYSQL_USER=root
MYSQL_PASSWORD=<actual raw password>
```

Only `DATABASE_URL` needs percent-encoding for special characters. `MYSQL_PASSWORD` should contain the actual password.

## Migrate, Bootstrap, Run

From the repository root:

```powershell
python backend\scripts\run_migrations.py
python backend\scripts\create_admin.py
python backend\scripts\verify_admin.py
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 7000
```

The admin bootstrap is idempotent. It does not reset an existing password unless `ONIRIA_ADMIN_UPDATE_PASSWORD=true`.

## Email

If `MAIL_PROVIDER` is blank, email delivery is skipped safely. To send through Resend, configure:

```text
MAIL_PROVIDER=resend
RESEND_API_KEY=<resend-api-key>
MAIL_FROM=verified-sender@example.com
MAIL_FROM_NAME=Roho
SALES_NOTIFICATION_EMAIL=team@example.com
```

Use `SALES_NOTIFICATION_EMAILS` for comma-separated multiple recipients. Public enquiry writes are preserved even if Resend is unavailable.

## Cookies

Local:

```text
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAMESITE=lax
SESSION_COOKIE_DOMAIN=
```

Cross-site HTTPS production:

```text
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=none
SESSION_COOKIE_DOMAIN=
```

`SameSite=None` is rejected unless `Secure=true`.

## Tests

```powershell
python -m pytest backend\tests -q
python -m compileall backend\app backend\scripts
```
