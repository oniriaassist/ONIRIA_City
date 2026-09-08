CREATE DATABASE IF NOT EXISTS oniria_city CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE oniria_city;

CREATE TABLE IF NOT EXISTS property_collections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'published',
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public_masterplan_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  related_collections JSON NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'published',
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public_properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  collection VARCHAR(160) NOT NULL,
  collection_slug VARCHAR(120) NOT NULL,
  zone VARCHAR(160) NOT NULL,
  zone_slug VARCHAR(120) NOT NULL,
  property_type VARCHAR(60) NOT NULL,
  bedrooms INT NULL,
  price_label VARCHAR(160),
  status VARCHAR(40) NOT NULL DEFAULT 'published',
  hero_image VARCHAR(500),
  description TEXT NOT NULL,
  features JSON NOT NULL,
  media JSON NOT NULL,
  floor_plans JSON NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  FULLTEXT KEY idx_public_properties_search (title, description, collection, zone)
);

CREATE TABLE IF NOT EXISTS public_search_index (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(60) NOT NULL,
  title VARCHAR(180) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'published',
  FULLTEXT KEY idx_public_search_text (title, excerpt, content)
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_id VARCHAR(160) NOT NULL UNIQUE,
  answer TEXT NOT NULL,
  actions JSON NULL,
  content TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'approved',
  channel VARCHAR(30) NOT NULL DEFAULT 'public',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT KEY idx_knowledge_content (content)
);

CREATE TABLE IF NOT EXISTS enquiry_reference_sequence (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(254),
  phone VARCHAR(40),
  score INT NOT NULL DEFAULT 0,
  follow_up_status VARCHAR(80) NOT NULL DEFAULT 'new',
  property_interests JSON NOT NULL,
  collection_interests JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_leads_email (email),
  INDEX idx_leads_phone (phone),
  INDEX idx_leads_follow_up (follow_up_status)
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_number VARCHAR(40) NOT NULL UNIQUE,
  lead_id INT NOT NULL,
  enquiry_type VARCHAR(80) NOT NULL,
  payload JSON NOT NULL,
  score INT NOT NULL,
  follow_up_status VARCHAR(80) NOT NULL,
  notification_status VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enquiries_lead FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE TABLE IF NOT EXISTS lead_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lead_id INT NOT NULL,
  reference_number VARCHAR(40) NOT NULL,
  activity_type VARCHAR(80) NOT NULL,
  summary TEXT NOT NULL,
  campaign JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lead_activities_lead FOREIGN KEY (lead_id) REFERENCES leads(id)
);

INSERT INTO property_collections (slug, title, description, status, sort_order) VALUES
('villa-collection', 'Villa Collection', 'Private homes with generous plots, garden living, and family-scale layouts.', 'published', 1),
('residence-collection', 'Residence Collection', 'Elegant apartments and residences close to daily city amenities.', 'published', 2),
('v-avenue', 'V Avenue', 'Retail, hospitality, and commercial opportunities in the city corridor.', 'published', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), status = VALUES(status), sort_order = VALUES(sort_order);

CREATE OR REPLACE VIEW public_collections AS
SELECT
  pc.slug,
  pc.title,
  pc.description,
  pc.status,
  pc.sort_order,
  COUNT(pp.id) AS property_count
FROM property_collections pc
LEFT JOIN public_properties pp ON pp.collection_slug = pc.slug AND pp.status = 'published'
GROUP BY pc.slug, pc.title, pc.description, pc.status, pc.sort_order;

INSERT INTO public_masterplan_zones (slug, title, description, related_collections, status, sort_order) VALUES
('hillside-residences', 'Hillside Residences', 'Low-density residential living with privacy, greenery, and long views.', JSON_ARRAY('Villa Collection'), 'published', 1),
('central-living-district', 'Central Living District', 'Walkable residential streets connected to wellness, retail, and services.', JSON_ARRAY('Residence Collection'), 'published', 2),
('v-avenue', 'V Avenue', 'The commercial and lifestyle spine of Roho.', JSON_ARRAY('V Avenue'), 'published', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), related_collections = VALUES(related_collections), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO public_properties (
  slug, title, collection, collection_slug, zone, zone_slug, property_type, bedrooms, price_label,
  status, hero_image, description, features, media, floor_plans, sort_order
) VALUES
(
  'skyline-villa', 'Skyline Villa', 'Villa Collection', 'villa-collection', 'Hillside Residences',
  'hillside-residences', 'villa', 5, 'Available on request', 'published',
  '/media/oniria/villa-pool-rear.png',
  'A private family villa with elevated views, generous outdoor living, and direct access to Roho lifestyle amenities.',
  JSON_ARRAY('Private garden', 'Pool deck', 'Family lounge', 'Staff quarters'),
  JSON_ARRAY(JSON_OBJECT('type','image','url','/media/oniria/villa-pool-rear.png','alt','Skyline Villa pool and rear facade')),
  JSON_ARRAY(JSON_OBJECT('name','Five-bedroom villa','bedrooms',5,'size_sqm',520,'url','/media/floorplans/skyline-villa.pdf')),
  1
),
(
  'avenue-residence', 'Avenue Residence', 'Residence Collection', 'residence-collection', 'Central Living District',
  'central-living-district', 'apartment', 3, 'Available on request', 'published',
  '/media/oniria/residence-roundabout.png',
  'A refined apartment residence designed for walkable access to retail, dining, wellness, and business services.',
  JSON_ARRAY('Balcony', 'Concierge', 'Secure parking', 'Shared wellness amenities'),
  JSON_ARRAY(JSON_OBJECT('type','image','url','/media/oniria/residence-roundabout.png','alt','ONIRIA residences and landscaped roundabout')),
  JSON_ARRAY(JSON_OBJECT('name','Three-bedroom residence','bedrooms',3,'size_sqm',210,'url','/media/floorplans/avenue-residence.pdf')),
  2
),
(
  'v-avenue-retail-suite', 'V Avenue Retail Suite', 'V Avenue', 'v-avenue', 'V Avenue',
  'v-avenue', 'commercial', NULL, 'Leasing enquiries open', 'published',
  '/media/oniria/v-avenue-commercial.png',
  'A public-facing commercial suite positioned within Roho''s retail and hospitality corridor.',
  JSON_ARRAY('High-street frontage', 'Flexible fit-out', 'Service access', 'Pedestrian traffic'),
  JSON_ARRAY(JSON_OBJECT('type','image','url','/media/oniria/v-avenue-commercial.png','alt','V Avenue commercial frontage')),
  JSON_ARRAY(JSON_OBJECT('name','Commercial shell','bedrooms',NULL,'size_sqm',140,'url','/media/floorplans/v-avenue-retail-suite.pdf')),
  3
)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), hero_image = VALUES(hero_image), features = VALUES(features), media = VALUES(media), floor_plans = VALUES(floor_plans), status = VALUES(status), sort_order = VALUES(sort_order);

INSERT INTO public_search_index (type, title, slug, excerpt, content, status) VALUES
('property', 'Skyline Villa', 'skyline-villa', 'A private family villa with elevated views and outdoor living.', 'villa private family garden pool skyline hillside residences', 'published'),
('property', 'Avenue Residence', 'avenue-residence', 'An apartment residence close to ONIRIA amenities.', 'residence apartment dining retail wellness central living', 'published'),
('property', 'V Avenue Retail Suite', 'v-avenue-retail-suite', 'A commercial suite within the retail and hospitality corridor.', 'commercial retail suite v avenue leasing business hospitality', 'published'),
('collection', 'Villa Collection', 'villa-collection', 'Private homes with garden living.', 'villa collection private homes gardens family', 'published'),
('collection', 'Residence Collection', 'residence-collection', 'Apartments and residences close to city amenities.', 'residence collection apartments amenities', 'published'),
('collection', 'V Avenue', 'v-avenue', 'Retail, hospitality and commercial opportunities.', 'v avenue retail hospitality commercial dining', 'published')
ON DUPLICATE KEY UPDATE excerpt = VALUES(excerpt), content = VALUES(content), status = VALUES(status);

INSERT INTO knowledge_chunks (document_id, answer, actions, content, status, channel, active) VALUES
('oniria-property-collections-v1', 'Roho presents three public property groups: Villa Collection, Residence Collection and V Avenue commercial opportunities.', JSON_ARRAY(JSON_OBJECT('label', 'Explore properties', 'href', '/properties'), JSON_OBJECT('label', 'Make an inquiry', 'href', '/inquiries')), 'property properties villa villas residence residences commercial v avenue collection collections', 'approved', 'public', 1),
('oniria-masterplan-v1', 'Roho is presented as a connected community in Fumba, Zanzibar, with residential zones, V Avenue and lifestyle amenities.', JSON_ARRAY(JSON_OBJECT('label', 'View masterplan', 'href', '/masterplan')), 'masterplan zone zones community fumba zanzibar residential v avenue lifestyle amenities', 'approved', 'public', 1),
('oniria-site-visits-v1', 'Visitors can request a brochure, consultation or site visit without creating an account. The sales team follows up using the submitted contact details.', JSON_ARRAY(JSON_OBJECT('label', 'Request a site visit', 'href', '/inquiries?type=site-visit')), 'visit site visit tour consultation appointment brochure inquiry sales team contact details', 'approved', 'public', 1)
ON DUPLICATE KEY UPDATE answer = VALUES(answer), actions = VALUES(actions), content = VALUES(content), status = VALUES(status), channel = VALUES(channel), active = VALUES(active);
