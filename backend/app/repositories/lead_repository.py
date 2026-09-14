from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
import json
from typing import Any

from app.schemas.enquiry_schemas import CampaignAttribution, EnquiryCreate, LeadActivity, LeadDetail, LeadSummary
from app.utils.reference_number import make_reference_number

class InMemoryLeadStore:
    def __init__(self) -> None:
        self.leads: dict[int, dict[str, Any]] = {}
        self.enquiries: list[dict[str, Any]] = []
        self.activities: list[dict[str, Any]] = []
        self.lead_sequence = 0
        self.reference_sequence = 0

    def reset(self) -> None:
        self.leads.clear()
        self.enquiries.clear()
        self.activities.clear()
        self.lead_sequence = 0
        self.reference_sequence = 0


store = InMemoryLeadStore()


class LeadRepository:
    def __init__(self, pool: Any | None = None, memory_store: InMemoryLeadStore = store) -> None:
        self.pool = pool
        self.store = memory_store

    async def next_reference_sequence(self) -> int:
        if self.pool:
            return await self.pool.insert_and_get_id("INSERT INTO enquiry_reference_sequence DEFAULT VALUES")
        self.store.reference_sequence += 1
        return self.store.reference_sequence

    async def find_or_create_lead(self, payload: EnquiryCreate) -> dict[str, Any]:
        if self.pool:
            return await self._find_or_create_lead_db(payload)

        now = datetime.now(timezone.utc)
        email = str(payload.email).lower() if payload.email else None
        phone = payload.phone
        for lead in self.store.leads.values():
            if email and lead.get("email") == email:
                return lead
            if phone and lead.get("phone") == phone:
                return lead

        self.store.lead_sequence += 1
        lead = {
            "id": self.store.lead_sequence,
            "name": payload.name,
            "email": email,
            "phone": phone,
            "score": 0,
            "follow_up_status": "new",
            "property_interests": [],
            "collection_interests": [],
            "created_at": now,
            "last_activity_at": now,
        }
        self.store.leads[lead["id"]] = lead
        return lead

    async def create_enquiry_record(
        self,
        *,
        payload: EnquiryCreate,
        score: int,
        follow_up_status: str,
        campaign: CampaignAttribution,
        notification_status: str = "pending",
    ) -> dict[str, Any]:
        if self.pool:
            return await self._create_enquiry_record_db(
                payload=payload,
                score=score,
                follow_up_status=follow_up_status,
                campaign=campaign,
                notification_status=notification_status,
            )

        lead = await self.find_or_create_lead(payload)
        sequence = await self.next_reference_sequence()
        reference_number = make_reference_number(sequence)
        enquiry = await self.save_enquiry_activity(
            lead=lead,
            payload=payload,
            reference_number=reference_number,
            score=score,
            follow_up_status=follow_up_status,
            campaign=campaign,
            notification_status=notification_status,
        )
        return {"lead": lead, "enquiry": enquiry, "reference_number": reference_number}

    async def update_notification_status(self, reference_number: str, notification_status: str) -> None:
        if self.pool:
            await self.pool.execute(
                "UPDATE enquiries SET notification_status = %s WHERE reference_number = %s",
                notification_status,
                reference_number,
            )
            return

        for enquiry in self.store.enquiries:
            if enquiry["reference_number"] == reference_number:
                enquiry["notification_status"] = notification_status
                return

    async def save_enquiry_activity(
        self,
        *,
        lead: dict[str, Any],
        payload: EnquiryCreate,
        reference_number: str,
        score: int,
        follow_up_status: str,
        campaign: CampaignAttribution,
        notification_status: str,
    ) -> dict[str, Any]:
        if self.pool:
            return await self._save_enquiry_activity_db(
                lead=lead,
                payload=payload,
                reference_number=reference_number,
                score=score,
                follow_up_status=follow_up_status,
                campaign=campaign,
                notification_status=notification_status,
            )

        now = datetime.now(timezone.utc)
        lead["score"] = max(lead["score"], score)
        lead["follow_up_status"] = follow_up_status
        lead["last_activity_at"] = now
        if payload.property_slug and payload.property_slug not in lead["property_interests"]:
            lead["property_interests"].append(payload.property_slug)
        if payload.collection_slug and payload.collection_slug not in lead["collection_interests"]:
            lead["collection_interests"].append(payload.collection_slug)

        enquiry = {
            "reference_number": reference_number,
            "lead_id": lead["id"],
            "enquiry_type": payload.enquiry_type.value,
            "payload": payload.model_dump(mode="json"),
            "score": score,
            "follow_up_status": follow_up_status,
            "notification_status": notification_status,
            "created_at": now,
        }
        self.store.enquiries.append(enquiry)

        activity = {
            "lead_id": lead["id"],
            "reference_number": reference_number,
            "activity_type": payload.enquiry_type.value,
            "summary": self._activity_summary(payload),
            "created_at": now,
            "campaign": campaign,
        }
        self.store.activities.append(activity)
        return enquiry

    async def list_leads(self) -> list[LeadSummary]:
        if self.pool:
            rows = await self.pool.fetch(
                """
                SELECT id, name, email, phone, score, follow_up_status, last_activity_at, created_at
                FROM leads
                ORDER BY last_activity_at DESC
                """
            )
            return [LeadSummary(**dict(row)) for row in rows]

        leads = sorted(self.store.leads.values(), key=lambda item: item["last_activity_at"], reverse=True)
        return [LeadSummary(**deepcopy(lead)) for lead in leads]

    async def get_lead(self, lead_id: int) -> LeadDetail | None:
        if self.pool:
            row = await self.pool.fetchrow(
                """
                SELECT id, name, email, phone, score, follow_up_status, property_interests,
                       collection_interests, last_activity_at, created_at
                FROM leads
                WHERE id = %s
                """,
                lead_id,
            )
            if not row:
                return None
            activities = await self.pool.fetch(
                """
                SELECT reference_number, activity_type, summary, created_at, campaign
                FROM lead_activities
                WHERE lead_id = %s
                ORDER BY created_at DESC
                """,
                lead_id,
            )
            data = self._normalize_db_lead(row)
            data["activities"] = [
                LeadActivity(
                    reference_number=activity["reference_number"],
                    activity_type=activity["activity_type"],
                    summary=activity["summary"],
                    created_at=activity["created_at"],
                    campaign=CampaignAttribution(**self._json_dict(activity.get("campaign"))),
                )
                for activity in activities
            ]
            return LeadDetail(**data)

        lead = self.store.leads.get(lead_id)
        if not lead:
            return None
        activities = [
            LeadActivity(
                reference_number=item["reference_number"],
                activity_type=item["activity_type"],
                summary=item["summary"],
                created_at=item["created_at"],
                campaign=item["campaign"],
            )
            for item in self.store.activities
            if item["lead_id"] == lead_id
        ]
        data = deepcopy(lead)
        data["activities"] = sorted(activities, key=lambda item: item.created_at, reverse=True)
        return LeadDetail(**data)

    async def _find_or_create_lead_db(self, payload: EnquiryCreate) -> dict[str, Any]:
        email = str(payload.email).lower() if payload.email else None
        phone = payload.phone
        customer_id = await self._find_or_create_customer_db(payload)
        existing = None
        if email:
            existing = await self.pool.fetchrow("SELECT * FROM leads WHERE email = %s LIMIT 1", email)
        if not existing and phone:
            existing = await self.pool.fetchrow("SELECT * FROM leads WHERE phone = %s LIMIT 1", phone)
        if existing:
            return self._normalize_db_lead(existing)

        lead_id = await self.pool.insert_and_get_id(
            """
            INSERT INTO leads (
                customer_id, name, email, phone, anonymous_session_id, property_interest,
                bedroom_preference, budget_range, buying_purpose, purchase_timeframe,
                source_platform, campaign_name, utm_source, utm_medium, utm_campaign,
                utm_content, utm_term, landing_page, referral_url, score, lead_score,
                follow_up_status, lead_status, property_interests, collection_interests
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0, 0, 'new', 'New', '[]'::jsonb, '[]'::jsonb)
            """,
            customer_id,
            payload.name,
            email,
            phone,
            payload.anonymous_session_id,
            payload.property_slug or payload.collection_slug,
            payload.bedroom_preference,
            payload.budget,
            payload.buying_purpose,
            payload.purchase_timeline.value if payload.purchase_timeline else None,
            payload.campaign.utm_source,
            payload.campaign.utm_campaign,
            payload.campaign.utm_source,
            payload.campaign.utm_medium,
            payload.campaign.utm_campaign,
            payload.campaign.utm_content,
            payload.campaign.utm_term,
            payload.page_path or payload.campaign.landing_page,
            payload.referral_url or payload.campaign.referrer,
        )
        created = await self.pool.fetchrow("SELECT * FROM leads WHERE id = %s", lead_id)
        return self._normalize_db_lead(created)

    async def _create_enquiry_record_db(
        self,
        *,
        payload: EnquiryCreate,
        score: int,
        follow_up_status: str,
        campaign: CampaignAttribution,
        notification_status: str,
    ) -> dict[str, Any]:
        async with self.pool.transaction() as transaction:
            sequence = await transaction.insert_and_get_id(
                "INSERT INTO enquiry_reference_sequence DEFAULT VALUES"
            )
            reference_number = make_reference_number(sequence)
            lead = await self._find_or_create_lead_db_tx(transaction, payload)
            enquiry = await self._save_enquiry_activity_db_tx(
                transaction=transaction,
                lead=lead,
                payload=payload,
                reference_number=reference_number,
                score=score,
                follow_up_status=follow_up_status,
                campaign=campaign,
                notification_status=notification_status,
            )
            return {"lead": lead, "enquiry": enquiry, "reference_number": reference_number}

    async def _find_or_create_lead_db_tx(self, transaction: Any, payload: EnquiryCreate) -> dict[str, Any]:
        email = str(payload.email).lower() if payload.email else None
        phone = payload.phone
        customer_id = await self._find_or_create_customer_db_tx(transaction, payload)
        existing = None
        if email:
            existing = await transaction.fetchrow("SELECT * FROM leads WHERE email = %s LIMIT 1", email)
        if not existing and phone:
            existing = await transaction.fetchrow("SELECT * FROM leads WHERE phone = %s LIMIT 1", phone)
        if existing:
            return self._normalize_db_lead(existing)

        lead_id = await transaction.insert_and_get_id(
            """
            INSERT INTO leads (
                customer_id, name, email, phone, anonymous_session_id, property_interest,
                bedroom_preference, budget_range, buying_purpose, purchase_timeframe,
                source_platform, campaign_name, utm_source, utm_medium, utm_campaign,
                utm_content, utm_term, landing_page, referral_url, score, lead_score,
                follow_up_status, lead_status, property_interests, collection_interests
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0, 0, 'new', 'New', '[]'::jsonb, '[]'::jsonb)
            """,
            customer_id,
            payload.name,
            email,
            phone,
            payload.anonymous_session_id,
            payload.property_slug or payload.collection_slug,
            payload.bedroom_preference,
            payload.budget,
            payload.buying_purpose,
            payload.purchase_timeline.value if payload.purchase_timeline else None,
            payload.campaign.utm_source,
            payload.campaign.utm_campaign,
            payload.campaign.utm_source,
            payload.campaign.utm_medium,
            payload.campaign.utm_campaign,
            payload.campaign.utm_content,
            payload.campaign.utm_term,
            payload.page_path or payload.campaign.landing_page,
            payload.referral_url or payload.campaign.referrer,
        )
        return self._normalize_db_lead(await transaction.fetchrow("SELECT * FROM leads WHERE id = %s", lead_id))

    async def _find_or_create_customer_db_tx(self, transaction: Any, payload: EnquiryCreate) -> int | None:
        email = str(payload.email).lower() if payload.email else None
        phone = payload.phone
        existing = None
        if email:
            existing = await transaction.fetchrow("SELECT id FROM customers WHERE email = %s LIMIT 1", email)
        if not existing and phone:
            existing = await transaction.fetchrow("SELECT id FROM customers WHERE phone = %s LIMIT 1", phone)
        if existing:
            await transaction.execute(
                """
                UPDATE customers
                SET full_name = %s,
                    phone = COALESCE(%s, phone),
                    country = COALESCE(%s, country),
                    preferred_language = COALESCE(%s, preferred_language),
                    preferred_contact_method = COALESCE(%s, preferred_contact_method),
                    marketing_consent = marketing_consent OR %s,
                    privacy_consent = %s
                WHERE id = %s
                """,
                payload.name,
                phone,
                payload.country,
                payload.preferred_language,
                payload.preferred_contact_method,
                bool(payload.marketing_consent),
                bool(payload.consent),
                existing["id"],
            )
            return int(existing["id"])
        return await transaction.insert_and_get_id(
            """
            INSERT INTO customers (
                full_name, email, phone, country, preferred_language,
                preferred_contact_method, marketing_consent, privacy_consent
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            payload.name,
            email,
            phone,
            payload.country,
            payload.preferred_language,
            payload.preferred_contact_method,
            bool(payload.marketing_consent),
            bool(payload.consent),
        )

    async def _save_enquiry_activity_db_tx(
        self,
        *,
        transaction: Any,
        lead: dict[str, Any],
        payload: EnquiryCreate,
        reference_number: str,
        score: int,
        follow_up_status: str,
        campaign: CampaignAttribution,
        notification_status: str,
    ) -> dict[str, Any]:
        property_interests = list(lead.get("property_interests") or [])
        collection_interests = list(lead.get("collection_interests") or [])
        if payload.property_slug and payload.property_slug not in property_interests:
            property_interests.append(payload.property_slug)
        if payload.collection_slug and payload.collection_slug not in collection_interests:
            collection_interests.append(payload.collection_slug)

        await transaction.execute(
            """
            UPDATE leads
            SET score = GREATEST(score, %s),
                lead_score = GREATEST(lead_score, %s),
                follow_up_status = %s,
                lead_status = CASE WHEN lead_status = 'New' THEN 'New' ELSE lead_status END,
                reference_number = COALESCE(reference_number, %s),
                property_interests = CAST(%s AS text)::jsonb,
                collection_interests = CAST(%s AS text)::jsonb,
                property_interest = COALESCE(%s, property_interest),
                bedroom_preference = COALESCE(%s, bedroom_preference),
                budget_range = COALESCE(%s, budget_range),
                buying_purpose = COALESCE(%s, buying_purpose),
                purchase_timeframe = COALESCE(%s, purchase_timeframe),
                source_platform = COALESCE(%s, source_platform),
                campaign_name = COALESCE(%s, campaign_name),
                utm_source = COALESCE(%s, utm_source),
                utm_medium = COALESCE(%s, utm_medium),
                utm_campaign = COALESCE(%s, utm_campaign),
                utm_content = COALESCE(%s, utm_content),
                utm_term = COALESCE(%s, utm_term),
                landing_page = COALESCE(%s, landing_page),
                referral_url = COALESCE(%s, referral_url),
                last_activity_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            score,
            score,
            follow_up_status,
            reference_number,
            json.dumps(property_interests, ensure_ascii=False),
            json.dumps(collection_interests, ensure_ascii=False),
            payload.property_slug or payload.collection_slug,
            payload.bedroom_preference,
            payload.budget,
            payload.buying_purpose,
            payload.purchase_timeline.value if payload.purchase_timeline else None,
            campaign.utm_source,
            campaign.utm_campaign,
            campaign.utm_source,
            campaign.utm_medium,
            campaign.utm_campaign,
            campaign.utm_content,
            campaign.utm_term,
            payload.page_path or campaign.landing_page,
            payload.referral_url or campaign.referrer,
            lead["id"],
        )
        enquiry_id = await transaction.insert_and_get_id(
            """
            INSERT INTO enquiries (
                reference_number, lead_id, enquiry_type, message, preferred_contact_time, payload, score, follow_up_status, notification_status
            )
            VALUES (%s, %s, %s, %s, %s, CAST(%s AS text)::jsonb, %s, %s, %s)
            """,
            reference_number,
            lead["id"],
            payload.enquiry_type.value,
            payload.message,
            payload.preferred_contact_time,
            json.dumps(payload.model_dump(mode="json"), ensure_ascii=False),
            score,
            follow_up_status,
            notification_status,
        )
        if payload.enquiry_type.value == "brochure":
            await transaction.execute("INSERT INTO brochure_requests (lead_id, enquiry_id) VALUES (%s, %s)", lead["id"], enquiry_id)
        elif payload.enquiry_type.value == "consultation":
            await transaction.execute(
                "INSERT INTO consultations (lead_id, enquiry_id, preferred_date) VALUES (%s, %s, %s)",
                lead["id"], enquiry_id, getattr(payload, "preferred_date", None),
            )
        elif payload.enquiry_type.value == "site_visit":
            await transaction.execute(
                "INSERT INTO site_visits (lead_id, enquiry_id, preferred_date, number_of_guests) VALUES (%s, %s, %s, %s)",
                lead["id"], enquiry_id, getattr(payload, "preferred_date", None), getattr(payload, "number_of_guests", None),
            )
        await transaction.execute(
            """
            INSERT INTO lead_activities (lead_id, reference_number, activity_type, summary, campaign)
            VALUES (%s, %s, %s, %s, CAST(%s AS text)::jsonb)
            """,
            lead["id"],
            reference_number,
            payload.enquiry_type.value,
            self._activity_summary(payload),
            json.dumps(campaign.model_dump(mode="json"), ensure_ascii=False),
        )
        return {
            "reference_number": reference_number,
            "lead_id": lead["id"],
            "enquiry_type": payload.enquiry_type.value,
            "score": score,
            "follow_up_status": follow_up_status,
            "notification_status": notification_status,
        }

    async def _save_enquiry_activity_db(self, **kwargs) -> dict[str, Any]:
        lead = kwargs["lead"]
        payload: EnquiryCreate = kwargs["payload"]
        reference_number = kwargs["reference_number"]
        score = kwargs["score"]
        follow_up_status = kwargs["follow_up_status"]
        campaign: CampaignAttribution = kwargs["campaign"]
        notification_status = kwargs["notification_status"]

        property_interests = list(lead.get("property_interests") or [])
        collection_interests = list(lead.get("collection_interests") or [])
        if payload.property_slug and payload.property_slug not in property_interests:
            property_interests.append(payload.property_slug)
        if payload.collection_slug and payload.collection_slug not in collection_interests:
            collection_interests.append(payload.collection_slug)

        await self.pool.execute(
            """
            UPDATE leads
            SET score = GREATEST(score, %s),
                lead_score = GREATEST(lead_score, %s),
                follow_up_status = %s,
                lead_status = CASE WHEN lead_status = 'New' THEN 'New' ELSE lead_status END,
                reference_number = COALESCE(reference_number, %s),
                property_interests = CAST(%s AS text)::jsonb,
                collection_interests = CAST(%s AS text)::jsonb,
                property_interest = COALESCE(%s, property_interest),
                bedroom_preference = COALESCE(%s, bedroom_preference),
                budget_range = COALESCE(%s, budget_range),
                buying_purpose = COALESCE(%s, buying_purpose),
                purchase_timeframe = COALESCE(%s, purchase_timeframe),
                source_platform = COALESCE(%s, source_platform),
                campaign_name = COALESCE(%s, campaign_name),
                utm_source = COALESCE(%s, utm_source),
                utm_medium = COALESCE(%s, utm_medium),
                utm_campaign = COALESCE(%s, utm_campaign),
                utm_content = COALESCE(%s, utm_content),
                utm_term = COALESCE(%s, utm_term),
                landing_page = COALESCE(%s, landing_page),
                referral_url = COALESCE(%s, referral_url),
                last_activity_at = CURRENT_TIMESTAMP
            WHERE id = %s
            """,
            score,
            score,
            follow_up_status,
            reference_number,
            json.dumps(property_interests, ensure_ascii=False),
            json.dumps(collection_interests, ensure_ascii=False),
            payload.property_slug or payload.collection_slug,
            payload.bedroom_preference,
            payload.budget,
            payload.buying_purpose,
            payload.purchase_timeline.value if payload.purchase_timeline else None,
            campaign.utm_source,
            campaign.utm_campaign,
            campaign.utm_source,
            campaign.utm_medium,
            campaign.utm_campaign,
            campaign.utm_content,
            campaign.utm_term,
            payload.page_path or campaign.landing_page,
            payload.referral_url or campaign.referrer,
            lead["id"],
        )
        enquiry_id = await self.pool.insert_and_get_id(
            """
            INSERT INTO enquiries (
                reference_number, lead_id, enquiry_type, message, preferred_contact_time, payload, score, follow_up_status, notification_status
            )
            VALUES (%s, %s, %s, %s, %s, CAST(%s AS text)::jsonb, %s, %s, %s)
            """,
            reference_number,
            lead["id"],
            payload.enquiry_type.value,
            payload.message,
            payload.preferred_contact_time,
            json.dumps(payload.model_dump(mode="json"), ensure_ascii=False),
            score,
            follow_up_status,
            notification_status,
        )
        if payload.enquiry_type.value == "brochure":
            await self.pool.execute("INSERT INTO brochure_requests (lead_id, enquiry_id) VALUES (%s, %s)", lead["id"], enquiry_id)
        elif payload.enquiry_type.value == "consultation":
            await self.pool.execute(
                "INSERT INTO consultations (lead_id, enquiry_id, preferred_date) VALUES (%s, %s, %s)",
                lead["id"],
                enquiry_id,
                getattr(payload, "preferred_date", None),
            )
        elif payload.enquiry_type.value == "site_visit":
            await self.pool.execute(
                "INSERT INTO site_visits (lead_id, enquiry_id, preferred_date, number_of_guests) VALUES (%s, %s, %s, %s)",
                lead["id"],
                enquiry_id,
                getattr(payload, "preferred_date", None),
                getattr(payload, "number_of_guests", None),
            )
        activity_summary = self._activity_summary(payload)
        await self.pool.execute(
            """
            INSERT INTO lead_activities (lead_id, reference_number, activity_type, summary, campaign)
            VALUES (%s, %s, %s, %s, CAST(%s AS text)::jsonb)
            """,
            lead["id"],
            reference_number,
            payload.enquiry_type.value,
            activity_summary,
            json.dumps(campaign.model_dump(mode="json"), ensure_ascii=False),
        )
        return {
            "reference_number": reference_number,
            "lead_id": lead["id"],
            "enquiry_type": payload.enquiry_type.value,
            "score": score,
            "follow_up_status": follow_up_status,
            "notification_status": notification_status,
        }

    async def _find_or_create_customer_db(self, payload: EnquiryCreate) -> int | None:
        email = str(payload.email).lower() if payload.email else None
        phone = payload.phone
        existing = None
        if email:
            existing = await self.pool.fetchrow("SELECT id FROM customers WHERE email = %s LIMIT 1", email)
        if not existing and phone:
            existing = await self.pool.fetchrow("SELECT id FROM customers WHERE phone = %s LIMIT 1", phone)
        if existing:
            await self.pool.execute(
                """
                UPDATE customers
                SET full_name = %s,
                    phone = COALESCE(%s, phone),
                    country = COALESCE(%s, country),
                    preferred_language = COALESCE(%s, preferred_language),
                    preferred_contact_method = COALESCE(%s, preferred_contact_method),
                    marketing_consent = marketing_consent OR %s,
                    privacy_consent = %s
                WHERE id = %s
                """,
                payload.name,
                phone,
                payload.country,
                payload.preferred_language,
                payload.preferred_contact_method,
                bool(payload.marketing_consent),
                bool(payload.consent),
                existing["id"],
            )
            return int(existing["id"])
        try:
            return await self.pool.insert_and_get_id(
                """
                INSERT INTO customers (
                    full_name, email, phone, country, preferred_language,
                    preferred_contact_method, marketing_consent, privacy_consent
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                payload.name,
                email,
                phone,
                payload.country,
                payload.preferred_language,
                payload.preferred_contact_method,
                bool(payload.marketing_consent),
                bool(payload.consent),
            )
        except Exception:
            return None

    def _normalize_db_lead(self, row: dict[str, Any] | None) -> dict[str, Any]:
        if row is None:
            raise RuntimeError("Lead row was not found after database write")
        data = dict(row)
        data["property_interests"] = self._json_list(data.get("property_interests"))
        data["collection_interests"] = self._json_list(data.get("collection_interests"))
        return data

    def _json_list(self, value: Any) -> list[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, (bytes, bytearray)):
            value = value.decode("utf-8")
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, list) else []
            except json.JSONDecodeError:
                return []
        return []

    def _json_dict(self, value: Any) -> dict[str, Any]:
        if value is None:
            return {}
        if isinstance(value, dict):
            return value
        if isinstance(value, (bytes, bytearray)):
            value = value.decode("utf-8")
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, dict) else {}
            except json.JSONDecodeError:
                return {}
        return {}

    def _activity_summary(self, payload: EnquiryCreate) -> str:
        interest = payload.property_slug or payload.collection_slug or "general Roho"
        return f"{payload.enquiry_type.value.replace('_', ' ').title()} enquiry for {interest}"
