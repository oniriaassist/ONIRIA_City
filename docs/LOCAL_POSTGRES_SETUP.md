# Local PostgreSQL Setup

Fast path:

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
docker compose up -d --build
```

Manual path:

1. Start PostgreSQL locally or create a Supabase project.
2. Configure `backend/.env` with either `DATABASE_URL` or `POSTGRES_*`.
3. Run `python backend\scripts\run_migrations.py`.
4. Run `python backend\scripts\create_admin.py`.
5. Run `python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 7000`.
