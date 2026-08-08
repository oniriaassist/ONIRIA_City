from pathlib import Path


FRONTEND_SRC = Path(__file__).resolve().parents[2] / "frontend" / "src" / "app"


def read_frontend(path: str) -> str:
    return (FRONTEND_SRC / path).read_text(encoding="utf-8")


def test_frontend_admin_requests_include_credentials_and_use_api_rewrite_fallback():
    public_api = read_frontend("services/api.js")
    admin_api = read_frontend("services/adminApi.js")
    assert 'const DEFAULT_API_BASE_URL = "/api";' in public_api
    assert "A relative API URL must be /api." in public_api
    assert "joinApiUrl(path)" in admin_api
    assert 'credentials: "include"' in admin_api
    assert "http://backend:7000" not in public_api
    assert "127.0.0.1:7000" not in admin_api


def test_frontend_login_redirects_to_admin_after_successful_login():
    login_form = read_frontend("components/admin/StaffLoginForm.js")
    login_call = login_form.index("await adminApi.login(form);")
    redirect_call = login_form.index('window.location.replace("/admin");')
    assert login_call < redirect_call
    assert "router.refresh();" not in login_form
    assert "if (loading) return;" in login_form


def test_frontend_route_guard_uses_one_logical_session_check_and_redirects_once():
    layout = read_frontend("components/admin/AdminLayout.js")
    assert 'const [status, setStatus] = useState("loading");' in layout
    assert "checkStartedRef.current" in layout
    assert "redirectedRef.current" in layout
    assert "cachedSession()" in layout
    assert 'setStatus("unauthenticated")' in layout
    assert 'router.replace("/admin/login")' in layout


def test_frontend_dashboard_waits_for_authenticated_layout_before_fetching_data():
    dashboard = read_frontend("admin/page.js")
    assert "function DashboardContent()" in dashboard
    assert "adminApi.dashboard()" in dashboard
    assert dashboard.index("<AdminLayout") < dashboard.index("<DashboardContent />")
    assert dashboard.index("function DashboardContent()") < dashboard.index("adminApi.dashboard()")


def test_frontend_public_forms_use_central_routes_and_do_not_show_raw_failed_to_fetch():
    public_api = read_frontend("services/api.js")
    contact = read_frontend("contact/page.js")
    inquiries = read_frontend("inquiries/page.js")
    footer = read_frontend("components/Footer.js")
    combined = "\n".join([public_api, contact, inquiries, footer])

    assert "joinApiUrl" in public_api
    assert 'submitEnquiry(' in contact
    assert '"/enquiries"' in contact
    assert '"/commercial-enquiries"' in contact
    assert '"/site-visits"' in inquiries
    assert '"/consultations"' in inquiries
    assert '"/brochure-requests"' in inquiries
    assert '"/newsletter/subscribe"' in public_api
    assert "Failed to fetch" not in combined


def test_frontend_api_helper_distinguishes_http_and_network_errors():
    public_api = read_frontend("services/api.js")
    assert "messageFromBody(body, response.status)" in public_api
    assert "safeValidationMessage" in public_api
    assert "network_unreachable" in public_api
    assert "The request took too long. Please try again." in public_api
    assert "We could not connect to the ONIRIA service. Please wait a moment and try again." in public_api


def test_frontend_api_helper_prevents_bad_api_url_joins():
    public_api = read_frontend("services/api.js")
    assert "joinApiUrl(path)" in public_api
    assert 'normalizedPath === "/api"' in public_api
    assert 'normalizedPath.startsWith("/api/")' in public_api
    assert "baseWithoutApi" in public_api


def test_contact_payload_matches_fastapi_enquiry_schema_names():
    contact = read_frontend("contact/page.js")
    for field in [
        "enquiry_type",
        "name",
        "email",
        "phone",
        "message",
        "anonymous_session_id",
        "consent",
        "campaign",
    ]:
        assert field in contact
    assert "full_name" not in contact


def test_frontend_password_uses_compact_eye_icon_button():
    login_form = read_frontend("components/admin/StaffLoginForm.js")
    assert "function EyeIcon" in login_form
    assert "aria-pressed={showPassword}" in login_form
    assert 'aria-label={showPassword ? "Hide password" : "Show password"}' in login_form
    assert 'type={showPassword ? "text" : "password"}' in login_form
    assert 'autoComplete="current-password"' in login_form
    assert ">Show<" not in login_form
