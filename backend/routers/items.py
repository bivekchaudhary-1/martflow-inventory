from fastapi import APIRouter, HTTPException, Request, Query
from typing import List, Optional
from models import Item, ItemCreate, ItemUpdate
from database import items, get_item_by_id, enrich_item
import audit as audit_service

router = APIRouter()

LOW_STOCK_THRESHOLD = 10   # fallback if item has no min_stock


def _get_username(request: Request) -> str:
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
    return item.model_dump(exclude={"category_name", "location_name", "supplier_name"})


# ── Read ──────────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[Item])
def get_all_items(
    search: Optional[str] = Query(None, description="Search by name or SKU"),
    category_id: Optional[int] = None,
    is_active: bool = True,
):
    result = [i for i in items if i.is_active == is_active]
    if category_id:
        result = [i for i in result if i.category_id == category_id]
    if search:
        q = search.lower()
        result = [i for i in result if q in i.name.lower() or (i.sku and q in i.sku.lower())]
    return [enrich_item(i) for i in result]


@router.get("/low-stock", response_model=List[Item])
def get_low_stock():
    result = [i for i in items if i.is_active and i.stock_count < i.min_stock]
    return [enrich_item(i) for i in sorted(result, key=lambda x: x.stock_count)]


@router.get("/{item_id}", response_model=Item)
def get_item(item_id: int):
    item = get_item_by_id(item_id)
    if not item or not item.is_active:
        raise HTTPException(status_code=404, detail="Item not found")
    return enrich_item(item)


# ── Write ─────────────────────────────────────────────────────────────────────

@router.post("/", response_model=Item)
def create_item(payload: ItemCreate, request: Request):
    new_id = max((i.id for i in items), default=0) + 1
    item = Item(id=new_id, **payload.model_dump(), is_active=True)
    items.append(item)
    enrich_item(item)

    meta = f"⚠ Created with low stock ({item.stock_count})" if item.stock_count < item.min_stock else None
    audit_service.record(
        action="create", entity="item", entity_id=item.id,
        entity_name=item.name, username=_get_username(request),
        before=None, after=_snapshot(item), meta=meta,
    )
    return item


@router.put("/{item_id}", response_model=Item)
def update_item(item_id: int, payload: ItemUpdate, request: Request):
    item = get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    before    = _snapshot(item)
    changes   = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(item, field, value)
    after = _snapshot(item)

    diff = "; ".join(f"{k}: {before.get(k)} → {v}" for k, v in changes.items()) or None
    if "stock_count" in changes and after["stock_count"] < item.min_stock and before["stock_count"] >= item.min_stock:
        diff = (diff or "") + f" ⚠ Stock dropped below min ({item.min_stock})"

    audit_service.record(
        action="update", entity="item", entity_id=item.id,
        entity_name=item.name, username=_get_username(request),
        before=before, after=after, meta=diff,
    )
    return enrich_item(item)


@router.delete("/{item_id}")
def delete_item(item_id: int, request: Request):
    item = get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    before = _snapshot(item)
    item.is_active = False   # soft delete

    audit_service.record(
        action="delete", entity="item", entity_id=item_id,
        entity_name=item.name, username=_get_username(request),
        before=before, after=None,
        meta=f"Soft-deleted from {item.location_name or item.location_id}",
    )
    return {"detail": "Item deleted"}
