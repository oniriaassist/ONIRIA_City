"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { adminApi } from "../../services/adminApi";
import styles from "./DashboardAnalytics.module.css";

const numberFormatter = new Intl.NumberFormat("en-US");
const dayFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("en", { month: "short" });

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatPeriodLabel(value, monthly) {
  if (!value) return "";
  return monthly
    ? monthFormatter.format(new Date(`${value}-01T00:00:00`))
    : dayFormatter.format(new Date(`${value}T00:00:00`));
}

function createTicks(maxValue, count = 4) {
  const rawStep = Math.max(1, Math.ceil(maxValue / count));
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const normalized = rawStep / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  const step = nice * magnitude;
  const ceiling = Math.max(step, Math.ceil(maxValue / step) * step);
  return Array.from({ length: count + 1 }, (_, index) => (ceiling / count) * index);
}

export function ActivityChart({ daily = [], monthly = [] }) {
  const [range, setRange] = useState("30d");
  const monthlyMode = range === "12m";
  const dataset = useMemo(() => {
    if (monthlyMode) return monthly;
    return range === "7d" ? daily.slice(-7) : daily.slice(-30);
  }, [daily, monthly, monthlyMode, range]);

  const width = 960;
  const height = 350;
  const margin = { top: 22, right: 18, bottom: 58, left: 54 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const largest = Math.max(0, ...dataset.flatMap((item) => [safeNumber(item.leads), safeNumber(item.enquiries)]));
  const ticks = createTicks(largest || 4);
  const yMax = ticks[ticks.length - 1] || 1;
  const groupWidth = dataset.length ? plotWidth / dataset.length : plotWidth;
  const barWidth = Math.max(3, Math.min(monthlyMode ? 24 : 13, groupWidth * 0.28));
  const hasActivity = largest > 0;

  const labelEvery = monthlyMode ? 1 : range === "7d" ? 1 : Math.max(1, Math.ceil(dataset.length / 7));

  return (
    <section className={`${styles.panel} ${styles.activityPanel}`}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Performance</p>
          <h3>Lead and enquiry activity</h3>
          <span>Daily and monthly customer demand recorded in the CRM.</span>
        </div>
        <div className={styles.segmentedControl} aria-label="Chart period">
          {[
            ["7d", "7 days"],
            ["30d", "30 days"],
            ["12m", "12 months"],
          ].map(([value, label]) => (
            <button key={value} className={range === value ? styles.activeSegment : ""} type="button" onClick={() => setRange(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartMeta}>
        <div className={styles.legend}>
          <span><i className={styles.leadsDot} /> Leads</span>
          <span><i className={styles.enquiriesDot} /> Enquiries</span>
        </div>
        <span className={styles.chartSummary}>{numberFormatter.format(dataset.reduce((sum, row) => sum + safeNumber(row.leads) + safeNumber(row.enquiries), 0))} total activities</span>
      </div>

      <div className={styles.chartWrap}>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Bar chart showing lead and enquiry frequency by date">
          <text x="14" y="18" className={styles.axisTitle}>Frequency</text>
          {ticks.map((tick) => {
            const y = margin.top + plotHeight - (tick / yMax) * plotHeight;
            return (
              <g key={tick}>
                <line x1={margin.left} y1={y} x2={width - margin.right} y2={y} className={styles.gridLine} />
                <text x={margin.left - 12} y={y + 4} textAnchor="end" className={styles.axisText}>{Math.round(tick)}</text>
              </g>
            );
          })}

          {dataset.map((item, index) => {
            const centre = margin.left + index * groupWidth + groupWidth / 2;
            const leadValue = safeNumber(item.leads);
            const enquiryValue = safeNumber(item.enquiries);
            const leadHeight = (leadValue / yMax) * plotHeight;
            const enquiryHeight = (enquiryValue / yMax) * plotHeight;
            const labelValue = monthlyMode ? item.month : item.date;
            const showLabel = index % labelEvery === 0 || index === dataset.length - 1;
            return (
              <g key={`${labelValue}-${index}`}>
                <rect x={centre - barWidth - 2} y={margin.top + plotHeight - leadHeight} width={barWidth} height={Math.max(leadHeight, leadValue ? 2 : 0)} rx="3" className={styles.leadBar}>
                  <title>{`${formatPeriodLabel(labelValue, monthlyMode)}: ${leadValue} leads`}</title>
                </rect>
                <rect x={centre + 2} y={margin.top + plotHeight - enquiryHeight} width={barWidth} height={Math.max(enquiryHeight, enquiryValue ? 2 : 0)} rx="3" className={styles.enquiryBar}>
                  <title>{`${formatPeriodLabel(labelValue, monthlyMode)}: ${enquiryValue} enquiries`}</title>
                </rect>
                {showLabel ? (
                  <text x={centre} y={height - 24} textAnchor="middle" className={styles.axisText}>
                    {formatPeriodLabel(labelValue, monthlyMode)}
                  </text>
                ) : null}
              </g>
            );
          })}

          {!hasActivity ? (
            <g>
              <rect x={margin.left + 120} y={margin.top + 72} width={plotWidth - 240} height="92" rx="18" className={styles.emptyChartBox} />
              <text x={width / 2} y={margin.top + 108} textAnchor="middle" className={styles.emptyChartTitle}>No activity in this period</text>
              <text x={width / 2} y={margin.top + 136} textAnchor="middle" className={styles.emptyChartText}>New leads and enquiries will appear here automatically.</text>
            </g>
          ) : null}
          <text x={width / 2} y={height - 2} textAnchor="middle" className={styles.axisTitle}>{monthlyMode ? "Month" : "Date"}</text>
        </svg>
      </div>
    </section>
  );
}

function BarList({ rows = [], labelKey, emptyText }) {
  const total = rows.reduce((sum, row) => sum + safeNumber(row.count), 0);
  const max = Math.max(1, ...rows.map((row) => safeNumber(row.count)));
  if (!rows.length) return <p className={styles.emptyText}>{emptyText}</p>;

  return (
    <div className={styles.barList}>
      {rows.slice(0, 6).map((row) => {
        const value = safeNumber(row.count);
        const label = String(row[labelKey] || "Unknown").replace(/_/g, " ");
        return (
          <div className={styles.barItem} key={`${label}-${value}`}>
            <div className={styles.barLabel}>
              <span>{label}</span>
              <strong>{numberFormatter.format(value)} <small>{total ? Math.round((value / total) * 100) : 0}%</small></strong>
            </div>
            <div className={styles.barTrack}><span style={{ width: `${Math.max(4, (value / max) * 100)}%` }} /></div>
          </div>
        );
      })}
    </div>
  );
}

export function BreakdownPanels({ sources = [], statuses = [], enquiryTypes = [] }) {
  const panels = [
    { eyebrow: "Acquisition", title: "Lead sources", href: "/admin/campaigns", link: "Campaigns", rows: sources, key: "source", empty: "Source activity will appear after leads arrive." },
    { eyebrow: "Pipeline", title: "Lead status", href: "/admin/leads", link: "Pipeline", rows: statuses, key: "status", empty: "Lead status data will appear here." },
    { eyebrow: "Demand", title: "Enquiry mix", href: "/admin/enquiries", link: "Enquiries", rows: enquiryTypes, key: "enquiry_type", empty: "Enquiry categories will appear here." },
  ];
  return (
    <div className={styles.breakdownGrid}>
      {panels.map((panel) => (
        <section className={styles.panel} key={panel.title}>
          <div className={styles.panelHeaderCompact}>
            <div><p className={styles.eyebrow}>{panel.eyebrow}</p><h3>{panel.title}</h3></div>
            <Link href={panel.href}>{panel.link} →</Link>
          </div>
          <BarList rows={panel.rows} labelKey={panel.key} emptyText={panel.empty} />
        </section>
      ))}
    </div>
  );
}

export function AppointmentList({ appointments = [] }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeaderCompact}>
        <div><p className={styles.eyebrow}>Next actions</p><h3>Upcoming appointments</h3></div>
        <Link href="/admin/site-visits">Schedule →</Link>
      </div>
      {appointments.length ? (
        <div className={styles.appointmentList}>
          {appointments.map((item, index) => (
            <article key={`${item.reference || item.customer}-${index}`}>
              <span className={styles.appointmentType}>{item.appointment_type}</span>
              <div><strong>{item.customer || "Prospective client"}</strong><small>{item.preferred_date || "Date to be confirmed"}</small></div>
              <span className={styles.appointmentStatus}>{item.status || "new"}</span>
            </article>
          ))}
        </div>
      ) : <p className={styles.emptyText}>No open consultations or site visits.</p>}
    </section>
  );
}

export function AttentionPanel({ followUps = 0, unassigned = 0, priority = 0 }) {
  const items = [
    { label: "Follow-ups due", value: followUps, href: "/admin/follow-ups" },
    { label: "Unassigned leads", value: unassigned, href: "/admin/leads?assigned=unassigned" },
    { label: "Priority leads", value: priority, href: "/admin/leads?sort=score" },
  ];
  return (
    <section className={`${styles.panel} ${styles.attentionPanel}`}>
      <div className={styles.panelHeaderCompact}><div><p className={styles.eyebrow}>Action centre</p><h3>Needs attention</h3></div></div>
      <div className={styles.attentionList}>
        {items.map((item) => (
          <Link href={item.href} key={item.label}><span>{item.label}</span><strong>{numberFormatter.format(safeNumber(item.value))}</strong></Link>
        ))}
      </div>
    </section>
  );
}

export function ExportMenu() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function downloadWorkbook() {
    setBusy(true);
    setMessage("");
    try {
      await adminApi.exportData({ format: "xlsx", dataset: "all" });
      setMessage("Download complete");
    } catch (error) {
      setMessage(error.message || "Download failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.exportInline}>
      <button type="button" onClick={downloadWorkbook} disabled={busy}>{busy ? "Preparing…" : "Download data"}</button>
      {message ? <span className={message === "Download complete" ? styles.exportSuccess : styles.exportError} aria-live="polite">{message}</span> : null}
    </div>
  );
}
