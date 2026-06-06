from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timezone
from models import PurchaseOrder, PurchaseOrderItem, POCreate, POItemCreate
from database import purchase_orders, items, get_item_by_id, get_supplier_by_id

router = APIRouter()


def _enrich_po(po: PurchaseOrder) -> PurchaseOrder:
    sup = get_supplier_by_id(po.supplier_id) if po.supplier_id else None
    po.supplier_name = sup.name if sup else None
    for line in (po.purchase_order_items or []):
        item = get_item_by_id(line.item_id)
        if item:
            line.item_name = item.name
            line.item_sku  = item.sku
    return po


@router.get("/", response_model=List[PurchaseOrder])
def list_purchase_orders():
    return [_enrich_po(po) for po in reversed(purchase_orders)]


@router.get("/{po_id}", response_model=PurchaseOrder)
def get_purchase_order(po_id: int):
    po = next((p for p in purchase_orders if p.id == po_id), None)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return _enrich_po(po)


@router.post("/", response_model=PurchaseOrder)
def create_purchase_order(header: POCreate, lines: List[POItemCreate]):
    # Generate PO number
    seq = len(purchase_orders) + 1000
    po_number = f"PO-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{seq:04d}"

    new_po_id = max((p.id for p in purchase_orders), default=0) + 1
    po_items = []
    for idx, line in enumerate(lines, start=1):
        item = get_item_by_id(line.item_id)
        po_items.append(PurchaseOrderItem(
            id=idx,
            po_id=new_po_id,
            item_id=line.item_id,
            quantity=line.quantity,
            unit_cost=line.unit_cost,
            received=0,
            notes=line.notes,
            item_name=item.name if item else None,
            item_sku=item.sku  if item else None,
        ))

    po = PurchaseOrder(
        id=new_po_id,
        po_number=po_number,
        supplier_id=header.supplier_id,
        status="draft",
        notes=header.notes,
        expected_date=header.expected_date,
        created_at=datetime.now(timezone.utc),
        purchase_order_items=po_items,
    )
    purchase_orders.append(po)
    return _enrich_po(po)


@router.put("/{po_id}/status", response_model=PurchaseOrder)
def update_po_status(po_id: int, status: str):
    po = next((p for p in purchase_orders if p.id == po_id), None)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    allowed = {"draft", "sent", "received", "cancelled"}
    if status not in allowed:
        raise HTTPException(status_code=400, detail=f"status must be one of {allowed}")
    po.status = status
    if status == "received":
        po.received_date = datetime.now(timezone.utc).date().isoformat()
    return _enrich_po(po)


@router.post("/{po_id}/receive", response_model=PurchaseOrder)
def receive_purchase_order(po_id: int):
    """Mark all lines as received and update item stock counts."""
    po = next((p for p in purchase_orders if p.id == po_id), None)
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    if po.status not in ("draft", "sent"):
        raise HTTPException(status_code=400, detail=f"Cannot receive a PO with status '{po.status}'")

    for line in (po.purchase_order_items or []):
        remaining = line.quantity - line.received
        if remaining > 0:
            item = get_item_by_id(line.item_id)
            if item:
                item.stock_count += remaining
            line.received = line.quantity

    po.status = "received"
    po.received_date = datetime.now(timezone.utc).date().isoformat()
    return _enrich_po(po)
