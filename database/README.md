# Roho Database

The database is PostgreSQL/Supabase.

Active migration filenames are listed in `backend/scripts/migration_manifest.py`. The runner creates `schema_migrations`, stores a checksum for each applied file, skips migrations already applied with the same checksum, and fails if an applied file was edited.

Initial database setup:

```powershell
python backend\scripts\run_migrations.py --seed
python backend\scripts\create_admin.py
python backend\scripts\check_database.py
```

Later schema deployment:

```powershell
python backend\scripts\run_migrations.py
```

Do not run `--seed` automatically on every production deployment because catalogue/reference seeds can intentionally update seeded records.

For Supabase, use a Session Pooler/direct connection for maintenance commands when available and the Transaction Pooler for the Vercel serverless runtime.
