-- 013_views.sql
USE oniria_city;

CREATE OR REPLACE VIEW admin_lead_summary AS
SELECT
  l.id AS lead_id,
  COALESCE(l.reference_number, e.reference_number) AS reference,
  COALESCE(c.full_name, l.name) AS customer,
  COALESCE(c.email, l.email) AS email,
  COALESCE(c.phone, l.phone) AS phone,
  COALESCE(l.property_interest, JSON_UNQUOTE(JSON_EXTRACT(l.property_interests, '$[0]')), 'General Roho') AS interest,
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
LEFT JOIN enquiries e ON e.lead_id = l.id;

CREATE OR REPLACE VIEW sales_follow_up_queue AS
SELECT
  l.id AS lead_id,
  COALESCE(l.reference_number, e.reference_number) AS reference,
  COALESCE(c.full_name, l.name) AS customer,
  su.full_name AS assigned_salesperson,
  l.next_follow_up_at AS follow_up_due_at,
  COALESCE(l.lead_status, l.follow_up_status) AS current_status,
  MAX(la.created_at) AS last_activity_at,
  CASE WHEN l.next_follow_up_at IS NOT NULL AND l.next_follow_up_at < CURRENT_TIMESTAMP THEN 1 ELSE 0 END AS is_overdue
FROM leads l
LEFT JOIN customers c ON c.id = l.customer_id
LEFT JOIN staff_users su ON su.id = l.assigned_salesperson_id
LEFT JOIN lead_activities la ON la.lead_id = l.id
LEFT JOIN enquiries e ON e.lead_id = l.id
GROUP BY l.id, reference, customer, assigned_salesperson, follow_up_due_at, current_status;

CREATE OR REPLACE VIEW campaign_performance AS
SELECT
  COALESCE(l.utm_source, l.source_platform, 'direct') AS source,
  COALESCE(l.utm_campaign, l.campaign_name, 'none') AS campaign,
  COUNT(DISTINCT l.id) AS leads,
  COUNT(DISTINCT e.id) AS enquiries,
  AVG(GREATEST(COALESCE(l.lead_score, 0), COALESCE(l.score, 0))) AS average_score
FROM leads l
LEFT JOIN enquiries e ON e.lead_id = l.id
GROUP BY source, campaign;
