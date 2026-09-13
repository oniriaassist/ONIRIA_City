INSERT INTO property_collections (slug, title, description, status, sort_order) VALUES
('villa-collection', 'Villa Collection', 'Private homes with generous plots, garden living, and family-scale layouts.', 'published', 1),
('residence-collection', 'Residence Collection', 'Elegant apartments and residences close to daily city amenities.', 'published', 2),
('v-avenue', 'V Avenue', 'Retail, hospitality, and commercial opportunities in the city corridor.', 'published', 3)
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    status = EXCLUDED.status,
    sort_order = EXCLUDED.sort_order;

INSERT INTO properties (slug, collection_id, title, property_type, bedrooms, status, price_label, hero_image, description)
SELECT 'skyline-villa', pc.id, 'Skyline Villa', 'villa', 5, 'published', 'Available on request', '/media/oniria/villa-pool-rear.png', 'A private family villa with elevated views, generous outdoor living, and direct access to Roho lifestyle amenities.'
FROM property_collections pc WHERE pc.slug = 'villa-collection'
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    collection_id = EXCLUDED.collection_id,
    property_type = EXCLUDED.property_type,
    bedrooms = EXCLUDED.bedrooms,
    status = EXCLUDED.status,
    price_label = EXCLUDED.price_label,
    hero_image = EXCLUDED.hero_image,
    description = EXCLUDED.description;

INSERT INTO properties (slug, collection_id, title, property_type, bedrooms, status, price_label, hero_image, description)
SELECT 'avenue-residence', pc.id, 'Avenue Residence', 'apartment', 3, 'published', 'Available on request', '/media/oniria/residence-roundabout.png', 'A refined apartment residence designed for walkable access to retail, dining, wellness, and business services.'
FROM property_collections pc WHERE pc.slug = 'residence-collection'
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    collection_id = EXCLUDED.collection_id,
    property_type = EXCLUDED.property_type,
    bedrooms = EXCLUDED.bedrooms,
    status = EXCLUDED.status,
    price_label = EXCLUDED.price_label,
    hero_image = EXCLUDED.hero_image,
    description = EXCLUDED.description;

INSERT INTO properties (slug, collection_id, title, property_type, bedrooms, status, price_label, hero_image, description)
SELECT 'v-avenue-retail-suite', pc.id, 'V Avenue Retail Suite', 'commercial', NULL, 'published', 'Leasing enquiries open', '/media/oniria/v-avenue-commercial.png', 'A public-facing commercial suite positioned within Roho''s retail and hospitality corridor.'
FROM property_collections pc WHERE pc.slug = 'v-avenue'
ON CONFLICT (slug) DO UPDATE
SET title = EXCLUDED.title,
    collection_id = EXCLUDED.collection_id,
    property_type = EXCLUDED.property_type,
    bedrooms = EXCLUDED.bedrooms,
    status = EXCLUDED.status,
    price_label = EXCLUDED.price_label,
    hero_image = EXCLUDED.hero_image,
    description = EXCLUDED.description;

DELETE FROM property_features
WHERE property_id IN (SELECT id FROM properties WHERE slug IN ('skyline-villa', 'avenue-residence', 'v-avenue-retail-suite'));

INSERT INTO property_features (property_id, feature, sort_order)
SELECT p.id, feature, sort_order
FROM properties p
JOIN (
  VALUES
    ('skyline-villa', 'Private garden', 1),
    ('skyline-villa', 'Pool deck', 2),
    ('skyline-villa', 'Family lounge', 3),
    ('skyline-villa', 'Staff quarters', 4),
    ('avenue-residence', 'Balcony', 1),
    ('avenue-residence', 'Concierge', 2),
    ('avenue-residence', 'Secure parking', 3),
    ('avenue-residence', 'Shared wellness amenities', 4),
    ('v-avenue-retail-suite', 'High-street frontage', 1),
    ('v-avenue-retail-suite', 'Flexible fit-out', 2),
    ('v-avenue-retail-suite', 'Service access', 3),
    ('v-avenue-retail-suite', 'Pedestrian traffic', 4)
) AS seed(slug, feature, sort_order) ON seed.slug = p.slug;

DELETE FROM property_media
WHERE property_id IN (SELECT id FROM properties WHERE slug IN ('skyline-villa', 'avenue-residence', 'v-avenue-retail-suite'));

INSERT INTO property_media (property_id, media_type, url, alt_text, is_primary, sort_order)
SELECT p.id, 'image', media.url, media.alt_text, true, 1
FROM properties p
JOIN (
  VALUES
    ('skyline-villa', '/media/oniria/villa-pool-rear.png', 'Skyline Villa pool and rear facade'),
    ('avenue-residence', '/media/oniria/residence-roundabout.png', 'ONIRIA residences and landscaped roundabout'),
    ('v-avenue-retail-suite', '/media/oniria/v-avenue-commercial.png', 'V Avenue commercial frontage')
) AS media(slug, url, alt_text) ON media.slug = p.slug;

DELETE FROM floor_plans
WHERE property_id IN (SELECT id FROM properties WHERE slug IN ('skyline-villa', 'avenue-residence', 'v-avenue-retail-suite'));

INSERT INTO floor_plans (property_id, name, bedrooms, size_sqm, url, sort_order)
SELECT p.id, plan.name, plan.bedrooms, plan.size_sqm, plan.url, 1
FROM properties p
JOIN (
  VALUES
    ('skyline-villa', 'Five-bedroom villa', 5, 520.00, '/media/floorplans/skyline-villa.pdf'),
    ('avenue-residence', 'Three-bedroom residence', 3, 210.00, '/media/floorplans/avenue-residence.pdf'),
    ('v-avenue-retail-suite', 'Commercial shell', NULL, 140.00, '/media/floorplans/v-avenue-retail-suite.pdf')
) AS plan(slug, name, bedrooms, size_sqm, url) ON plan.slug = p.slug;

INSERT INTO knowledge_chunks (document_id, answer, actions, content, status, channel, active) VALUES
(
  'oniria-property-collections-v1',
  'Roho presents three public property groups: Villa Collection, Residence Collection and V Avenue commercial opportunities.',
  '[{"label":"Explore properties","href":"/properties"},{"label":"Make an inquiry","href":"/inquiries"}]'::jsonb,
  'property properties villa villas residence residences commercial v avenue collection collections',
  'approved',
  'public',
  true
),
(
  'oniria-masterplan-v1',
  'Roho is presented as a connected community in Fumba, Zanzibar, with residential zones, V Avenue and lifestyle amenities.',
  '[{"label":"View masterplan","href":"/masterplan"}]'::jsonb,
  'masterplan zone zones community fumba zanzibar residential v avenue lifestyle amenities',
  'approved',
  'public',
  true
),
(
  'oniria-site-visits-v1',
  'Visitors can request a brochure, consultation or site visit without creating an account. The sales team follows up using the submitted contact details.',
  '[{"label":"Request a site visit","href":"/inquiries?type=site-visit"}]'::jsonb,
  'visit site visit tour consultation appointment brochure inquiry sales team contact details',
  'approved',
  'public',
  true
)
ON CONFLICT (document_id) DO UPDATE
SET answer = EXCLUDED.answer,
    actions = EXCLUDED.actions,
    content = EXCLUDED.content,
    status = EXCLUDED.status,
    channel = EXCLUDED.channel,
    active = EXCLUDED.active;
