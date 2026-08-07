from app.repositories.lead_repository import LeadRepository
from app.schemas.enquiry_schemas import EnquiryCreate, EnquiryResponse, LeadDetail, LeadSummary
from app.services.campaign_service import CampaignService
from app.services.notification_service import NotificationService


class LeadService:
    def __init__(
        self,
        repository: LeadRepository,
        campaign_service: CampaignService,
        notification_service: NotificationService,
    ) -> None:
        self.repository = repository
        self.campaign_service = campaign_service
        self.notification_service = notification_service

    async def process_enquiry(self, payload: EnquiryCreate, *, notify_sales: bool = True) -> EnquiryResponse:
        score = self.calculate_score(payload)
        follow_up_status = self.follow_up_status(score)
        campaign = self.campaign_service.attribution_from_payload(payload)
        record = await self.repository.create_enquiry_record(
            payload=payload,
            score=score,
            follow_up_status=follow_up_status,
            campaign=campaign,
            notification_status="pending",
        )
        lead = record["lead"]
        reference_number = record["reference_number"]
        if notify_sales:
            notification_status = await self.notification_service.notify_sales_team(
                payload=payload,
                reference_number=reference_number,
                lead_id=lead["id"],
                score=score,
            )
            await self.repository.update_notification_status(reference_number, notification_status)
        return EnquiryResponse(
            reference_number=reference_number,
            lead_id=lead["id"],
            lead_score=score,
            follow_up_status=follow_up_status,
            message="Thank you. The ONIRIA City sales team will follow up with you.",
        )

    async def list_leads(self) -> list[LeadSummary]:
        return await self.repository.list_leads()

    async def get_lead(self, lead_id: int) -> LeadDetail | None:
        return await self.repository.get_lead(lead_id)

    def calculate_score(self, payload: EnquiryCreate) -> int:
        score = 10
        if payload.property_slug:
            score += 20
        if payload.collection_slug:
            score += 10
        if payload.budget:
            score += 15
        timeline = payload.purchase_timeline.value if payload.purchase_timeline else None
        if timeline in {"immediately", "1-3_months"}:
            score += 25
        elif timeline == "3-6_months":
            score += 15
        enquiry_type = payload.enquiry_type.value
        if enquiry_type == "brochure":
            score += 10
        elif enquiry_type == "consultation":
            score += 25
        elif enquiry_type == "site_visit":
            score += 35
        elif enquiry_type == "commercial":
            score += 20
        return min(score, 100)

    def follow_up_status(self, score: int) -> str:
        if score >= 70:
            return "priority_follow_up"
        if score >= 40:
            return "sales_follow_up"
        return "nurture"
