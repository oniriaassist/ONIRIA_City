INSERT INTO staff_roles (role_key, role_name, description) VALUES
('administrator', 'Administrator', 'Full authorised administrative access.'),
('sales_manager', 'Sales Manager', 'View, assign and manage all sales leads.'),
('sales_agent', 'Sales Agent', 'Manage assigned leads and follow-ups.'),
('marketing_staff', 'Marketing Staff', 'View campaign and attribution reports.'),
('knowledge_editor', 'Knowledge Editor', 'Manage approved ONIRIA knowledge records.')
ON CONFLICT (role_key) DO UPDATE
SET role_name = EXCLUDED.role_name,
    description = EXCLUDED.description;
