# Roho / ONIRIA City Full-Stack Project

Production-oriented full-stack real-estate website with:

- `frontend/`: Next.js 16.3.3 public site + private admin UI
- `backend/`: FastAPI API and Vercel Python entry point
- `database/`: PostgreSQL/Supabase migrations and seed data
- `docs/`: deployment, admin and email setup guides

## Production Architecture

```text
Browser
  -> Vercel Frontend (Next.js)
       -> /api/* rewrite
            -> Vercel Backend (FastAPI)
                 -> Supabase PostgreSQL (Transaction Pooler)
```

Deploy the frontend and backend as two Vercel projects from the same repository. See `docs/PRODUCTION_DEPLOYMENT.md` for the exact order and environment variables.

## Local Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
cd ..
Copy-Item backend\.env.example backend\.env
```

For a fresh database:

```powershell
python backend\scripts\run_migrations.py --seed
python backend\scripts\create_admin.py
python backend\scripts\verify_admin.py
python backend\scripts\check_database.py
```

Run:

```powershell
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 7000
```

## Local Frontend

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

Use:

```text
NEXT_PUBLIC_API_BASE_URL=/api
INTERNAL_API_BASE_URL=http://127.0.0.1:7000
```

Open `http://localhost:3000`.

## Verification

Backend:

```powershell
python -m compileall backend\app backend\scripts
python -m pytest backend\tests -q
```

Frontend:

```powershell
cd frontend
$env:INTERNAL_API_BASE_URL="http://127.0.0.1:7000"
npm run lint
npm run build
```

## Deployment Safety Included

- Supabase TLS URL normalization.
- `asyncpg` prepared-statement cache disabled for Supavisor Transaction Pooler.
- Serverless database pool defaults documented as `1/1`.
- Applied migration checksums recorded in `schema_migrations`.
- Seed loading is explicit (`--seed`) instead of automatic on every migration.
- Production configuration validation rejects insecure HTTP origins/cookies and missing database configuration.
- Production readiness endpoint returns HTTP 503 if PostgreSQL/schema is unavailable.
- Next.js production builds require `INTERNAL_API_BASE_URL` rather than silently using a broken default.
- Security headers enabled in Next.js.
- Private environment files are ignored by Git.
- GitHub Actions CI validates backend tests and frontend lint/build.

## Secrets

Never commit `.env`, `backend/.env`, `frontend/.env.local`, database passwords, mail API keys, WhatsApp secrets, or admin bootstrap passwords.
