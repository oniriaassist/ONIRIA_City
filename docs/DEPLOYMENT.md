# ONIRIA City Deployment Guide

This guide prepares the existing Docker Compose architecture for production without changing application behavior.

## 1. Server Requirements

- Linux server with Docker Engine and Docker Compose plugin
- Open ports `80` and `443` for the public reverse proxy
- Optional direct access to `3000` and `7000` only during private testing
- Enough disk space for Docker images, MySQL data, logs, and backups

## 2. Clone Repository

```bash
git clone <repository-url> ONIRIA_City
cd ONIRIA_City
```

## 3. Environment Variables

Create the runtime env files from safe examples:

```bash
cp .env.production.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Fill real secrets only on the server. Do not commit env files.

For Docker Compose, use:

```text
MYSQL_HOST=mysql
MYSQL_PORT=3306
NEXT_PUBLIC_API_BASE_URL=/api
INTERNAL_API_BASE_URL=http://backend:7000
APP_ENV=production
APP_DEBUG=false
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=lax
```

Set `CORS_ORIGINS` and `FRONTEND_URL` to the real HTTPS domain.

## 4. Database Configuration

Root `.env` controls the MySQL container credentials:

```text
MYSQL_DATABASE=oniria_city
MYSQL_USER=oniria_user
MYSQL_PASSWORD=<strong-password>
MYSQL_ROOT_PASSWORD=<strong-root-password>
```

`backend/.env` should point to the Compose service:

```text
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=oniria_city
MYSQL_USER=oniria_user
MYSQL_PASSWORD=<same MYSQL_PASSWORD>
```

## 5. Docker Build

```bash
docker compose config
docker compose build
```

Fix any config error before starting containers.

## 6. Startup And Migrations

```bash
docker compose up -d
```

Expected startup order:

1. `mysql` starts and passes its healthcheck.
2. `migrate` applies SQL files listed in `backend/scripts/migration_manifest.py`.
3. `admin-bootstrap` creates or verifies the initial staff admin.
4. `backend` starts FastAPI on port `7000`.
5. `frontend` starts Next.js on port `3000`.

## 7. Health Verification

```bash
docker compose ps
curl http://127.0.0.1:7000/api/health
curl http://127.0.0.1:7000/api/ready
curl http://127.0.0.1:3000
```

`/api/health` should not expose secrets. `/api/ready` confirms database connectivity and required table availability.

## 8. HTTPS And Reverse Proxy

A typical production path is:

```text
Internet -> HTTPS reverse proxy -> Next.js frontend -> /api rewrite -> FastAPI -> MySQL
```

Example Nginx upstream targets:

```text
frontend: http://127.0.0.1:3000
backend API through frontend: /api/*
```

Keep browser-facing API calls on `/api` to avoid exposing container hostnames or direct backend ports.

## 9. Domain Configuration

Update these values for the production domain:

```text
CORS_ORIGINS=https://www.example.com,https://example.com
FRONTEND_URL=https://www.example.com
```

If admin cookies must work cross-site, use:

```text
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=none
```

`SameSite=None` requires HTTPS and secure cookies.

## 10. Email Configuration

SMTP example:

```text
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=<smtp-user>
SMTP_PASSWORD=<smtp-app-password>
SMTP_STARTTLS=true
MAIL_FROM=sales@example.com
SALES_NOTIFICATION_EMAIL=sales@example.com
```

Leave `MAIL_PROVIDER` blank if delivery should be skipped safely.

## 11. WhatsApp Configuration

Set these only when WhatsApp API delivery/webhooks are required:

```text
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_GRAPH_VERSION=v23.0
```

The site should still start when API credentials are absent.

## 12. Brochure File

The backend image copies `backend/app/assets/ONIRIA_City_Brochure.pdf`.

Required setting:

```text
BROCHURE_PDF_FILE=app/assets/ONIRIA_City_Brochure.pdf
```

## 13. Backups

The MySQL data volume is `oniria_mysql_data`.

Backup:

```bash
docker compose exec mysql sh -c 'mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' > oniria_city_backup.sql
```

Restore carefully into a stopped or maintenance-mode environment:

```bash
docker compose exec -T mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' < oniria_city_backup.sql
```

## 14. Logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
docker compose logs migrate
docker compose logs admin-bootstrap
```

Never paste logs containing secrets into public places.

## 15. Upgrades

```bash
git pull
docker compose build
docker compose up -d
docker compose ps
```

Review migration files before upgrading a production database.

## 16. Rollback

1. Keep the previous Git commit hash before deploying.
2. Back up MySQL before migrations.
3. If rollback is required:

```bash
git checkout <previous-commit>
docker compose build
docker compose up -d
```

Database migrations are generally forward-only. Restore from backup if a schema rollback is required.
