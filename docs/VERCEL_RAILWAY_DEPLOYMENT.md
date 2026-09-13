# Roho Vercel and Supabase Deployment

This project now targets:

- Frontend: Vercel project with root directory `frontend`
- Backend: Vercel project with root directory `backend`
- Database: Supabase PostgreSQL

## Supabase

1. Create a Supabase project.
2. Copy the pooled PostgreSQL connection string.
3. Set it as `DATABASE_URL` in the backend Vercel project and in `backend/.env` for local commands.
4. Run:

```bash
python backend/scripts/run_migrations.py
python backend/scripts/create_admin.py
python backend/scripts/verify_admin.py
```

## Backend Vercel Project

Root directory: `backend`

Required production variables:

```text
APP_ENV=production
APP_DEBUG=false
API_PREFIX=/api
DATABASE_URL=<supabase-postgresql-url>
CORS_ORIGINS=https://<frontend-domain>
FRONTEND_URL=https://<frontend-domain>
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAMESITE=none
ONIRIA_ADMIN_FULL_NAME=<administrator-name>
ONIRIA_ADMIN_EMAIL=<administrator-email>
ONIRIA_ADMIN_PASSWORD=<administrator-password>
ONIRIA_ADMIN_PASSWORD_CONFIRM=<administrator-password>
ONIRIA_ADMIN_UPDATE_PASSWORD=false
```

Optional mail and WhatsApp variables remain in `backend/.env.example`.

## Frontend Vercel Project

Root directory: `frontend`

```text
NEXT_PUBLIC_API_BASE_URL=https://<backend-domain>/api
INTERNAL_API_BASE_URL=https://<backend-domain>
```

## Verify

```bash
python backend/scripts/verify_production_setup.py --backend-url https://<backend-domain>
```
