"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { AdminPageHeader, EmptyState, ErrorState, LoadingSkeleton, StatusBadge } from "../../components/admin/AdminUI";
import { adminApi } from "../../services/adminApi";

const pageDescriptions = {
  "Enquiries": "Review all public enquiries captured across ONIRIA City forms.",
  "Brochure Requests": "Track buyers who requested project and property brochures.",
  "Consultations": "Manage consultation requests from prospective clients.",
  "Site Visits": "Review requested property tours and visit scheduling activity.",
  "AI Conversations": "Monitor ONIRIA assistant conversations and sales signals.",
  "WhatsApp Conversations": "View WhatsApp interactions connected to ONIRIA City.",
  "Campaign Sources": "Review marketing campaign performance and source quality.",
  "Follow-ups": "Stay on top of staff follow-up commitments.",
};

export default function AdminListPage({ title, endpoint }) {
  return (
    <AdminLayout title={title}>
      <AdminListContent title={title} endpoint={endpoint} />
    </AdminLayout>
  );
}

function AdminListContent({ title, endpoint }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");

  function load({ clearError = true } = {}) {
    if (clearError) {
      setError("");
    }
    adminApi.list(endpoint).then(setItems).catch((err) => setError(err.message));
  }

  useEffect(() => {
    adminApi.list(endpoint).then(setItems).catch((err) => setError(err.message));
  }, [endpoint]);

  return (
    <>
      <AdminPageHeader title={title} description={pageDescriptions[title] || "Review and manage ONIRIA City staff records."} />
      {error && <ErrorState message={error} onRetry={() => load()} />}
      {!items && !error ? <LoadingSkeleton /> : items && (
        <div className="adminTableWrap">
          {title === "Brochure Requests" ? (
            <table className="adminTable">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Delivery</th>
                  <th>Delivery status</th>
                  <th>Provider</th>
                  <th>Requested</th>
                  <th>Delivered</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id || item.reference_number}>
                    <td>{item.reference_number || "-"}</td>
                    <td>{item.delivery_method || "-"}</td>
                    <td><StatusBadge value={item.delivery_status || "pending"} /></td>
                    <td>{item.provider || "-"}</td>
                    <td>{item.created_at || "-"}</td>
                    <td>{item.delivered_at || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="adminTable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Summary</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id || item.lead_id || JSON.stringify(item)}>
                    <td>{item.id || item.lead_id || "-"}</td>
                    <td>{item.enquiry_type || item.channel || item.source || item.current_status || "-"}</td>
                    <td><StatusBadge value={item.status || item.current_status || "-"} /></td>
                    <td>{item.created_at || item.created_date || item.follow_up_due_at || "-"}</td>
                    <td>{item.reference_number || item.reference || item.customer || item.campaign || item.summary || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!items.length && <EmptyState title="No records yet" description="New matching activity will appear here automatically." />}
        </div>
      )}
    </>
  );
}
