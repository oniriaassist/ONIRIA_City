# Deployment

Use Supabase for PostgreSQL and Vercel for both deployable apps.

1. Create the Supabase database and set `DATABASE_URL`.
2. Deploy the backend from root directory `backend`.
3. Deploy the frontend from root directory `frontend`.
4. Configure backend `CORS_ORIGINS` and `FRONTEND_URL` with the frontend Vercel domain.
5. Configure frontend `NEXT_PUBLIC_API_BASE_URL` and `INTERNAL_API_BASE_URL` with the backend Vercel domain.
6. Run migrations and admin bootstrap from a machine with the same backend env values.

Local Docker still works with PostgreSQL:

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
docker compose up -d --build
```

Verification:

```powershell
python backend\scripts\check_database.py
python backend\scripts\verify_end_to_end_setup.py
```
