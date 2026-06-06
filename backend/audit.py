"""
Audit Logging Service
---------------------
In-memory audit log that records every mutating operation on inventory items.
Mirrors the "Audit Logging Service" consumer from the architecture diagram.

In production this would write to a dedicated audit_logs table in PostgreSQL
(append-only, never updated or deleted) and be fed via the CDC → MQ pipeline.
Here we keep it simple: a module-level list that all routers append to.
"""

from datetime import datetime, timezone
from typing import List, Optional
from models import AuditEntry

# ── In-memory store (append-only) ────────────────────────────────────────────
_log: List[AuditEntry] = []
_next_id = 1


def record(
    action: str,
    entity: str,
    entity_id: int,
    entity_name: str,
    username: str,
    before=None,
    after=None,
    meta: Optional[str] = None,
) -> AuditEntry:
    """Append one audit entry and return it."""
    global _next_id
    entry = AuditEntry(
        id=_next_id,
        timestamp=datetime.now(timezone.utc),
        action=action,
        entity=entity,
        entity_id=entity_id,
        entity_name=entity_name,
        username=username,
        before=before,
        after=after,
        meta=meta,
    )
    _log.append(entry)
    _next_id += 1
    return entry


def get_log(
    action: Optional[str] = None,
    entity_id: Optional[int] = None,
    username: Optional[str] = None,
    limit: int = 100,
) -> List[AuditEntry]:
    """Return filtered audit entries, newest first."""
    result = list(reversed(_log))
    if action:
        result = [e for e in result if e.action == action]
    if entity_id is not None:
        result = [e for e in result if e.entity_id == entity_id]
    if username:
        result = [e for e in result if e.username == username]
    return result[:limit]


def get_entry(entry_id: int) -> Optional[AuditEntry]:
    return next((e for e in _log if e.id == entry_id), None)
