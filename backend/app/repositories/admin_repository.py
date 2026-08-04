from __future__ import annotations

import asyncio
from typing import Any


class AdminRepository:
    def __init__(self, pool: Any) -> None:
        self.pool = pool

    async def dashboard(self) -> dict[str, Any]:
        """Return operational KPIs and time-series data for the staff dashboard.

        The database queries intentionally return only dates that contain activity.
        Missing days and months are filled in Python so the frontend always receives
        a stable chart shape, including when the database is new or quiet.
        """
        (
            lead_counts,
            enquiry_counts,
            sources,
            recent,
            daily_leads,
            daily_enquiries,
            monthly_leads,
            monthly_enquiries,
            status_breakdown,
            enquiry_breakdown,
            upcoming_appointments,
        ) = await asyncio.gather(
            self.pool.fetchrow(
                """
                SELECT
                    COUNT(*) AS total_leads,
                    COALESCE(SUM(COALESCE(lead_status, follow_up_status) IN ('New', 'new')), 0) AS new_leads,
                    COALESCE(SUM(lead_status = 'Contacted'), 0) AS contacted_leads,
                    COALESCE(SUM(lead_status = 'Qualified'), 0) AS qualified_leads,
                    COALESCE(SUM(COALESCE(lead_score, score, 0) >= 70 OR follow_up_status = 'priority_follow_up'), 0) AS priority_leads,
                    COALESCE(SUM(assigned_salesperson_id IS NULL), 0) AS unassigned_leads,
                    COALESCE(SUM(DATE(next_follow_up_at) = CURRENT_DATE), 0) AS follow_ups_due_today,
                    COALESCE(SUM(created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')), 0) AS leads_this_month,
                    COALESCE(SUM(
                        created_at >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01')
                        AND created_at < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
                    ), 0) AS leads_last_month
                FROM leads
                """
            ),
            self.pool.fetchrow(
                """
                SELECT
                    COUNT(*) AS total_enquiries,
                    COALESCE(SUM(enquiry_type = 'brochure'), 0) AS brochure_requests,
                    COALESCE(SUM(enquiry_type = 'consultation'), 0) AS consultation_requests,
                    COALESCE(SUM(enquiry_type = 'site_visit'), 0) AS site_visit_requests,
                    COALESCE(SUM(created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')), 0) AS enquiries_this_month,
                    COALESCE(SUM(
                        created_at >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01')
                        AND created_at < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')
                    ), 0) AS enquiries_last_month
                FROM enquiries
                """
            ),
            self.pool.fetch(
                """
                SELECT COALESCE(NULLIF(utm_source, ''), NULLIF(source_platform, ''), 'Direct') AS source,
                       COUNT(*) AS count
                FROM leads
                GROUP BY source
                ORDER BY count DESC
                LIMIT 8
                """
            ),
            self.pool.fetch("SELECT * FROM admin_lead_summary ORDER BY created_date DESC LIMIT 8"),
            self.pool.fetch(
                """
                SELECT DATE(created_at) AS activity_date, COUNT(*) AS count
                FROM leads
                WHERE created_at >= CURRENT_DATE - INTERVAL 29 DAY
                GROUP BY DATE(created_at)
                ORDER BY activity_date
                """
            ),
            self.pool.fetch(
                """
                SELECT DATE(created_at) AS activity_date, COUNT(*) AS count
                FROM enquiries
                WHERE created_at >= CURRENT_DATE - INTERVAL 29 DAY
                GROUP BY DATE(created_at)
                ORDER BY activity_date
                """
            ),
            self.pool.fetch(
                """
                SELECT DATE_FORMAT(created_at, '%Y-%m') AS activity_month, COUNT(*) AS count
                FROM leads
                WHERE created_at >= DATE_FORMAT(CURRENT_DATE - INTERVAL 11 MONTH, '%Y-%m-01')
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY activity_month
                """
            ),
            self.pool.fetch(
                """
                SELECT DATE_FORMAT(created_at, '%Y-%m') AS activity_month, COUNT(*) AS count
                FROM enquiries
                WHERE created_at >= DATE_FORMAT(CURRENT_DATE - INTERVAL 11 MONTH, '%Y-%m-01')
                GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                ORDER BY activity_month
                """
            ),
            self.pool.fetch(
                """
                SELECT COALESCE(NULLIF(lead_status, ''), NULLIF(follow_up_status, ''), 'Unknown') AS status,
                       COUNT(*) AS count
                FROM leads
                GROUP BY status
                ORDER BY count DESC
                """
            ),
            self.pool.fetch(
                """
                SELECT COALESCE(NULLIF(enquiry_type, ''), 'general') AS enquiry_type,
                       COUNT(*) AS count
                FROM enquiries
                GROUP BY enquiry_type
                ORDER BY count DESC
                """
            ),
            self.pool.fetch(
                """
                SELECT appointment_type, customer, preferred_date, status, reference
                FROM (
                    SELECT 'Consultation' AS appointment_type,
                           COALESCE(c.full_name, l.name, 'Prospective client') AS customer,
                           co.preferred_date,
                           co.status,
                           COALESCE(l.reference_number, e.reference_number) AS reference,
                           co.created_at
                    FROM consultations co
                    JOIN leads l ON l.id = co.lead_id
                    LEFT JOIN customers c ON c.id = l.customer_id
                    LEFT JOIN enquiries e ON e.id = co.enquiry_id
                    WHERE co.status NOT IN ('completed', 'cancelled')
                    UNION ALL
                    SELECT 'Site visit' AS appointment_type,
                           COALESCE(c.full_name, l.name, 'Prospective client') AS customer,
                           sv.preferred_date,
                           sv.status,
                           COALESCE(l.reference_number, e.reference_number) AS reference,
                           sv.created_at
                    FROM site_visits sv
                    JOIN leads l ON l.id = sv.lead_id
                    LEFT JOIN customers c ON c.id = l.customer_id
                    LEFT JOIN enquiries e ON e.id = sv.enquiry_id
                    WHERE sv.status NOT IN ('completed', 'cancelled')
                ) appointments
                ORDER BY created_at DESC
                LIMIT 6
                """
            ),
        )

        from datetime import date, timedelta

        lead_counts = lead_counts or {}
        enquiry_counts = enquiry_counts or {}

        def percent_change(current: int, previous: int) -> float | None:
            if previous == 0:
                return None if current == 0 else 100.0
            return round(((current - previous) / previous) * 100, 1)

        daily_lead_map = {str(row["activity_date"]): int(row["count"] or 0) for row in daily_leads}
        daily_enquiry_map = {str(row["activity_date"]): int(row["count"] or 0) for row in daily_enquiries}
        daily_activity = []
        for offset in range(29, -1, -1):
            day = date.today() - timedelta(days=offset)
            key = day.isoformat()
            daily_activity.append({
                "date": key,
                "leads": daily_lead_map.get(key, 0),
                "enquiries": daily_enquiry_map.get(key, 0),
            })

        monthly_lead_map = {str(row["activity_month"]): int(row["count"] or 0) for row in monthly_leads}
        monthly_enquiry_map = {str(row["activity_month"]): int(row["count"] or 0) for row in monthly_enquiries}
        monthly_activity = []
        year = date.today().year
        month = date.today().month
        for offset in range(11, -1, -1):
            absolute_month = year * 12 + month - 1 - offset
            item_year, zero_based_month = divmod(absolute_month, 12)
            item_month = zero_based_month + 1
            key = f"{item_year:04d}-{item_month:02d}"
            monthly_activity.append({
                "month": key,
                "leads": monthly_lead_map.get(key, 0),
                "enquiries": monthly_enquiry_map.get(key, 0),
            })

        total_leads = int(lead_counts.get("total_leads") or 0)
        qualified_leads = int(lead_counts.get("qualified_leads") or 0)
        leads_this_month = int(lead_counts.get("leads_this_month") or 0)
        leads_last_month = int(lead_counts.get("leads_last_month") or 0)
        enquiries_this_month = int(enquiry_counts.get("enquiries_this_month") or 0)
        enquiries_last_month = int(enquiry_counts.get("enquiries_last_month") or 0)

        return {
            "total_leads": total_leads,
            "new_leads": int(lead_counts.get("new_leads") or 0),
            "contacted_leads": int(lead_counts.get("contacted_leads") or 0),
            "qualified_leads": qualified_leads,
            "priority_leads": int(lead_counts.get("priority_leads") or 0),
            "total_enquiries": int(enquiry_counts.get("total_enquiries") or 0),
            "brochure_requests": int(enquiry_counts.get("brochure_requests") or 0),
            "consultation_requests": int(enquiry_counts.get("consultation_requests") or 0),
            "site_visit_requests": int(enquiry_counts.get("site_visit_requests") or 0),
            "follow_ups_due_today": int(lead_counts.get("follow_ups_due_today") or 0),
            "unassigned_leads": int(lead_counts.get("unassigned_leads") or 0),
            "conversion_rate": round((qualified_leads / total_leads) * 100, 1) if total_leads else 0.0,
            "leads_this_month": leads_this_month,
            "enquiries_this_month": enquiries_this_month,
            "lead_month_change": percent_change(leads_this_month, leads_last_month),
            "enquiry_month_change": percent_change(enquiries_this_month, enquiries_last_month),
            "leads_by_source": sources,
            "lead_status_breakdown": status_breakdown,
            "enquiry_type_breakdown": enquiry_breakdown,
            "daily_activity": daily_activity,
            "monthly_activity": monthly_activity,
            "upcoming_appointments": upcoming_appointments,
            "recent_enquiries": recent,
        }

    async def list_leads(self, filters: dict[str, Any]) -> dict[str, Any]:
        where = []
        params: list[Any] = []
        if filters.get("q"):
            where.append("(customer LIKE %s OR email LIKE %s OR phone LIKE %s OR reference LIKE %s)")
            q = f"%{filters['q']}%"
            params.extend([q, q, q, q])
        for key, column in (("status", "status"), ("source", "source"), ("assigned", "assigned_staff")):
            if filters.get(key):
                where.append(f"{column} = %s")
                params.append(filters[key])
        where_sql = f"WHERE {' AND '.join(where)}" if where else ""
        sort = "lead_score DESC" if filters.get("sort") == "score" else "created_date DESC"
        page = max(int(filters.get("page") or 1), 1)
        page_size = min(max(int(filters.get("page_size") or 20), 1), 100)
        offset = (page - 1) * page_size
        rows = await self.pool.fetch(
            f"SELECT * FROM admin_lead_summary {where_sql} ORDER BY {sort} LIMIT %s OFFSET %s",
            *params,
            page_size,
            offset,
        )
        total = int(await self.pool.fetchval(f"SELECT COUNT(*) FROM admin_lead_summary {where_sql}", *params) or 0)
        return {"items": rows, "page": page, "page_size": page_size, "total": total}

    async def get_lead(self, lead_id: int) -> dict[str, Any] | None:
        lead = await self.pool.fetchrow("SELECT * FROM admin_lead_summary WHERE lead_id = %s", lead_id)
        if not lead:
            return None
        detail = await self.pool.fetchrow("SELECT * FROM leads WHERE id = %s", lead_id)
        customer = None
        if detail and detail.get("customer_id"):
            customer = await self.pool.fetchrow("SELECT * FROM customers WHERE id = %s", detail["customer_id"])
        activities = await self.pool.fetch("SELECT * FROM lead_activities WHERE lead_id = %s ORDER BY created_at DESC", lead_id)
        notes = await self.pool.fetch(
            """
            SELECT ln.*, su.full_name AS created_by
            FROM lead_notes ln
            JOIN staff_users su ON su.id = ln.created_by_staff_id
            WHERE ln.lead_id = %s
            ORDER BY ln.created_at DESC
            """,
            lead_id,
        )
        follow_ups = await self.pool.fetch("SELECT * FROM lead_follow_ups WHERE lead_id = %s ORDER BY due_at DESC", lead_id)
        enquiries = await self.pool.fetch("SELECT * FROM enquiries WHERE lead_id = %s ORDER BY created_at DESC", lead_id)
        return {
            "summary": lead,
            "lead": detail,
            "customer": customer,
            "activities": activities,
            "notes": notes,
            "follow_ups": follow_ups,
            "enquiries": enquiries,
        }

    async def update_lead(self, lead_id: int, values: dict[str, Any], actor_staff_id: int) -> dict[str, Any] | None:
        before = await self.pool.fetchrow("SELECT * FROM leads WHERE id = %s", lead_id)
        if not before:
            return None
        if values.get("lead_status"):
            await self.pool.execute("UPDATE leads SET lead_status = %s, follow_up_status = %s WHERE id = %s", values["lead_status"], values["lead_status"], lead_id)
        if values.get("next_follow_up_at"):
            await self.pool.execute("UPDATE leads SET next_follow_up_at = %s WHERE id = %s", values["next_follow_up_at"].replace(tzinfo=None), lead_id)
        if values.get("last_contacted_at"):
            await self.pool.execute("UPDATE leads SET last_contacted_at = %s WHERE id = %s", values["last_contacted_at"].replace(tzinfo=None), lead_id)
        await self.add_activity(lead_id, "LEAD_UPDATED", "Lead details updated", actor_staff_id)
        await self.audit(actor_staff_id, "lead.update", "lead", lead_id, before, await self.pool.fetchrow("SELECT * FROM leads WHERE id = %s", lead_id))
        return await self.get_lead(lead_id)

    async def assign(self, lead_id: int, staff_id: int, actor_staff_id: int) -> None:
        before = await self.pool.fetchrow("SELECT assigned_salesperson_id FROM leads WHERE id = %s", lead_id)
        await self.pool.execute("UPDATE leads SET assigned_salesperson_id = %s, lead_status = IF(lead_status = 'New', 'Contacted', lead_status) WHERE id = %s", staff_id, lead_id)
        await self.pool.execute("INSERT INTO lead_assignments (lead_id, assigned_to_staff_id, assigned_by_staff_id) VALUES (%s, %s, %s)", lead_id, staff_id, actor_staff_id)
        await self.add_activity(lead_id, "LEAD_ASSIGNED", f"Lead assigned to staff #{staff_id}", actor_staff_id)
        await self.audit(actor_staff_id, "lead.assign", "lead", lead_id, before, {"assigned_salesperson_id": staff_id})

    async def add_note(self, lead_id: int, note: str, actor_staff_id: int) -> None:
        await self.pool.execute("INSERT INTO lead_notes (lead_id, note, created_by_staff_id) VALUES (%s, %s, %s)", lead_id, note, actor_staff_id)
        await self.add_activity(lead_id, "NOTE_ADDED", "Internal note added", actor_staff_id)
        await self.audit(actor_staff_id, "lead.note", "lead", lead_id, None, {"note": note[:200]})

    async def add_follow_up(self, lead_id: int, due_at, assigned_to_staff_id: int | None, outcome: str | None, actor_staff_id: int) -> None:
        assigned_to = assigned_to_staff_id or actor_staff_id
        await self.pool.execute(
            "INSERT INTO lead_follow_ups (lead_id, assigned_to_staff_id, due_at, outcome) VALUES (%s, %s, %s, %s)",
            lead_id,
            assigned_to,
            due_at.replace(tzinfo=None),
            outcome,
        )
        await self.pool.execute("UPDATE leads SET next_follow_up_at = %s WHERE id = %s", due_at.replace(tzinfo=None), lead_id)
        await self.add_activity(lead_id, "FOLLOW_UP_SET", "Follow-up date set", actor_staff_id)

    async def add_activity(self, lead_id: int, activity_type: str, summary: str, actor_staff_id: int | None = None) -> None:
        await self.pool.execute(
            "INSERT INTO lead_activities (lead_id, activity_type, summary, created_by_staff_id, campaign) VALUES (%s, %s, %s, %s, JSON_OBJECT())",
            lead_id,
            activity_type,
            summary,
            actor_staff_id,
        )

    async def audit(self, actor_staff_id: int, action: str, entity_type: str, entity_id: int, before: Any, after: Any) -> None:
        await self.pool.execute(
            "INSERT INTO audit_logs (actor_staff_id, action, entity_type, entity_id, before_json, after_json) VALUES (%s, %s, %s, %s, %s, %s)",
            actor_staff_id,
            action,
            entity_type,
            str(entity_id),
            None if before is None else __import__("json").dumps(before, default=str),
            None if after is None else __import__("json").dumps(after, default=str),
        )

    async def list_by_enquiry_type(self, enquiry_type: str | None = None) -> list[dict[str, Any]]:
        if enquiry_type:
            return await self.pool.fetch("SELECT * FROM enquiries WHERE enquiry_type = %s ORDER BY created_at DESC", enquiry_type)
        return await self.pool.fetch("SELECT * FROM enquiries ORDER BY created_at DESC")

    async def export_customer_data(self) -> dict[str, list[dict[str, Any]]]:
        """Return customer-facing operational data for authorised staff exports.

        Authentication secrets, password hashes, session tokens and audit records
        are intentionally excluded. This method is read-only.
        """
        leads, enquiries, customers = await asyncio.gather(
            self.pool.fetch(
                """
                SELECT
                    l.reference_number,
                    COALESCE(c.full_name, l.name) AS customer_name,
                    COALESCE(c.email, l.email) AS email,
                    COALESCE(c.phone, l.phone) AS phone,
                    l.property_interest,
                    l.bedroom_preference,
                    l.budget_range,
                    l.buying_purpose,
                    l.purchase_timeframe,
                    l.lead_status,
                    l.follow_up_status,
                    COALESCE(l.lead_score, l.score, 0) AS lead_score,
                    COALESCE(NULLIF(l.utm_source, ''), NULLIF(l.source_platform, ''), 'Direct') AS source,
                    l.utm_campaign,
                    su.full_name AS assigned_staff,
                    l.next_follow_up_at,
                    l.last_contacted_at,
                    l.created_at,
                    l.updated_at
                FROM leads l
                LEFT JOIN customers c ON c.id = l.customer_id
                LEFT JOIN staff_users su ON su.id = l.assigned_salesperson_id
                ORDER BY l.created_at DESC
                """
            ),
            self.pool.fetch(
                """
                SELECT
                    e.reference_number,
                    e.enquiry_type,
                    COALESCE(c.full_name, l.name) AS customer_name,
                    COALESCE(c.email, l.email) AS email,
                    COALESCE(c.phone, l.phone) AS phone,
                    l.property_interest,
                    e.message,
                    e.preferred_contact_time,
                    e.status,
                    e.follow_up_status,
                    e.notification_status,
                    e.created_at,
                    e.updated_at
                FROM enquiries e
                JOIN leads l ON l.id = e.lead_id
                LEFT JOIN customers c ON c.id = l.customer_id
                ORDER BY e.created_at DESC
                """
            ),
            self.pool.fetch(
                """
                SELECT
                    c.id AS customer_id,
                    c.full_name,
                    c.email,
                    c.phone,
                    c.country,
                    c.preferred_language,
                    c.preferred_contact_method,
                    c.marketing_consent,
                    c.privacy_consent,
                    c.created_at,
                    c.updated_at,
                    COUNT(DISTINCT l.id) AS lead_count,
                    COUNT(DISTINCT e.id) AS enquiry_count
                FROM customers c
                LEFT JOIN leads l ON l.customer_id = c.id
                LEFT JOIN enquiries e ON e.lead_id = l.id
                GROUP BY
                    c.id, c.full_name, c.email, c.phone, c.country,
                    c.preferred_language, c.preferred_contact_method,
                    c.marketing_consent, c.privacy_consent, c.created_at, c.updated_at
                ORDER BY c.created_at DESC
                """
            ),
        )
        return {"leads": leads, "enquiries": enquiries, "customers": customers}
