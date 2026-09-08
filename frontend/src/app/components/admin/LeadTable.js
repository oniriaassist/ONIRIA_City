import Link from "next/link";
import { EmptyState, StatusBadge } from "./AdminUI";

export default function LeadTable({ leads, onClearFilters, filtersActive = false }) {
  if (!leads?.length) {
    return (
      <EmptyState
        title={filtersActive ? "No leads match these filters" : "No leads yet"}
        description={filtersActive ? "Adjust the filters to broaden the lead list." : "New ROHO enquiries will appear here once they are captured."}
        actionLabel={filtersActive ? "Clear filters" : undefined}
        onAction={filtersActive ? onClearFilters : undefined}
      />
    );
  }

  return (
    <div className="adminTableWrap">
      <table className="adminTable">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Customer</th>
            <th>Interest</th>
            <th>Source</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Score</th>
            <th>Created</th>
            <th>Next Follow-Up</th>
            <th>Open</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.lead_id}>
              <td>{lead.reference || `Lead ${lead.lead_id}`}</td>
              <td>
                <strong>{lead.customer || "Unknown"}</strong>
                <span>{lead.email || lead.phone || "-"}</span>
              </td>
              <td>{lead.interest || "-"}</td>
              <td>{lead.source || "-"}</td>
              <td><StatusBadge value={lead.status} /></td>
              <td>{lead.assigned_staff || "Unassigned"}</td>
              <td>{lead.lead_score ?? 0}</td>
              <td>{lead.created_date ? new Date(lead.created_date).toLocaleDateString() : "-"}</td>
              <td>{lead.next_follow_up ? new Date(lead.next_follow_up).toLocaleString() : "-"}</td>
              <td>
                <Link href={`/admin/leads/${lead.lead_id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
