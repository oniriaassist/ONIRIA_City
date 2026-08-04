import Link from "next/link";

function formatTrend(value) {
  if (value === null || value === undefined) return "No previous-month baseline";
  const number = Number(value);
  if (!Number.isFinite(number)) return "No previous-month baseline";
  if (number === 0) return "No change from last month";
  return `${number > 0 ? "+" : ""}${number}% from last month`;
}

export default function DashboardCards({ data }) {
  const cards = [
    {
      label: "Leads this month",
      value: data.leads_this_month,
      href: "/admin/leads",
      icon: "LE",
      note: formatTrend(data.lead_month_change),
      tone: Number(data.lead_month_change) >= 0 ? "positive" : "negative",
    },
    {
      label: "Enquiries this month",
      value: data.enquiries_this_month,
      href: "/admin/enquiries",
      icon: "EN",
      note: formatTrend(data.enquiry_month_change),
      tone: Number(data.enquiry_month_change) >= 0 ? "positive" : "negative",
    },
    {
      label: "Qualified leads",
      value: data.qualified_leads,
      href: "/admin/leads?status=Qualified",
      icon: "QL",
      note: `${data.conversion_rate ?? 0}% of the full lead pipeline`,
      tone: "neutral",
    },
    {
      label: "Site visit requests",
      value: data.site_visit_requests,
      href: "/admin/site-visits",
      icon: "SV",
      note: "Client visits requiring coordination",
      tone: "neutral",
    },
    {
      label: "Consultations",
      value: data.consultation_requests,
      href: "/admin/consultations",
      icon: "CO",
      note: "Private sales conversations requested",
      tone: "neutral",
    },
    {
      label: "Brochure requests",
      value: data.brochure_requests,
      href: "/admin/brochure-requests",
      icon: "BR",
      note: "Prospects requesting project information",
      tone: "neutral",
    },
  ];

  return (
    <div className="adminCards adminDashboardCards">
      {cards.map((card) => (
        <Link className="adminMetricCard adminDashboardMetric" href={card.href} key={card.label}>
          <span className="adminMetricIcon" aria-hidden="true">{card.icon}</span>
          <span>{card.label}</span>
          <strong>{card.value ?? 0}</strong>
          <small className={`adminMetricTrend is-${card.tone}`}>{card.note}</small>
        </Link>
      ))}
    </div>
  );
}
