# Roho

Full-stack Roho website with a Next.js frontend, FastAPI backend, Supabase/PostgreSQL database, public enquiry flows, brochure delivery, WhatsApp hooks, staff authentication, and a private admin dashboard.

## Project Structure

```text
ONIRIA_City/
  frontend/              Next.js public website and admin dashboard UI
  backend/               FastAPI API, Vercel backend entrypoint, services, repositories, schemas, assets
  database/              PostgreSQL migrations and seed data for Supabase/local Postgres
  docs/                  Setup and deployment documentation
  docker-compose.yml     Local PostgreSQL + backend + frontend stack
  .env.example           Root Docker Compose environment template
```

## Local Setup

Copy the example files and fill secrets locally:

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

Never commit `.env`, `backend/.env`, `frontend/.env.local`, passwords, API keys, tokens, or app passwords.

For local backend development, set `backend/.env` with either a Supabase connection string:

```text
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
```

or local Docker PostgreSQL values:

```text
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_DATABASE=oniria_city
POSTGRES_USER=oniria_user
POSTGRES_PASSWORD=<strong-password>
```

For local frontend development:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:7000/api
```

## Run Locally Without Docker

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
python backend\scripts\run_migrations.py
python backend\scripts\create_admin.py
python backend\scripts\verify_admin.py
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 7000
```

Frontend:

```powershell
cd frontend
npm install
npm run typecheck
npm run dev
```

Open `http://localhost:3000`.

## Run Locally With Docker

Configure `.env` and `backend/.env`, then run:

```powershell
docker compose build
docker compose up -d
```

Services:

- `postgres`: PostgreSQL 16 database, host port `5433`
- `migrate`: applies migrations listed in `backend/scripts/migration_manifest.py`
- `admin-bootstrap`: creates or verifies the configured first admin
- `backend`: FastAPI on port `7000`
- `frontend`: Next.js on port `3000`

## Supabase

1. Create a Supabase project.
2. Copy the pooled PostgreSQL connection string from Supabase Database settings.
3. Put it in `backend/.env` locally and Vercel backend env as `DATABASE_URL`.
4. Run:

```powershell
python backend\scripts\run_migrations.py
python backend\scripts\create_admin.py
```

## Vercel Deployment

Deploy as two Vercel projects:

1. Backend project:
   - Root directory: `backend`
   - Framework preset: Other
   - Build uses `backend/vercel.json`
   - Required env: `DATABASE_URL`, `CORS_ORIGINS`, `FRONTEND_URL`, admin bootstrap values, mail/WhatsApp values as needed

2. Frontend project:
   - Root directory: `frontend`
   - Required env:

```text
NEXT_PUBLIC_API_BASE_URL=https://<your-backend-vercel-domain>/api
INTERNAL_API_BASE_URL=https://<your-backend-vercel-domain>
```

Set backend CORS for the frontend domain:

```text
CORS_ORIGINS=https://<your-frontend-vercel-domain>
FRONTEND_URL=https://<your-frontend-vercel-domain>
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=none
```

## Admin Bootstrap

Set these in `backend/.env` locally and in the backend Vercel environment:

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

## Verification

Frontend:

```powershell
cd frontend
npm run lint
npm run typecheck
npm run build
```

Backend:

```powershell
python -m compileall backend\app backend\scripts
python -m pytest backend\tests -q
```

Database/setup:

```powershell
python backend\scripts\check_database.py
python backend\scripts\verify_end_to_end_setup.py
```

Health checks:

```powershell
curl http://localhost:7000/api/health
curl http://localhost:7000/api/ready
```
