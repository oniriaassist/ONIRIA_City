from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from scripts.migration_manifest import MYSQL_MIGRATION_FILES, MYSQL_SEED_FILES


def test_active_mysql_manifest_has_all_18_migrations_and_seeds():
    root = Path(__file__).resolve().parents[2]
    assert MYSQL_MIGRATION_FILES == (
        "001_database_setup.sql",
        "002_staff_security.sql",
        "003_property_catalogue.sql",
        "004_masterplan_amenities.sql",
        "005_anonymous_sessions.sql",
        "006_customers_leads.sql",
        "007_enquiries_requests.sql",
        "008_lead_operations.sql",
        "009_campaigns.sql",
        "010_conversations.sql",
        "011_knowledge.sql",
        "012_indexes_constraints.sql",
        "013_views.sql",
        "014_audit_logs.sql",
        "015_staff_account_recovery.sql",
        "016_newsletter_subscriptions.sql",
        "017_admin_lead_summary_deduplicate.sql",
        "018_brochure_delivery.sql",
    )
    assert MYSQL_SEED_FILES == ("staff_roles.sql", "property_seed.sql", "masterplan_seed.sql")
    for file_name in MYSQL_MIGRATION_FILES:
        assert (root / "database" / "migrations" / file_name).exists()
    for file_name in MYSQL_SEED_FILES:
        assert (root / "database" / "seed" / file_name).exists()
