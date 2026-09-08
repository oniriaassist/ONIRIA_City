USE oniria_city;

INSERT INTO masterplan_zones (slug, title, description, image_url, status, sort_order) VALUES
('hillside-residences', 'Hillside Residences', 'Low-density residential living with privacy and greenery.', '/media/oniria/villa-gated-entry.png', 'published', 1),
('central-living-district', 'Central Living District', 'Walkable residential streets connected to retail and services.', '/media/oniria/residence-roundabout.png', 'published', 2),
('v-avenue', 'V Avenue', 'The commercial and lifestyle spine of Roho.', '/media/oniria/v-avenue-commercial.png', 'published', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), image_url = VALUES(image_url), status = VALUES(status), sort_order = VALUES(sort_order);
