from datetime import datetime
from enum import Enum
import re

from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

_UNSAFE_PATTERN = re.compile(r"(<script|</script|javascript:|onerror=|onload=)", re.IGNORECASE)
_EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class EnquiryType(str, Enum):
    general = "general"
    property = "property"
    brochure = "brochure"
    consultation = "consultation"
    site_visit = "site_visit"
    commercial = "commercial"


class PurchaseTimeline(str, Enum):
    immediately = "immediately"
    one_to_three_months = "1-3_months"
    three_to_six_months = "3-6_months"
    six_plus_months = "6+_months"
    exploring = "exploring"


class CampaignAttribution(BaseModel):
    utm_source: str | None = Field(default=None, max_length=80)
    utm_medium: str | None = Field(default=None, max_length=80)
    utm_campaign: str | None = Field(default=None, max_length=120)
    utm_content: str | None = Field(default=None, max_length=120)
    utm_term: str | None = Field(default=None, max_length=120)
    landing_page: str | None = Field(default=None, max_length=300)
    referrer: str | None = Field(default=None, max_length=300)
    first_visit_at: str | None = Field(default=None, max_length=60)


class EnquiryCreate(BaseModel):
    enquiry_type: EnquiryType = EnquiryType.general
    name: str = Field(min_length=2, max_length=120)
    email: str | None = Field(default=None, max_length=254)
    phone: str | None = Field(default=None, min_length=7, max_length=30)
    country: str | None = Field(default=None, max_length=100)
    preferred_language: str | None = Field(default=None, max_length=60)
    preferred_contact_method: str | None = Field(default=None, max_length=60)
    preferred_contact_time: str | None = Field(default=None, max_length=120)
    message: str | None = Field(default=None, max_length=2000)
    property_slug: str | None = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    collection_slug: str | None = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    bedroom_preference: str | None = Field(default=None, max_length=80)
    budget: str | None = Field(default=None, max_length=80)
    buying_purpose: str | None = Field(default=None, max_length=120)
    purchase_timeline: PurchaseTimeline | None = None
    anonymous_session_id: str | None = Field(default=None, min_length=8, max_length=120)
    page_path: str | None = Field(default=None, max_length=300)
    referral_url: str | None = Field(default=None, max_length=500)
    consent: bool
    marketing_consent: bool = False
    campaign: CampaignAttribution = Field(default_factory=CampaignAttribution)

    @field_validator(
        "name",
        "phone",
        "country",
        "preferred_language",
        "preferred_contact_method",
        "preferred_contact_time",
        "message",
        "bedroom_preference",
        "budget",
        "buying_purpose",
        "anonymous_session_id",
        "page_path",
        "referral_url",
    )
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if not isinstance(value, str):
            return value
        if _UNSAFE_PATTERN.search(value):
            raise ValueError("Unsafe content is not allowed")
        return value.strip()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value is None:
            return None
        allowed = set("+0123456789 ()-")
        if any(char not in allowed for char in value):
            raise ValueError("Phone contains invalid characters")
        return value

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str | None) -> str | None:
        if value is None:
            return None
        email = value.strip().lower()
        if not _EMAIL_PATTERN.fullmatch(email):
            raise ValueError("Invalid email address")
        return email

    @model_validator(mode="after")
    def validate_contact_and_consent(self):
        if not self.email and not self.phone:
            raise ValueError("Email or phone is required")
        if not self.consent:
            raise ValueError("Consent is required")
        return self


class BrochureRequestCreate(EnquiryCreate):
    enquiry_type: EnquiryType = EnquiryType.brochure
    delivery_method: Literal["email", "whatsapp"]

    @model_validator(mode="after")
    def validate_delivery_contact(self):
        if self.delivery_method == "email" and not self.email:
            raise ValueError("Email address is required for email brochure delivery")
        if self.delivery_method == "whatsapp" and not self.phone:
            raise ValueError("Phone number is required for WhatsApp brochure delivery")
        return self


class ConsultationRequestCreate(EnquiryCreate):
    enquiry_type: EnquiryType = EnquiryType.consultation
    preferred_date: str | None = Field(default=None, max_length=40)


class SiteVisitRequestCreate(EnquiryCreate):
    enquiry_type: EnquiryType = EnquiryType.site_visit
    preferred_date: str | None = Field(default=None, max_length=40)
    number_of_guests: int | None = Field(default=None, ge=1, le=20)


class BrochureRequestResponse(BaseModel):
    reference_number: str
    lead_id: int
    lead_score: int
    follow_up_status: str
    message: str
    delivery_method: Literal["email", "whatsapp"]
    delivery_status: Literal["pending", "sent", "failed", "skipped"]
    delivered: bool


class EnquiryResponse(BaseModel):
    reference_number: str
    lead_id: int
    lead_score: int
    follow_up_status: str
    message: str


class LeadActivity(BaseModel):
    reference_number: str
    activity_type: str
    summary: str
    created_at: datetime
    campaign: CampaignAttribution


class LeadSummary(BaseModel):
    id: int
    name: str
    email: str | None
    phone: str | None
    score: int
    follow_up_status: str
    last_activity_at: datetime
    created_at: datetime


class LeadDetail(LeadSummary):
    property_interests: list[str] = Field(default_factory=list)
    collection_interests: list[str] = Field(default_factory=list)
    activities: list[LeadActivity] = Field(default_factory=list)
