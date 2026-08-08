# ONIRIA MySQL Migrations

Apply only the MySQL migration files listed in `backend/scripts/migration_manifest.py`.

Do not bulk-run every `.sql` file. Production and local development use MySQL 8.4 only.

Historical PostgreSQL drafts have been moved to `database/archive/postgresql-drafts/`. They must not be executed.

The active MySQL sequence starts with `001_database_setup.sql` and continues through `018_brochure_delivery.sql`.

After the active migrations, apply safe seed data in this order:

1. `staff_roles.sql`
2. `property_seed.sql`
3. `masterplan_seed.sql`
