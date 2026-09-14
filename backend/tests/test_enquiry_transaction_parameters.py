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

class CapturingTransaction(StrictTransaction):
    def __init__(self):
        self.calls = []

    async def execute(self, query, *params):
        await super().execute(query, *params)
        self.calls.append(("execute", query, params))
        return 1

    async def insert_and_get_id(self, query, *params):
        await super().insert_and_get_id(query, *params)
        self.calls.append(("insert", query, params))
        return 99


@pytest.mark.asyncio
async def test_enquiry_transaction_serializes_jsonb_parameters_as_text():
    repository = LeadRepository(pool=object())
    payload = EnquiryCreate(
        name="JSON Test",
        email="json@example.com",
        phone="+255712345680",
        message="Hello",
        consent=True,
        anonymous_session_id="anon-json-12345",
    )
    transaction = CapturingTransaction()

    await repository._save_enquiry_activity_db_tx(
        transaction=transaction,
        lead={"id": 8, "property_interests": ["villa-one"], "collection_interests": []},
        payload=payload,
        reference_number="ROHO-TEST-0002",
        score=10,
        follow_up_status="nurture",
        campaign=CampaignAttribution(utm_source="website"),
        notification_status="pending",
    )

    update_call = transaction.calls[0]
    assert "CAST(%s AS text)::jsonb" in update_call[1]
    assert isinstance(update_call[2][4], str)
    assert isinstance(update_call[2][5], str)

    enquiry_call = transaction.calls[1]
    assert "CAST(%s AS text)::jsonb" in enquiry_call[1]
    assert isinstance(enquiry_call[2][5], str)

    activity_call = transaction.calls[-1]
    assert "CAST(%s AS text)::jsonb" in activity_call[1]
    assert isinstance(activity_call[2][4], str)
