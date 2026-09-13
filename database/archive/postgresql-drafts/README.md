# Historical PostgreSQL Drafts

These SQL files are historical PostgreSQL drafts from early Roho schema planning.

They must not be executed for local development, Docker, staging, or production.

The active project now uses PostgreSQL/Supabase. Active migrations live in `database/migrations/` and are run only from the explicit PostgreSQL manifest used by `backend/scripts/run_migrations.py`.
