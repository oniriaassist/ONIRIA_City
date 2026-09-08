"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import LeadFilters from "../../components/admin/LeadFilters";
import LeadTable from "../../components/admin/LeadTable";
import { AdminPageHeader, ErrorState, LoadingSkeleton } from "../../components/admin/AdminUI";
import { adminApi } from "../../services/adminApi";

export default function AdminLeadsPage() {
  return (
    <AdminLayout title="Leads">
      <AdminLeadsContent />
    </AdminLayout>
  );
}

function AdminLeadsContent() {
  const [filters, setFilters] = useState({ sort: "newest" });
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load(params = filters) {
    setError("");
    try {
      setData(await adminApi.leads(params));
    } catch (err) {
      setError(err.message);
    }
  }

  function clearFilters() {
    const nextFilters = { sort: "newest" };
    setFilters(nextFilters);
    load(nextFilters);
  }

  useEffect(() => {
    let active = true;
    adminApi
      .leads({ sort: "newest" })
      .then((result) => {
        if (active) {
          setData(result);
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
        eyebrow="Core"
        title="Leads"
        description="Track and manage potential Roho clients."
      />
      <LeadFilters filters={filters} onChange={setFilters} onClear={clearFilters} onSubmit={(event) => { event.preventDefault(); load(filters); }} />
      {error && <ErrorState message={error} onRetry={() => load(filters)} />}
      {!data && !error ? <LoadingSkeleton /> : data && (
        <LeadTable
          leads={data.items}
          filtersActive={Boolean(filters.q || filters.status || filters.sort !== "newest")}
          onClearFilters={clearFilters}
        />
      )}
    </>
  );
}
