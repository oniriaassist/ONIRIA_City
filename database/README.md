# Roho Database

MySQL 8.x migration files live in `database/migrations` and should be applied in filename order.

Local setup:

1. Create the database with `database/scripts/create_database.sql`.
2. Create local users from `database/scripts/create_local_user.sql.example` after replacing placeholders locally.
3. Apply migrations in order.
4. Load seed files from `database/seed`.
5. Verify with `database/scripts/verify_database.sql`.

Never commit real passwords or production credentials.
