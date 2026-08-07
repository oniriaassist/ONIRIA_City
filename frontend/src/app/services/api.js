const REQUEST_TIMEOUT_MS = 12000;
const DEFAULT_API_BASE_URL = "/api";

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const value = configured || DEFAULT_API_BASE_URL;

  if (value.startsWith("/")) {
    const normalized = value.replace(/\/$/, "");
    if (normalized !== "/api") {
      throw new Error("A relative API URL must be /api.");
    }
    return normalized;
  }

  try {
    const url = new URL(value);
    if (!url.pathname.replace(/\/$/, "").endsWith("/api")) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL must include the /api path.");
    }
    return url.toString().replace(/\/$/, "");
  } catch (error) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL must be /api or a valid URL ending in /api.");
  }
}

export function joinApiUrl(path) {
  const base = getApiBaseUrl();
  const normalizedPath = `/${String(path || "").replace(/^\/+/, "")}`;

  if (base.startsWith("/")) {
    if (normalizedPath === "/api" || normalizedPath.startsWith("/api/")) {
      return normalizedPath;
    }
    return `${base}${normalizedPath}`;
  }

  const baseWithoutApi = base.replace(/\/api$/, "");
  if (normalizedPath === "/api" || normalizedPath.startsWith("/api/")) {
    return `${baseWithoutApi}${normalizedPath}`;
  }
  return `${base}${normalizedPath}`;
}

function safeValidationMessage(details) {
  if (!Array.isArray(details) || !details.length) {
    return null;
  }
  const first = details[0];
  if (typeof first?.msg === "string") {
    return first.msg.replace(/^Value error,\s*/i, "");
  }
  if (typeof first === "string") {
    return first;
  }
  return null;
}

function messageFromBody(body, status) {
  const apiMessage = body?.error?.message || body?.detail;
  const validationMessage = safeValidationMessage(body?.error?.details || body?.detail);
  if (validationMessage) {
    return validationMessage;
  }
  if (status === 409) {
    return "This email is already subscribed.";
  }
  if (status === 422 && apiMessage) {
    return typeof apiMessage === "string" ? apiMessage : "Please check the form and try again.";
  }
  if (status >= 500) {
    return "We could not complete your request. Please try again.";
  }
  return typeof apiMessage === "string" ? apiMessage : "We could not complete your request. Please try again.";
}

function normalizeNetworkError(error) {
  if (error.name === "AbortError") {
    return new ApiError("The request took too long. Please try again.", { code: "timeout" });
  }
  if (error instanceof TypeError) {
    return new ApiError("We could not connect to the ONIRIA service. Please wait a moment and try again.", { code: "network_unreachable" });
  }
  return error;
}

export function getAnonymousSessionId() {
  if (typeof window === "undefined") {
    return "";
  }
  const key = "oniria_anonymous_session_id";
  let sessionId = window.localStorage.getItem(key);
  if (!sessionId) {
    sessionId = `anon-${crypto.randomUUID()}`;
    window.localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export function getCampaignAttribution() {
  if (typeof window === "undefined") {
    return {};
  }
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || null,
    utm_medium: params.get("utm_medium") || null,
    utm_campaign: params.get("utm_campaign") || null,
    utm_content: params.get("utm_content") || null,
    utm_term: params.get("utm_term") || null,
    landing_page: window.location.pathname,
    referrer: document.referrer || null,
  };
}

function enrichEnquiryPayload(payload) {
  if (typeof window === "undefined") {
    return payload;
  }

  return {
    anonymous_session_id: payload.anonymous_session_id || getAnonymousSessionId(),
    page_path: payload.page_path || window.location.pathname,
    referral_url: payload.referral_url || document.referrer || null,
    campaign: {
      ...getCampaignAttribution(),
      ...(payload.campaign || {}),
    },
    ...payload,
  };
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(joinApiUrl(path), {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
      signal: options.signal || controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.success) {
      throw new ApiError(messageFromBody(body, response.status), {
        status: response.status,
        code: body?.error?.code,
        details: body?.error?.details,
      });
    }
    return body.data;
  } catch (error) {
    throw normalizeNetworkError(error);
  } finally {
    clearTimeout(timeout);
  }
}

export function formatSubmissionSuccess(result, fallbackMessage) {
  const message = result?.message || fallbackMessage;
  return result?.reference_number ? `${message} Reference: ${result.reference_number}` : message;
}

export function submitEnquiry(payload, endpoint = "/enquiries") {
  return request(endpoint, {
    method: "POST",
    body: JSON.stringify(enrichEnquiryPayload(payload)),
  });
}

export function subscribeNewsletter(payload) {
  return request("/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({
      ...getCampaignAttribution(),
      anonymous_session_id: payload.anonymous_session_id || getAnonymousSessionId(),
      source_page: payload.source_page || (typeof window === "undefined" ? null : window.location.pathname),
      ...payload,
    }),
  });
}

export function askOniriaAI(payload) {
  return request("/ai/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
