"""
Items Router
Includes audit logging on every mutating operation (create / update / delete).
The username is read from the Authorization header token when present;
falls back to "system" for unauthenticated requests.
"""

from fastapi import APIRouter, HTTPException, Request
from typing import List
from models import Item, ItemCreate, ItemUpdate
from database import items, get_item_by_id
import audit as audit_service

router = APIRouter()

LOW_STOCK_THRESHOLD = 10


def _get_username(request: Request) -> str:
    """Extract username from Bearer token payload (best-effort, no hard auth)."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            from database import SECRET_KEY, ALGORITHM
            from jose import jwt
            payload = jwt.decode(auth[7:], SECRET_KEY, algorithms=[ALGORITHM])
            return payload.get("sub", "system")
        except Exception:
            pass
    return "system"


def _snapshot(item: Item) -> dict:
    return item.model_dump()


# ── Read endpoints ────────────────────────────────────────────────────────────

@router.get("/", response_model=List[Item])
def get_all_items():
    return items


# /low-stock MUST be before /{item_id} — FastAPI matches routes top-down
@router.get("/low-stock", response_model=List[Item])
def get_low_stock():
    return [item for item in items if item.stock_count < LOW_STOCK_THRESHOLD]


@router.get("/{item_id}", response_model=Item)
def get_item(item_id: int):
    item = get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


# ── Write endpoints (all emit audit log entries) ──────────────────────────────

@router.post("/", response_model=Item)
def create_item(payload: ItemCreate, request: Request):
    new_id = max((i.id for i in items), default=0) + 1
    item = Item(id=new_id, **payload.model_dump())
    items.append(item)

    username = _get_username(request)
    meta = None
    if item.stock_count < LOW_STOCK_THRESHOLD:
        meta = f"⚠ Created with low stock ({item.stock_count} units)"

    audit_service.record(
        action="create",
        entity="item",
        entity_id=item.id,
        entity_name=item.name,
        username=username,
        before=None,
        after=_snapshot(item),
        meta=meta,
    )
    return item


@router.put("/{item_id}", response_model=Item)
def update_item(item_id: int, payload: ItemUpdate, request: Request):
    item = get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    before = _snapshot(item)
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(item, field, value)
    after = _snapshot(item)

    # Build a human-readable diff note
    diff_parts = []
    for k, v in changes.items():
        diff_parts.append(f"{k}: {before.get(k)} → {v}")
    meta = "; ".join(diff_parts) if diff_parts else None

    # Flag if stock just dropped below threshold
    if (
        "stock_count" in changes
        and after["stock_count"] < LOW_STOCK_THRESHOLD
        and before["stock_count"] >= LOW_STOCK_THRESHOLD
    ):
        meta = (meta or "") + f" ⚠ Stock dropped below {LOW_STOCK_THRESHOLD}"

    audit_service.record(
        action="update",
        entity="item",
        entity_id=item.id,
        entity_name=item.name,
        username=_get_username(request),
        before=before,
        after=after,
        meta=meta,
    )
    return item


@router.delete("/{item_id}")
def delete_item(item_id: int, request: Request):
    item = get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    before = _snapshot(item)
    items.remove(item)

    audit_service.record(
        action="delete",
        entity="item",
        entity_id=item_id,
        entity_name=item.name,
        username=_get_username(request),
        before=before,
        after=None,
        meta=f"Deleted from {item.location}",
    )
    return {"detail": "Item deleted"}
