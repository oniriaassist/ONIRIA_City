# Production Deployment — Supabase + Vercel

This repository is designed for three production resources:

- Supabase: PostgreSQL database
- Vercel project 1: FastAPI backend, root directory `backend`
- Vercel project 2: Next.js frontend, root directory `frontend`

The browser uses `/api`. Next.js rewrites `/api/*` to the backend, so admin cookies remain same-site on the frontend domain.

## 1. Local validation before deployment

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
cd ..
python -m compileall backend\app backend\scripts
python -m pytest backend\tests -q
```

Frontend:

```powershell
cd frontend
npm install
$env:INTERNAL_API_BASE_URL="http://127.0.0.1:7000"
$env:NEXT_PUBLIC_API_BASE_URL="/api"
npm run lint
npm run build
cd ..
```

## 2. Create Supabase

Create the Supabase project and save the database password securely.

Use two database connection modes:

- Migration/bootstrap commands: Session Pooler, normally port `5432`.
- Vercel backend runtime: Transaction Pooler, normally port `6543`.

The application disables asyncpg prepared-statement caching and automatically requires TLS for Supabase hosts, which is compatible with Supavisor transaction mode.

This project also includes migration `019_supabase_api_hardening.sql`, which revokes direct `anon` and `authenticated` Data API privileges when those Supabase roles exist. You may additionally disable the Supabase Data API because this architecture does not use it.

## 3. Configure local backend for the first database setup

Copy:

```powershell
Copy-Item backend\.env.example backend\.env
```

Set at minimum:

```text
APP_ENV=local
DATABASE_URL=<SUPABASE_SESSION_POOLER_URL>
DATABASE_MIN_SIZE=1
DATABASE_MAX_SIZE=1
ONIRIA_ADMIN_FULL_NAME=<ADMIN NAME>
ONIRIA_ADMIN_EMAIL=<ADMIN EMAIL>
ONIRIA_ADMIN_PASSWORD=<STRONG PASSWORD>
ONIRIA_ADMIN_PASSWORD_CONFIRM=<SAME STRONG PASSWORD>
```

Apply schema and initial reference data once:

```powershell
python backend\scripts\run_migrations.py --seed
python backend\scripts\create_admin.py
python backend\scripts\verify_admin.py
python backend\scripts\check_database.py
```

For later schema deployments, run migrations without `--seed`:

```powershell
python backend\scripts\run_migrations.py
```

The migration runner records filename + SHA-256 checksum in `schema_migrations` and refuses to silently modify an already-applied migration.

## 4. Deploy the backend to Vercel

Create a Vercel project from the repository.

Set **Root Directory** to:

```text
backend
```

The backend entry point is:

```text
api/index.py
```

Set these production variables:

```text
APP_NAME=Roho Backend
APP_ENV=production
APP_DEBUG=false
API_PREFIX=/api
DATABASE_URL=<SUPABASE_TRANSACTION_POOLER_6543_URL>
DATABASE_MIN_SIZE=1
DATABASE_MAX_SIZE=1
CORS_ORIGINS=https://<YOUR_FRONTEND_DOMAIN>
FRONTEND_URL=https://<YOUR_FRONTEND_DOMAIN>
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=lax
SESSION_COOKIE_DOMAIN=
LOG_LEVEL=INFO
RATE_LIMIT_PER_MINUTE=120
```

Do not put the admin bootstrap password in Vercel after the administrator has been created locally.

Optional email variables:

```text
MAIL_PROVIDER=resend
RESEND_API_KEY=<SECRET>
MAIL_FROM=<VERIFIED_SENDER>
MAIL_FROM_NAME=Roho
SALES_NOTIFICATION_EMAIL=<SALES_EMAIL>
REPLY_TO_EMAIL=<REPLY_EMAIL>
```

Optional WhatsApp variables are documented in `backend/.env.example`.

Deploy and verify:

```text
https://<backend-domain>/api/health
https://<backend-domain>/api/ready
```

In production `/api/ready` returns HTTP 503 if PostgreSQL or required tables are unavailable.

## 5. Deploy the frontend to Vercel

Create another Vercel project from the same repository.

Set **Root Directory** to:

```text
frontend
```

Set:

```text
NEXT_PUBLIC_API_BASE_URL=/api
INTERNAL_API_BASE_URL=https://<backend-domain>
```

Also set the public contact/social variables from `frontend/.env.example`.

`INTERNAL_API_BASE_URL` is required for production builds. This intentionally causes a build failure rather than deploying a frontend with a broken API target.

Deploy the frontend.

## 6. Final backend origin update

After the frontend receives its final Vercel/custom domain, update the backend Vercel variables:

```text
CORS_ORIGINS=https://<final-frontend-domain>
FRONTEND_URL=https://<final-frontend-domain>
```

Redeploy the backend.

## 7. Production acceptance tests

Verify all of the following from the final frontend URL:

- Home, properties, villas, residences and commercial pages load.
- Register Interest submits successfully.
- Contact/inquiry forms persist to Supabase.
- Newsletter subscribe/unsubscribe works.
- Admin login creates a secure HTTP-only cookie.
- Admin dashboard loads leads and enquiries.
- Lead status, assignment, notes and follow-up actions work.
- Brochure request is stored; email delivery works if mail is configured.
- Forgot-password/reset-password works if mail is configured.
- `/api/health` is HTTP 200.
- `/api/ready` is HTTP 200 in production.

Run the production verifier from your local machine with the production database environment loaded:

```powershell
python backend\scripts\verify_production_setup.py --backend-url https://<backend-domain>
```

## 8. Domain cutover

Only connect the real public domain after the Vercel URLs pass the acceptance tests. Add the final domain to the frontend project, update DNS, then ensure `FRONTEND_URL` and `CORS_ORIGINS` match the final HTTPS origin exactly.
