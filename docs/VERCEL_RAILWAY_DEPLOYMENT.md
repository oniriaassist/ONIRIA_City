# ONIRIA City Vercel and Railway Deployment

This guide prepares production deployment without committing secrets or changing business logic.

## Target Architecture

- Frontend: Vercel, root directory `frontend`
- Backend: Railway service built from `Dockerfile.backend`
- Database: Railway managed MySQL
- Public domain: `www.oniriacity.com`
- API domain: `api.oniriacity.com`

## Railway MySQL

1. Create a Railway MySQL service.
2. Keep MySQL as the only database. Do not add PostgreSQL, SQLite, Supabase, SQLAlchemy or Alembic.
3. Use Railway reference variables to provide either `DATABASE_URL` or the `MYSQL_*` variables to the backend service.
4. If both `DATABASE_URL` and `MYSQL_*` are provided, they must point to the same host, port, database and username. Startup validation will stop the app if they disagree.

Required MySQL variables when using split values:

```text
MYSQL_HOST=<railway-mysql-host>
MYSQL_PORT=<railway-mysql-port>
MYSQL_DATABASE=<railway-mysql-database>
MYSQL_USER=<railway-mysql-user>
MYSQL_PASSWORD=<railway-mysql-password>
```

## Backend Service

Create a Railway service from this repository and use `Dockerfile.backend`.

The Dockerfile:

- installs `backend/requirements.txt`;
- copies `backend/app`;
- copies `backend/scripts`;
- copies `database`;
- sets `ONIRIA_DATABASE_DIR=/app/database`;
- starts Uvicorn on `0.0.0.0:${PORT:-7000}`;
- does not copy `.env` files.

Set production backend variables in Railway. Do not commit real values.

```text
APP_ENV=production
APP_DEBUG=false
API_PREFIX=/api
CORS_ORIGINS=https://www.oniriacity.com,https://oniriacity.com
FRONTEND_URL=https://www.oniriacity.com
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=lax
SESSION_COOKIE_DOMAIN=
RATE_LIMIT_PER_MINUTE=120
ONIRIA_ADMIN_FULL_NAME=<administrator-name>
ONIRIA_ADMIN_EMAIL=<administrator-email>
ONIRIA_ADMIN_PASSWORD=<administrator-password>
ONIRIA_ADMIN_PASSWORD_CONFIRM=<administrator-password>
ONIRIA_ADMIN_UPDATE_PASSWORD=false
```

For same-site subdomains such as `www.oniriacity.com` and `api.oniriacity.com`, `SameSite=lax` with `Secure=true` is the recommended default. If the frontend and API are ever moved to different registrable domains, use `SESSION_COOKIE_SAMESITE=none` with `SESSION_COOKIE_SECURE=true`.

## Migrations

Run migrations as a Railway one-off command after the database is available:

```bash
python scripts/run_migrations.py
```

The migration manifest includes `001_database_setup.sql` through `016_newsletter_subscriptions.sql`.

## Admin Bootstrap

Run the idempotent administrator bootstrap as a Railway one-off command:

```bash
python scripts/create_admin.py
```

The bootstrap searches by case-insensitive email, creates the administrator only when missing, adds the administrator role when missing, and updates the password only when `ONIRIA_ADMIN_UPDATE_PASSWORD=true`.

## Backend Domain

1. Add `api.oniriacity.com` to the Railway backend service.
2. Configure DNS according to Railway's domain instructions.
3. Verify:

```text
https://api.oniriacity.com/api/health
```

## Vercel Frontend

Create a Vercel project with:

```text
Root Directory: frontend
```

Set frontend variables in Vercel:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.oniriacity.com/api
NEXT_PUBLIC_INSTAGRAM_URL=<public-instagram-url>
NEXT_PUBLIC_FACEBOOK_URL=<public-facebook-url>
NEXT_PUBLIC_LINKEDIN_URL=<public-linkedin-url>
NEXT_PUBLIC_YOUTUBE_URL=<public-youtube-url>
NEXT_PUBLIC_WHATSAPP_URL=<public-whatsapp-url>
```

The frontend public forms and admin API helpers use the shared API base URL. Do not hard-code API URLs inside pages or components.

## Custom Domains

- Add `www.oniriacity.com` to Vercel.
- Add `api.oniriacity.com` to Railway.
- Keep backend CORS aligned with the final frontend domain.

## Email Delivery

SMTP is the recommended production email provider. Set these backend variables only in Railway:

```text
MAIL_PROVIDER=smtp
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USERNAME=<smtp-username>
SMTP_PASSWORD=<smtp-password>
SMTP_USE_TLS=false
SMTP_STARTTLS=true
SMTP_TIMEOUT_SECONDS=10
MAIL_FROM=<verified-sender-email>
MAIL_FROM_NAME=ONIRIA City
SALES_NOTIFICATION_EMAILS=<recipient-list>
REPLY_TO_EMAIL=<optional-reply-to-email>
```

`MAIL_FROM` must be a full email address. SMTP notification failure is handled after enquiry persistence, so a provider failure must not roll back the saved customer, lead or enquiry.

Resend remains supported for existing installations. To use Resend instead, set:

```text
MAIL_PROVIDER=resend
RESEND_API_KEY=<resend-api-key>
MAIL_FROM=<verified-sender-email>
MAIL_FROM_NAME=ONIRIA City
SALES_NOTIFICATION_EMAILS=<recipient-list>
REPLY_TO_EMAIL=<optional-reply-to-email>
```

## Production Verification

After deployment and migrations, run:

```bash
python scripts/verify_production_setup.py --backend-url https://api.oniriacity.com
```

The script checks:

- MySQL connectivity;
- required tables;
- migration files `001` through `016`;
- active administrator;
- administrator role;
- newsletter table;
- backend health;
- email configuration presence.

It does not print database URLs, passwords, API keys, cookies or password hashes.

## End-to-End Verification

1. Open `https://www.oniriacity.com`.
2. Submit the contact form and confirm a reference number is returned.
3. Subscribe to the newsletter.
4. Sign in at the admin login page.
5. Confirm `/admin` opens without a manual refresh.
6. Confirm the enquiry, lead and subscriber are visible in the admin portal.
7. Confirm admin requests keep using the HttpOnly cookie with credentialed requests.
8. Confirm `https://api.oniriacity.com/api/health` returns success.

## Backup

Before production migrations:

1. Create a Railway MySQL backup or export.
2. Record the deployed frontend and backend versions.
3. Run migrations only after the backup is complete.

## Rollback

- Frontend: use Vercel's deployment rollback for `www.oniriacity.com`.
- Backend: redeploy the previous Railway deployment.
- Database: restore from the backup if a migration must be reversed.

Do not run destructive database commands unless a restore plan is already confirmed.
