"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import DashboardCards from "../components/admin/DashboardCards";
import LeadTable from "../components/admin/LeadTable";
import {
  ActivityChart,
  AppointmentList,
  AttentionPanel,
  BreakdownPanels,
  ExportMenu,
} from "../components/admin/DashboardAnalytics";
import { AdminPageHeader, ErrorState, LoadingSkeleton } from "../components/admin/AdminUI";
import { adminApi } from "../services/adminApi";

export default function AdminDashboardPage() {
  return <AdminLayout title="Dashboard"><DashboardContent /></AdminLayout>;
}

function DashboardContent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setError("");
    setRefreshing(true);
    try {
      setData(await adminApi.dashboard());
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    adminApi.dashboard()
      .then((dashboardData) => {
        if (active) {
          setData(dashboardData);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <AdminPageHeader
        eyebrow="Sales intelligence"
        title="Business overview"
        description="Monitor demand, customer activity, follow-ups and appointments from one workspace."
        actions={<button className="adminSecondaryButton" type="button" onClick={load} disabled={refreshing}>{refreshing ? "Refreshing…" : "Refresh"}</button>}
      />

      {error && <ErrorState message={error} onRetry={load} />}
      {!data && !error ? <LoadingSkeleton type="cards" /> : data ? (
        <div className="adminDashboardContent">
          <DashboardCards data={data} />

          <div className="adminDashboardAnalyticsGrid">
            <ActivityChart daily={data.daily_activity || []} monthly={data.monthly_activity || []} />
            <AttentionPanel followUps={data.follow_ups_due_today} unassigned={data.unassigned_leads} priority={data.priority_leads} />
          </div>

          <BreakdownPanels sources={data.leads_by_source || []} statuses={data.lead_status_breakdown || []} enquiryTypes={data.enquiry_type_breakdown || []} />

          <div className="adminDashboardOperationsGrid">
            <section className="adminPanel adminDashboardSection">
              <div className="adminPanelHeading adminPanelHeadingWithTools">
                <div>
                  <p>Latest activity</p>
                  <h2>Recent leads and enquiries</h2>
                </div>
                <div className="adminPanelTools">
                  <ExportMenu />
                  <Link href="/admin/leads">View all leads →</Link>
                </div>
              </div>
              <LeadTable leads={data.recent_enquiries || []} />
            </section>

            <AppointmentList appointments={data.upcoming_appointments || []} />
          </div>
        </div>
      ) : null}
    </>
  );
}
