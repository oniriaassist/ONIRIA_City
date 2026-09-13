# Roho Backend

FastAPI backend for public content, enquiries, newsletter, AI, WhatsApp, staff authentication, and admin lead management.

The supported database is PostgreSQL. Supabase works through its PostgreSQL connection string in `DATABASE_URL`.

## Local Setup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Use either:

```text
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?sslmode=require
```

or raw local PostgreSQL fields:

```text
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5433
POSTGRES_DATABASE=oniria_city
POSTGRES_USER=oniria_user
POSTGRES_PASSWORD=<actual raw password>
```

Only `DATABASE_URL` needs percent-encoding for special characters. `POSTGRES_PASSWORD` should contain the actual password.

## Migrate, Bootstrap, Run

From the repository root:

```powershell
python backend\scripts\run_migrations.py
python backend\scripts\create_admin.py
python backend\scripts\verify_admin.py
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 7000
```

The admin bootstrap is idempotent. It does not reset an existing password unless `ONIRIA_ADMIN_UPDATE_PASSWORD=true`.

## Vercel

The Vercel entrypoint is `backend/api/index.py`, configured by `backend/vercel.json`. Deploy the backend as a separate Vercel project with root directory `backend`.

## Tests

```powershell
python -m pytest backend\tests -q
python -m compileall backend\app backend\scripts
```
