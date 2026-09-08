# Historical PostgreSQL Drafts

These SQL files are historical PostgreSQL drafts from early Roho schema planning.

They must not be executed for local development, Docker, staging, or production.

The supported database is MySQL 8.4 only. Active migrations live in `database/migrations/` and are run only from the explicit MySQL manifest used by `backend/scripts/run_migrations.py`.
