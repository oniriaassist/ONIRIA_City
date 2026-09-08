\# Roho — Database Dictionary



Database: PostgreSQL 17

Maintained by: Kelvin — Database \& Knowledge Integration



This document explains every table and field in the Roho database.

No customer authentication tables exist in this schema (public access model, no login required).



\---



\## property\_collections

Groups of properties shown on the homepage and properties page (Villa Collection, Residence Collection, V Avenue).



| Field | Type | Description |

|---|---|---|

| id | UUID | Unique identifier |

| name | VARCHAR(255) | Display name, e.g. "Villa Collection" |

| slug | VARCHAR(255) | URL-friendly identifier, must be unique |

| description | TEXT | Marketing copy for the collection |

| display\_order | INT | Controls sort order on the frontend |

| is\_published | BOOLEAN | Whether visible on the public site |

| created\_at / updated\_at | TIMESTAMP | Record timestamps |



\---



\## properties

Individual property listings (villas, residences, commercial units).



| Field | Type | Description |

|---|---|---|

| id | UUID | Unique identifier |

| collection\_id | UUID | Links to property\_collections |

| slug | VARCHAR(255) | URL-friendly identifier, unique |

| title | VARCHAR(255) | Property name/title |

| type | ENUM | villa / residence / commercial |

| subtype | VARCHAR(100) | e.g. "Three-Bedroom Villa" |

| bedrooms / bathrooms | INT | Room counts |

| size\_sqm | DECIMAL | Size in square metres |

| price | DECIMAL | Listed price |

| status | ENUM | available / reserved / sold |

| is\_published | BOOLEAN | Visible on public site |

| is\_approved | BOOLEAN | Sales-approved for display |

| description | TEXT | Property description |

| created\_at / updated\_at | TIMESTAMP | Record timestamps |



\---



\## property\_features

Individual features attached to a property (e.g. "Private Pool", "Sea View").



| Field | Type | Description |

|---|---|---|

| id | UUID | Unique identifier |

| property\_id | UUID | Links to properties |

| feature\_name | VARCHAR(255) | Name of the feature |

| feature\_value | VARCHAR(255) | Optional value/detail |

| display\_order | INT | Sort order |



\---



\## property\_media

Images and videos for each property.



| Field | Type | Description |

|---|---|---|

| id | UUID | Unique identifier |

| property\_id | UUID | Links to properties |

| media\_type | ENUM | image / video |

| url | VARCHAR(500) | Media file location |

| caption | VARCHAR(255) | Optional caption |

| is\_primary | BOOLEAN | Marks the main/hero image |

| display\_order | INT | Gallery sort order |



\---



\## floor\_plans

Floor plan images and specs per property.



| Field | Type | Description |

|---|---|---|

| id | UUID | Unique identifier |

| property\_id | UUID | Links to properties |

| name | VARCHAR(255) | Floor plan name |

| image\_url | VARCHAR(500) | Floor plan image |

| size\_sqm | DECIMAL | Size in square metres |

| bedrooms / bathrooms | INT | Room counts for this plan |

| display\_order | INT | Sort order |



\---



\## masterplan\_zones

Clickable zones on the interactive masterplan (Villas, Residences, V Avenue, Lifestyle, Commercial).



| Field | Type | Description |

|---|---|---|

| id | UUID | Unique identifier |

| name | VARCHAR(255) | Zone name |

| slug | VARCHAR(255) | URL-friendly identifier, unique |

| zone\_type | VARCHAR(100) | Category of zone |

| description | TEXT | Zone description |

| map\_coordinates | JSONB | Click-zone shape/position data for the frontend map |

| image\_url | VARCHAR(500) | Zone image |

| related\_collection\_id | UUID | Links to property\_collections |

| display\_order | INT | Sort order |

| is\_published | BOOLEAN | Visible on public site |



\---



\## amenities

Community amenities (pools, gyms, restaurants, parks, etc.).



| Field | Type | Description |

|---|---|---|

| id | UUID | Unique identifier |

| name | VARCHAR(255) | Amenity name |

| category | VARCHAR(100) | Grouping, e.g. "Wellness" |

| description | TEXT | Amenity description |

| icon | VARCHAR(255) | Icon reference for frontend |

| image\_url | VARCHAR(500) | Amenity image |

| display\_order | INT | Sort order |

| is\_published | BOOLEAN | Visible on public site |



\---



\## property\_amenities

Junction table linking properties to their available amenities (many-to-many).



| Field | Type | Description |

|---|---|---|

| id | UUID | Unique identifier |

| property\_id | UUID | Links to properties |

| amenity\_id | UUID | Links to amenities |



Unique constraint: a property cannot have the same amenity listed twice.



\---



\## anonymous\_sessions

Tracks each anonymous visitor without requiring an account, per the no-login public access model.



| Field | Type | Description |

|---|---|---|

| id | UUID | Unique identifier |

| session\_token | VARCHAR(255) | Token stored in the visitor's browser, unique |

| first\_seen\_at / last\_seen\_at | TIMESTAMP | Session activity window |

| utm\_source / utm\_medium / utm\_campaign | VARCHAR(255) | Marketing attribution data |

| landing\_page | VARCHAR(500) | First page visited |

| user\_agent | VARCHAR(500) | Browser/device info |

| ip\_hash | VARCHAR(255) | Hashed (not raw) IP address, for privacy |



\---



\## session\_events

Individual actions taken by an anonymous visitor within a session (page views, clicks, etc.).



| Field | Type | Description |

|---|---|---|

| id | UUID | Unique identifier |

| session\_id | UUID | Links to anonymous\_sessions |

| event\_type | VARCHAR(100) | Type of event, e.g. "page\_view" |

| page\_path | VARCHAR(500) | Page where the event occurred |

| metadata | JSONB | Flexible extra event data |



\---



\## Views



\### public\_properties

Read-only view combining properties with their collection name.

\*\*Only returns properties where `is\_published = TRUE AND is\_approved = TRUE`.\*\*

This is the only property data the public-facing API should ever query — it guarantees drafts and unapproved listings are never accidentally exposed.



\---



\## Notes



\- All tables use UUID primary keys (`gen\_random\_uuid()`), matching the spec's requirement.

\- No authentication, user, or password tables exist in this schema — public access model.

\- Save/Compare property features are handled in frontend browser localStorage, not stored here.

\- Tables for leads, enquiries, campaigns, conversations, and the knowledge base are scheduled for Wednesday and Thursday per the implementation plan.

