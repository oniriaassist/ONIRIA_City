from fastapi.testclient import TestClient

from app.main import app
from app.repositories.lead_repository import store


client = TestClient(app)


def setup_function():
    store.reset()


def valid_payload(**overrides):
    payload = {
        "name": "Amina Hassan",
        "email": "amina@example.com",
        "phone": "+255 700 111 222",
        "message": "I would like more details.",
        "property_slug": "skyline-villa",
        "budget": "USD 500k-750k",
        "purchase_timeline": "1-3_months",
        "anonymous_session_id": "session-12345",
        "consent": True,
        "campaign": {
            "utm_source": "google",
            "utm_medium": "cpc",
            "utm_campaign": "villa-launch",
            "landing_page": "/properties/skyline-villa",
        },
    }
    payload.update(overrides)
    return payload


def test_general_enquiry_creates_lead_reference_activity_and_campaign():
    response = client.post("/api/enquiries", json=valid_payload(enquiry_type="property"))
    assert response.status_code == 201
    body = response.json()["data"]
    assert body["reference_number"].startswith("ON-")
    assert body["lead_id"] == 1
    assert body["lead_score"] >= 70
    assert body["follow_up_status"] == "priority_follow_up"

    lead = store.leads[1]
    assert lead["email"] == "amina@example.com"
    assert lead["property_interests"] == ["skyline-villa"]
    assert store.activities[0]["campaign"].utm_source == "google"
    assert store.enquiries[0]["notification_status"] == "skipped"


def test_brochure_request_reuses_existing_lead_by_email():
    first = client.post("/api/enquiries", json=valid_payload()).json()["data"]
    second = client.post(
        "/api/brochure-requests",
        json=valid_payload(message="Send brochure.", property_slug=None, enquiry_type="brochure", delivery_method="email"),
    ).json()["data"]
    assert second["lead_id"] == first["lead_id"]
    assert second["reference_number"] != first["reference_number"]

    assert len([activity for activity in store.activities if activity["lead_id"] == 1]) == 2


def test_consultation_and_site_visit_have_high_follow_up_status():
    consultation = client.post("/api/consultations", json=valid_payload(enquiry_type="consultation")).json()["data"]
    assert consultation["follow_up_status"] == "priority_follow_up"

    site_visit_payload = valid_payload(
        email="visitor@example.com",
        phone="+255 700 333 444",
        enquiry_type="site_visit",
        preferred_date="2026-08-12",
        number_of_guests=2,
    )
    site_visit = client.post("/api/site-visits", json=site_visit_payload).json()["data"]
    assert site_visit["follow_up_status"] == "priority_follow_up"


def test_internal_lead_list_is_not_public_without_staff_database_session():
    client.post("/api/enquiries", json=valid_payload())
    response = client.get("/api/internal/leads")
    assert response.status_code in {401, 503}


def test_rejects_missing_contact_or_consent():
    no_contact = valid_payload(email=None, phone=None)
    response = client.post("/api/enquiries", json=no_contact)
    assert response.status_code == 422

    no_consent = valid_payload(consent=False)
    response = client.post("/api/enquiries", json=no_consent)
    assert response.status_code == 422


def test_rejects_unsafe_message():
    response = client.post("/api/enquiries", json=valid_payload(message="<script>alert(1)</script>"))
    assert response.status_code == 422
