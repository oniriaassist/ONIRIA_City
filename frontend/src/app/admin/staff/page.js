"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { AdminPageHeader, EmptyState, ErrorState, LoadingSkeleton, StatusBadge } from "../../components/admin/AdminUI";
import { adminApi } from "../../services/adminApi";

const ROLE_OPTIONS = [
  ["administrator", "Administrator"],
  ["sales_manager", "Sales Manager"],
  ["sales_agent", "Sales Agent"],
  ["marketing_staff", "Marketing Staff"],
  ["knowledge_editor", "Knowledge Editor"],
];

const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS);

function formatRole(role) {
  return ROLE_LABELS[role] || role?.replace(/_/g, " ") || "-";
}

export default function AdminStaffPage() {
  return (
    <AdminLayout title="Staff">
      <AdminStaffContent />
    </AdminLayout>
  );
}

function AdminStaffContent() {
  const [staff, setStaff] = useState(null);
  const [currentStaffId, setCurrentStaffId] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", roles: "sales_agent" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState(null);

  async function load({ clearMessages = false } = {}) {
    if (clearMessages) {
      setError("");
      setNotice("");
    }

    try {
      const [staffRows, session] = await Promise.all([adminApi.staff(), adminApi.cachedSession()]);
      setStaff(staffRows);
      setCurrentStaffId(session?.staff?.id ?? null);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    let active = true;

    Promise.all([adminApi.staff(), adminApi.cachedSession()])
      .then(([staffRows, session]) => {
        if (!active) return;
        setStaff(staffRows);
        setCurrentStaffId(session?.staff?.id ?? null);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, []);

  async function create(event) {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");
    setNotice("");

    try {
      await adminApi.createStaff({ ...form, roles: [form.roles] });
      setForm({ full_name: "", email: "", password: "", roles: "sales_agent" });
      setNotice("Staff account created successfully.");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStaff(member) {
    if (actionId || member.id === currentStaffId) return;

    setActionId(member.id);
    setError("");
    setNotice("");

    try {
      if (member.is_active) {
        await adminApi.disableStaff(member.id);
        setNotice(`${member.full_name} has been disabled.`);
      } else {
        await adminApi.updateStaff(member.id, { is_active: true });
        setNotice(`${member.full_name} has been enabled.`);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Administration"
        title="Staff Management"
        description="Create staff accounts, review assigned roles and control account access from one place."
      />

      {error && <ErrorState message={error} onRetry={() => load({ clearMessages: true })} />}
      {notice && <div className="adminSuccess" role="status">{notice}</div>}

      <form className="adminFilters adminStaffCreateForm" onSubmit={create}>
        <label>
          Full name
          <input
            placeholder="Staff full name"
            autoComplete="name"
            value={form.full_name}
            onChange={(event) => setForm({ ...form, full_name: event.target.value })}
            required
          />
        </label>
        <label>
          Email
          <input
            placeholder="name@example.com"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>
          Temporary password
          <input
            placeholder="Minimum 12 characters"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={200}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <label>
          Role
          <select value={form.roles} onChange={(event) => setForm({ ...form, roles: event.target.value })}>
            {ROLE_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create Staff"}
        </button>
      </form>

      {staff === null && !error ? <LoadingSkeleton rows={4} /> : staff && (
        <div className="adminTableWrap">
          <table className="adminTable">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => {
                const isCurrentAccount = member.id === currentStaffId;
                const busy = actionId === member.id;

                return (
                  <tr key={member.id}>
                    <td>
                      <strong>{member.full_name}</strong>
                      {isCurrentAccount && <span>Current account</span>}
                    </td>
                    <td>{member.email}</td>
                    <td>{member.roles?.map(formatRole).join(", ") || "-"}</td>
                    <td><StatusBadge value={member.is_active ? "Active" : "Disabled"} /></td>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleStaff(member)}
                        disabled={busy || isCurrentAccount}
                        title={isCurrentAccount ? "You cannot disable your current signed-in account here." : undefined}
                      >
                        {isCurrentAccount ? "Current Account" : busy ? "Updating…" : member.is_active ? "Disable" : "Enable"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!staff.length && (
            <EmptyState
              title="No staff accounts yet"
              description="Create the first staff account using the form above."
            />
          )}
        </div>
      )}
    </>
  );
}
