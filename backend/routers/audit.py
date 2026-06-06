"""
Audit Log Router — GET /audit/
Exposes the append-only audit trail with optional filters.
"""

from fastapi import APIRouter, Query
from typing import List, Optional
from models import AuditEntry
import audit as audit_service

router = APIRouter()


@router.get("/", response_model=List[AuditEntry])
def list_audit_log(
    action:    Optional[str] = Query(None, description="Filter by action: create | update | delete"),
    entity_id: Optional[int] = Query(None, description="Filter by item ID"),
    username:  Optional[str] = Query(None, description="Filter by username"),
    limit:     int           = Query(100, ge=1, le=500, description="Max entries to return"),
):
    return audit_service.get_log(
        action=action,
        entity_id=entity_id,
        username=username,
        limit=limit,
    )


@router.get("/{entry_id}", response_model=AuditEntry)
def get_audit_entry(entry_id: int):
    from fastapi import HTTPException
    entry = audit_service.get_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Audit entry not found")
    return entry
