# Roho Database

PostgreSQL migration files live in `database/migrations` and are applied by `backend/scripts/run_migrations.py`.

Supabase setup:

1. Create a Supabase project.
2. Set `DATABASE_URL` to the Supabase pooled PostgreSQL connection string.
3. Run `python backend\scripts\run_migrations.py`.
4. Run `python backend\scripts\create_admin.py`.
5. Verify with `python backend\scripts\check_database.py`.

Never commit real passwords or production credentials.
