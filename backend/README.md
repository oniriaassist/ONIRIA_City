# Roho Backend

FastAPI API for public content, enquiries, newsletter, AI/WhatsApp integrations, staff authentication and the admin dashboard.

## Install

For runtime only:

```powershell
python -m pip install -r backend\requirements.txt
```

For development/testing:

```powershell
python -m pip install -r backend\requirements-dev.txt
```

## Database

Use PostgreSQL. Supabase is supported through `DATABASE_URL`.

For Vercel runtime use the Supabase Transaction Pooler URL and:

```text
DATABASE_MIN_SIZE=1
DATABASE_MAX_SIZE=1
```

The asyncpg connection is normalized automatically, Supabase TLS is required automatically, and prepared-statement caching is disabled for transaction-pooler compatibility.

## First setup

```powershell
Copy-Item backend\.env.example backend\.env
notepad backend\.env
python backend\scripts\run_migrations.py --seed
python backend\scripts\create_admin.py
python backend\scripts\verify_admin.py
python backend\scripts\check_database.py
```

Before running migrations, set `DATABASE_URL` in `backend\.env` to your Supabase Transaction Pooler or direct PostgreSQL URL.

Future migrations should normally omit `--seed`:

```powershell
python backend\scripts\run_migrations.py
```

## Run locally

```powershell
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 7000
```

## Vercel

The root repository `vercel.json` deploys this backend as the `backend` service and routes `/api/*` to it. Keep `backend/vercel.json` so Vercel's Python runtime can use `api/index.py` as the FastAPI entry point.

## Verify

```powershell
python -m compileall backend\app backend\scripts
python -m pytest backend\tests -q
```
