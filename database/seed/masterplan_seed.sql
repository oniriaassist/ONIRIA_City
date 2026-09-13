INSERT INTO masterplan_zones (slug, title, description, image_url, related_collections, status, sort_order) VALUES
('hillside-residences', 'Hillside Residences', 'Low-density residential living with privacy and greenery.', '/media/oniria/villa-gated-entry.png', '["Villa Collection"]'::jsonb, 'published', 1),
('central-living-district', 'Central Living District', 'Walkable residential streets connected to retail and services.', '/media/oniria/residence-roundabout.png', '["Residence Collection"]'::jsonb, 'published', 2),
('v-avenue', 'V Avenue', 'The commercial and lifestyle spine of Roho.', '/media/oniria/v-avenue-commercial.png', '["V Avenue"]'::jsonb, 'published', 3)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    related_collections = EXCLUDED.related_collections,
    status = EXCLUDED.status,
    sort_order = EXCLUDED.sort_order;
