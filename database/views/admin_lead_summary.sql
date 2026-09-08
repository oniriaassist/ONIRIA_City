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
