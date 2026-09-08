from __future__ import annotations

import json
from typing import Any

from app.schemas.property_schemas import CollectionPublic, MasterplanZone, PropertyDetail, PropertySummary, SearchResult


SEEDED_PROPERTIES: list[dict[str, Any]] = [
    {
        "id": 1,
        "slug": "skyline-villa",
        "title": "Skyline Villa",
        "collection": "Villa Collection",
        "zone": "Hillside Residences",
        "property_type": "villa",
        "bedrooms": 5,
        "price_label": "Available on request",
        "status": "published",
        "hero_image": "/media/oniria/villa-pool-rear.png",
        "description": "A private family villa with elevated views, generous outdoor living, and direct access to Roho lifestyle amenities.",
        "features": ["Private garden", "Pool deck", "Family lounge", "Staff quarters"],
        "media": [{"type": "image", "url": "/media/oniria/villa-pool-rear.png", "alt": "Skyline Villa pool and rear facade"}],
        "floor_plans": [{"name": "Five-bedroom villa", "bedrooms": 5, "size_sqm": 520, "url": "/media/floorplans/skyline-villa.pdf"}],
    },
    {
        "id": 2,
        "slug": "avenue-residence",
        "title": "Avenue Residence",
        "collection": "Residence Collection",
        "zone": "Central Living District",
        "property_type": "apartment",
        "bedrooms": 3,
        "price_label": "Available on request",
        "status": "published",
        "hero_image": "/media/oniria/residence-roundabout.png",
        "description": "A refined apartment residence designed for walkable access to retail, dining, wellness, and business services.",
        "features": ["Balcony", "Concierge", "Secure parking", "Shared wellness amenities"],
        "media": [{"type": "image", "url": "/media/oniria/residence-roundabout.png", "alt": "ONIRIA residences and landscaped roundabout"}],
        "floor_plans": [{"name": "Three-bedroom residence", "bedrooms": 3, "size_sqm": 210, "url": "/media/floorplans/avenue-residence.pdf"}],
    },
    {
        "id": 3,
        "slug": "v-avenue-retail-suite",
        "title": "V Avenue Retail Suite",
        "collection": "V Avenue",
        "zone": "V Avenue",
        "property_type": "commercial",
        "bedrooms": None,
        "price_label": "Leasing enquiries open",
        "status": "published",
        "hero_image": "/media/oniria/v-avenue-commercial.png",
        "description": "A public-facing commercial suite positioned within Roho's retail and hospitality corridor.",
        "features": ["High-street frontage", "Flexible fit-out", "Service access", "Pedestrian traffic"],
        "media": [{"type": "image", "url": "/media/oniria/v-avenue-commercial.png", "alt": "V Avenue commercial frontage"}],
        "floor_plans": [{"name": "Commercial shell", "bedrooms": None, "size_sqm": 140, "url": "/media/floorplans/v-avenue-retail-suite.pdf"}],
    },
]

SEEDED_COLLECTIONS = [
    {
        "slug": "villa-collection",
        "title": "Villa Collection",
        "description": "Private homes with generous plots, garden living, and family-scale layouts.",
        "property_count": 1,
    },
    {
        "slug": "residence-collection",
        "title": "Residence Collection",
        "description": "Elegant apartments and residences close to daily city amenities.",
        "property_count": 1,
    },
    {
        "slug": "v-avenue",
        "title": "V Avenue",
        "description": "Retail, hospitality, and commercial opportunities in the city corridor.",
        "property_count": 1,
    },
]

SEEDED_ZONES = [
    {
        "slug": "hillside-residences",
        "title": "Hillside Residences",
        "description": "Low-density residential living with privacy, greenery, and long views.",
        "related_collections": ["Villa Collection"],
    },
    {
        "slug": "central-living-district",
        "title": "Central Living District",
        "description": "Walkable residential streets connected to wellness, retail, and services.",
        "related_collections": ["Residence Collection"],
    },
    {
        "slug": "v-avenue",
        "title": "V Avenue",
        "description": "The commercial and lifestyle spine of Roho.",
        "related_collections": ["V Avenue"],
    },
]


class PropertyRepository:
    def __init__(self, pool: Any | None = None) -> None:
        self.pool = pool

    async def list_properties(
        self,
        *,
        collection: str | None,
        property_type: str | None,
        zone: str | None,
        bedrooms: int | None,
        page: int,
        page_size: int,
    ) -> tuple[list[PropertySummary], int]:
        if self.pool:
            return await self._list_properties_db(collection, property_type, zone, bedrooms, page, page_size)

        items = [item for item in SEEDED_PROPERTIES if item["status"] == "published"]
        if collection:
            items = [item for item in items if item["collection"].lower().replace(" ", "-") == collection]
        if property_type:
            items = [item for item in items if item["property_type"] == property_type]
        if zone:
            items = [item for item in items if item["zone"].lower().replace(" ", "-") == zone]
        if bedrooms is not None:
            items = [item for item in items if item["bedrooms"] == bedrooms]

        total = len(items)
        start = (page - 1) * page_size
        end = start + page_size
        return [PropertySummary(**item) for item in items[start:end]], total

    async def get_property(self, slug: str) -> PropertyDetail | None:
        if self.pool:
            return await self._get_property_db(slug)
        for item in SEEDED_PROPERTIES:
            if item["slug"] == slug and item["status"] == "published":
                return PropertyDetail(**item)
        return None

    async def list_collections(self) -> list[CollectionPublic]:
        if self.pool:
            rows = await self.pool.fetch(
                """
                SELECT slug, title, description, property_count
                FROM public_collections
                WHERE status = 'published'
                ORDER BY sort_order, title
                """
            )
            return [CollectionPublic(**dict(row)) for row in rows]
        return [CollectionPublic(**item) for item in SEEDED_COLLECTIONS]

    async def list_masterplan_zones(self) -> list[MasterplanZone]:
        if self.pool:
            rows = await self.pool.fetch(
                """
                SELECT slug, title, description, related_collections
                FROM public_masterplan_zones
                WHERE status = 'published'
                ORDER BY sort_order, title
                """
            )
            return [MasterplanZone(**self._normalize_json_fields(dict(row), ("related_collections",))) for row in rows]
        return [MasterplanZone(**item) for item in SEEDED_ZONES]

    async def search(self, query: str, limit: int) -> list[SearchResult]:
        if self.pool:
            return await self._search_db(query, limit)

        needle = query.lower()
        results: list[SearchResult] = []
        for item in SEEDED_PROPERTIES:
            haystack = " ".join([item["title"], item["collection"], item["zone"], item["property_type"], item["description"]]).lower()
            if needle in haystack:
                results.append(SearchResult(type="property", title=item["title"], slug=item["slug"], excerpt=item["description"]))
        for item in SEEDED_COLLECTIONS:
            if needle in f"{item['title']} {item['description']}".lower():
                results.append(SearchResult(type="collection", title=item["title"], slug=item["slug"], excerpt=item["description"]))
        for item in SEEDED_ZONES:
            if needle in f"{item['title']} {item['description']}".lower():
                results.append(SearchResult(type="masterplan_zone", title=item["title"], slug=item["slug"], excerpt=item["description"]))
        return results[:limit]

    async def _list_properties_db(
        self,
        collection: str | None,
        property_type: str | None,
        zone: str | None,
        bedrooms: int | None,
        page: int,
        page_size: int,
    ) -> tuple[list[PropertySummary], int]:
        assert self.pool is not None
        rows = await self.pool.fetch(
            """
            SELECT id, slug, title, collection, zone, property_type, bedrooms, price_label, status, hero_image,
                   COUNT(*) OVER() AS total_count
            FROM public_properties
            WHERE status = 'published'
              AND (%s IS NULL OR collection_slug = %s)
              AND (%s IS NULL OR property_type = %s)
              AND (%s IS NULL OR zone_slug = %s)
              AND (%s IS NULL OR bedrooms = %s)
            ORDER BY sort_order, title
            LIMIT %s OFFSET %s
            """,
            collection,
            collection,
            property_type,
            property_type,
            zone,
            zone,
            bedrooms,
            bedrooms,
            page_size,
            (page - 1) * page_size,
        )
        total = rows[0]["total_count"] if rows else 0
        return [PropertySummary(**{key: row[key] for key in PropertySummary.model_fields}) for row in rows], total

    async def _get_property_db(self, slug: str) -> PropertyDetail | None:
        assert self.pool is not None
        row = await self.pool.fetchrow(
            """
            SELECT id, slug, title, collection, zone, property_type, bedrooms, price_label, status,
                   hero_image, description, features, media, floor_plans
            FROM public_properties
            WHERE slug = %s AND status = 'published'
            """,
            slug,
        )
        return PropertyDetail(**self._normalize_json_fields(dict(row), ("features", "media", "floor_plans"))) if row else None

    async def _search_db(self, query: str, limit: int) -> list[SearchResult]:
        assert self.pool is not None
        rows = await self.pool.fetch(
            """
            SELECT type, title, slug, excerpt
            FROM public_search_index
            WHERE status = 'published'
              AND MATCH(title, excerpt, content) AGAINST (%s IN NATURAL LANGUAGE MODE)
            ORDER BY MATCH(title, excerpt, content) AGAINST (%s IN NATURAL LANGUAGE MODE) DESC
            LIMIT %s
            """,
            query,
            query,
            limit,
        )
        return [SearchResult(**dict(row)) for row in rows]

    def _normalize_json_fields(self, row: dict[str, Any], fields: tuple[str, ...]) -> dict[str, Any]:
        for field in fields:
            value = row.get(field)
            if isinstance(value, (bytes, bytearray)):
                value = value.decode("utf-8")
            if isinstance(value, str):
                try:
                    row[field] = json.loads(value)
                except json.JSONDecodeError:
                    row[field] = []
        return row
