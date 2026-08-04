import { joinApiUrl } from "./api";

let sessionCheckPromise = null;
let cachedSession = null;

async function request(path, options = {}) {
  const response = await fetch(joinApiUrl(path), {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.success === false) {
    const message = body?.error?.message || body?.detail || "Admin request failed";
    throw new Error(message);
  }
  return body.data;
}

async function download(path, fallbackFilename) {
  const response = await fetch(joinApiUrl(path), { credentials: "include" });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error?.message || body?.detail || "Unable to download data");
  }
  const disposition = response.headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match?.[1] || fallbackFilename;
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return filename;
}

export const adminApi = {
  login: async (payload) => {
    const session = await request("/admin/login", { method: "POST", body: JSON.stringify(payload) });
    cachedSession = session;
    sessionCheckPromise = Promise.resolve(session);
    return session;
  },
  forgotPassword: (payload) =>
    request("/admin/auth/forgot-password", { method: "POST", body: JSON.stringify(payload) }),
  validateResetToken: (payload) =>
    request("/admin/auth/validate-reset-token", { method: "POST", body: JSON.stringify(payload) }),
  resetPassword: (payload) =>
    request("/admin/auth/reset-password", { method: "POST", body: JSON.stringify(payload) }),
  recoveryRequest: (payload) =>
    request("/admin/auth/recovery-request", { method: "POST", body: JSON.stringify(payload) }),
  logout: async () => {
    clearAdminSessionCache();
    return request("/admin/logout", { method: "POST" });
  },
  session: () => request("/admin/session"),
  cachedSession: () => {
    if (cachedSession) {
      return Promise.resolve(cachedSession);
    }
    if (!sessionCheckPromise) {
      sessionCheckPromise = request("/admin/session")
        .then((session) => {
          cachedSession = session;
          return session;
        })
        .catch((error) => {
          sessionCheckPromise = null;
          throw error;
        });
    }
    return sessionCheckPromise;
  },
  dashboard: () => request("/admin/dashboard"),
  exportData: ({ format = "xlsx", dataset = "all" } = {}) =>
    download(`/admin/data-export?format=${encodeURIComponent(format)}&dataset=${encodeURIComponent(dataset)}`, `oniria-${dataset}.${format}`),
  leads: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
    );
    return request(`/admin/leads${query.toString() ? `?${query}` : ""}`);
  },
  lead: (id) => request(`/admin/leads/${id}`),
  updateLead: (id, payload) =>
    request(`/admin/leads/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  assignLead: (id, staffId) =>
    request(`/admin/leads/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ staff_id: Number(staffId) }),
    }),
  addNote: (id, note) =>
    request(`/admin/leads/${id}/notes`, { method: "POST", body: JSON.stringify({ note }) }),
  addFollowUp: (id, payload) =>
    request(`/admin/leads/${id}/follow-up`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  list: (path) => request(`/admin/${path}`),
  staff: () => request("/admin/staff"),
  createStaff: (payload) =>
    request("/admin/staff", { method: "POST", body: JSON.stringify(payload) }),
  disableStaff: (id) => request(`/admin/staff/${id}/disable`, { method: "POST" }),
  recoveryRequests: () => request("/admin/account-recovery-requests"),
  recoveryRequestDetail: (id) => request(`/admin/account-recovery-requests/${id}`),
  updateRecoveryRequest: (id, payload) =>
    request(`/admin/account-recovery-requests/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  assignRecoveryRequest: (id, adminId) =>
    request(`/admin/account-recovery-requests/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ admin_id: adminId }),
    }),
  resolveRecoveryRequest: (id, resolutionNote) =>
    request(`/admin/account-recovery-requests/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolution_note: resolutionNote }),
    }),
  rejectRecoveryRequest: (id, resolutionNote) =>
    request(`/admin/account-recovery-requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ resolution_note: resolutionNote }),
    }),
  subscribers: (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== "")
    );
    return request(`/admin/newsletter/subscribers${query.toString() ? `?${query}` : ""}`);
  },
};

export function clearAdminSessionCache() {
  sessionCheckPromise = null;
  cachedSession = null;
}
