import json
import logging
from typing import Any


logger = logging.getLogger(__name__)


APPROVED_PUBLIC_KNOWLEDGE = [
    {
        "document_id": "oniria-property-collections-v1",
        "status": "approved",
        "channel": "public",
        "keywords": ["property", "properties", "villa", "villas", "residence", "residences", "commercial", "v avenue"],
        "answer": "Roho presents three public property groups: Villa Collection, Residence Collection and V Avenue commercial opportunities.",
        "actions": [{"label": "Explore properties", "href": "/properties"}, {"label": "Make an inquiry", "href": "/inquiries"}],
    },
    {
        "document_id": "oniria-masterplan-v1",
        "status": "approved",
        "channel": "public",
        "keywords": ["masterplan", "zone", "zones", "community", "fumba", "zanzibar"],
        "answer": "Roho is presented as a connected community in Fumba, Zanzibar, with residential zones, V Avenue and lifestyle amenities.",
        "actions": [{"label": "View masterplan", "href": "/masterplan"}],
    },
    {
        "document_id": "oniria-site-visits-v1",
        "status": "approved",
        "channel": "public",
        "keywords": ["visit", "site visit", "tour", "consultation", "appointment", "brochure"],
        "answer": "Visitors can request a brochure, consultation or site visit without creating an account. The sales team follows up using the submitted contact details.",
        "actions": [{"label": "Request a site visit", "href": "/inquiries?type=site-visit"}],
    },
]


class KnowledgeRepository:
    def __init__(self, pool: Any | None = None) -> None:
        self.pool = pool

    async def retrieve_public_approved_chunks(self, question: str, limit: int = 3) -> list[dict[str, Any]]:
        if self.pool:
            try:
                rows = await self.pool.fetch(
                    """
                    SELECT document_id, answer, actions
                    FROM knowledge_chunks
                    WHERE status = 'approved'
                      AND channel = 'public'
                      AND active = 1
                      AND MATCH(content) AGAINST (%s IN NATURAL LANGUAGE MODE)
                    LIMIT %s
                    """,
                    question,
                    limit,
                )
                return [self._normalize_db_chunk(row) for row in rows]
            except Exception:
                logger.warning("Knowledge table unavailable; using approved public seed knowledge")

        return self._search_seed_knowledge(question, limit)

    def _search_seed_knowledge(self, question: str, limit: int) -> list[dict[str, Any]]:
        normalized = question.lower()
        scored = []
        for item in APPROVED_PUBLIC_KNOWLEDGE:
            score = sum(len(keyword) for keyword in item["keywords"] if keyword in normalized)
            if score:
                scored.append((score, item))
        scored.sort(key=lambda pair: pair[0], reverse=True)
        return [item for _, item in scored[:limit]]

    def _normalize_db_chunk(self, row: Any) -> dict[str, Any]:
        chunk = dict(row)
        actions = chunk.get("actions")
        if isinstance(actions, str):
            try:
                chunk["actions"] = json.loads(actions)
            except json.JSONDecodeError:
                chunk["actions"] = []
        return chunk
