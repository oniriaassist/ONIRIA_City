USE oniria_city;

INSERT INTO property_collections (slug, title, description, status, sort_order) VALUES
('villa-collection', 'Villa Collection', 'Private homes with generous plots, garden living, and family-scale layouts.', 'published', 1),
('residence-collection', 'Residence Collection', 'Elegant apartments and residences close to daily city amenities.', 'published', 2),
('v-avenue', 'V Avenue', 'Retail, hospitality, and commercial opportunities in the city corridor.', 'published', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO properties (slug, collection_id, title, property_type, bedrooms, status, price_label, hero_image, description)
SELECT 'skyline-villa', pc.id, 'Skyline Villa', 'villa', 5, 'published', 'Available on request', '/media/oniria/villa-pool-rear.png', 'A private family villa with elevated views and generous outdoor living.'
FROM property_collections pc WHERE pc.slug = 'villa-collection'
ON DUPLICATE KEY UPDATE title = VALUES(title), hero_image = VALUES(hero_image), description = VALUES(description);

INSERT INTO properties (slug, collection_id, title, property_type, bedrooms, status, price_label, hero_image, description)
SELECT 'avenue-residence', pc.id, 'Avenue Residence', 'residence', 3, 'published', 'Available on request', '/media/oniria/residence-roundabout.png', 'A refined apartment residence designed for walkable access to ONIRIA amenities.'
FROM property_collections pc WHERE pc.slug = 'residence-collection'
ON DUPLICATE KEY UPDATE title = VALUES(title), hero_image = VALUES(hero_image), description = VALUES(description);

INSERT INTO properties (slug, collection_id, title, property_type, bedrooms, status, price_label, hero_image, description)
SELECT 'v-avenue-retail-suite', pc.id, 'V Avenue Retail Suite', 'commercial', NULL, 'published', 'Leasing enquiries open', '/media/oniria/v-avenue-commercial.png', 'A commercial suite positioned within Roho retail and hospitality corridor.'
FROM property_collections pc WHERE pc.slug = 'v-avenue'
ON DUPLICATE KEY UPDATE title = VALUES(title), hero_image = VALUES(hero_image), description = VALUES(description);
