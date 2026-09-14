import re

import pytest

from app.repositories.lead_repository import LeadRepository
from app.schemas.enquiry_schemas import CampaignAttribution, EnquiryCreate


class StrictTransaction:
    """Mimic asyncpg's positional parameter contract for transaction calls."""

    async def execute(self, query, *params):
        expected = len(re.findall(r"%s", query))
        assert len(params) == expected, f"expected {expected} parameters, received {len(params)}"
        return 1

    async def insert_and_get_id(self, query, *params):
        expected = len(re.findall(r"%s", query))
        assert len(params) == expected, f"expected {expected} parameters, received {len(params)}"
        return 99


@pytest.mark.asyncio
async def test_enquiry_transaction_passes_database_parameters_positionally():
    repository = LeadRepository(pool=object())
    payload = EnquiryCreate(
        name="Test User",
        email="test@example.com",
        phone="+255712345678",
        message="Hello",
        consent=True,
        anonymous_session_id="anon-12345678",
    )

    result = await repository._save_enquiry_activity_db_tx(
        transaction=StrictTransaction(),
        lead={"id": 7, "property_interests": [], "collection_interests": []},
        payload=payload,
        reference_number="ROHO-TEST-0001",
        score=10,
        follow_up_status="nurture",
        campaign=CampaignAttribution(),
        notification_status="pending",
    )

    assert result["reference_number"] == "ROHO-TEST-0001"
    assert result["lead_id"] == 7
