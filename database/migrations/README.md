# ONIRIA PostgreSQL Migrations

Apply only the PostgreSQL migration files listed in `backend/scripts/migration_manifest.py`.

Production and local development use PostgreSQL. Supabase is supported through the PostgreSQL connection string in `DATABASE_URL`.

The active sequence starts with `001_database_setup.sql` and continues through `018_brochure_delivery.sql`; most schema objects are consolidated in `001_database_setup.sql`, while later files preserve the stable migration manifest.

After migrations, apply safe seed data in this order:

1. `staff_roles.sql`
2. `property_seed.sql`
3. `masterplan_seed.sql`
