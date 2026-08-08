# ONIRIA City

Full-stack ONIRIA City website with a Next.js frontend, FastAPI backend, MySQL 8.4 database, public enquiry flows, brochure delivery, WhatsApp hooks, staff authentication, and a private admin dashboard.

## Project Structure

```text
ONIRIA_City/
  frontend/              Next.js public website and admin dashboard UI
  backend/               FastAPI API, services, repositories, schemas, assets
  database/              MySQL migrations, seed data, scripts, docs
  docs/                  Setup and deployment documentation
  docker-compose.yml     Local/production Docker Compose stack
  .env.example           Root Docker Compose environment template
```

## Environment Setup

Copy the example files and fill secrets locally:

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

Never commit `.env`, `backend/.env`, `frontend/.env.local`, passwords, API keys, tokens, or app passwords.

For Docker Compose, the browser should use `/api` and Next.js proxies to the backend service:

```text
NEXT_PUBLIC_API_BASE_URL=/api
INTERNAL_API_BASE_URL=http://backend:7000
MYSQL_HOST=mysql
```

For local development without Docker, the browser can call FastAPI directly:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:7000/api
MYSQL_HOST=127.0.0.1
```

## Local Development

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
python backend\scripts\run_migrations.py
python backend\scripts\create_admin.py
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 7000
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Docker Start

Configure `.env` and `backend/.env`, then run:

```powershell
docker compose build
docker compose up -d
```

Services:

- `mysql`: MySQL 8.4 database, host port `3307`
- `migrate`: applies migrations listed in `backend/scripts/migration_manifest.py`
- `admin-bootstrap`: creates or verifies the configured first admin
- `backend`: FastAPI on port `7000`
- `frontend`: Next.js on port `3000`

Startup order is MySQL healthcheck, migrations, admin bootstrap, backend healthcheck, then frontend.

## Database And Migrations

Active migrations live in `database/migrations/` and must match `backend/scripts/migration_manifest.py`. Do not bulk-run random SQL files. Safe seed data is loaded after migrations.

Manual migration command:

```powershell
python backend\scripts\run_migrations.py
```

## Admin Bootstrap

Set these in `backend/.env`:

```text
ONIRIA_ADMIN_FULL_NAME=ONIRIA Administrator
ONIRIA_ADMIN_EMAIL=admin@example.com
ONIRIA_ADMIN_PASSWORD=CHANGE_ME_STRONG_PASSWORD
ONIRIA_ADMIN_PASSWORD_CONFIRM=CHANGE_ME_STRONG_PASSWORD
ONIRIA_ADMIN_UPDATE_PASSWORD=false
```

Then run:

```powershell
python backend\scripts\create_admin.py
python backend\scripts\verify_admin.py
```

## Email, WhatsApp, And Brochure

Email is environment-driven. If `MAIL_PROVIDER` is blank, delivery is skipped safely. For SMTP:

```text
MAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-user
SMTP_PASSWORD=YOUR_GMAIL_APP_PASSWORD
SMTP_STARTTLS=true
MAIL_FROM=sales@example.com
SALES_NOTIFICATION_EMAIL=sales@example.com
```

WhatsApp credentials are optional for startup and should be set only in env files:

```text
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=
```

The brochure file is required at:

```text
backend/app/assets/ONIRIA_City_Brochure.pdf
BROCHURE_PDF_FILE=app/assets/ONIRIA_City_Brochure.pdf
```

## Verification

Frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Backend:

```powershell
python -m compileall backend\app backend\scripts
python -m pytest backend\tests -q
```

Docker Compose:

```powershell
docker compose config
docker compose build
```

Health checks:

```powershell
curl http://localhost:7000/api/health
curl http://localhost:7000/api/ready
```

## Production Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for server requirements, environment variables, Docker commands, HTTPS/reverse proxy notes, backup commands, logs, upgrades, and rollback.
