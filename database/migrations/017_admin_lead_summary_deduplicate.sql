-- Prevent duplicate lead rows when one lead has several enquiries.
-- This changes only the reporting view; it does not delete or modify stored data.
USE oniria_city;

CREATE OR REPLACE VIEW admin_lead_summary AS
SELECT
  l.id AS lead_id,
  COALESCE(l.reference_number, latest_enquiry.reference_number) AS reference,
  COALESCE(c.full_name, l.name) AS customer,
  COALESCE(c.email, l.email) AS email,
  COALESCE(c.phone, l.phone) AS phone,
  COALESCE(
    l.property_interest,
    JSON_UNQUOTE(JSON_EXTRACT(l.property_interests, '$[0]')),
    'General ONIRIA City'
  ) AS interest,
  COALESCE(l.source_platform, l.utm_source, 'Direct') AS source,
  COALESCE(l.campaign_name, l.utm_campaign) AS campaign,
  COALESCE(l.lead_status, l.follow_up_status) AS status,
  su.full_name AS assigned_staff,
  GREATEST(COALESCE(l.lead_score, 0), COALESCE(l.score, 0)) AS lead_score,
  l.created_at AS created_date,
  l.next_follow_up_at AS next_follow_up
FROM leads l
LEFT JOIN customers c ON c.id = l.customer_id
LEFT JOIN staff_users su ON su.id = l.assigned_salesperson_id
LEFT JOIN (
  SELECT e1.lead_id, e1.reference_number
  FROM enquiries e1
  INNER JOIN (
    SELECT lead_id, MAX(id) AS latest_id
    FROM enquiries
    WHERE lead_id IS NOT NULL
    GROUP BY lead_id
  ) latest ON latest.latest_id = e1.id
) latest_enquiry ON latest_enquiry.lead_id = l.id;
