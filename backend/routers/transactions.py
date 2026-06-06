from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timezone
from models import StockTransaction, TransactionCreate
from database import transactions, items, get_item_by_id

router = APIRouter()


@router.get("/", response_model=List[StockTransaction])
def list_transactions(item_id: Optional[int] = None, limit: int = 50):
    result = list(reversed(transactions))   # newest first
    if item_id:
        result = [t for t in result if t.item_id == item_id]
    return result[:limit]


@router.post("/", response_model=StockTransaction)
def create_transaction(payload: TransactionCreate):
    item = get_item_by_id(payload.item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    new_id = max((t.id for t in transactions), default=0) + 1
    t = StockTransaction(
        id=new_id,
        **payload.model_dump(),
        created_at=datetime.now(timezone.utc),
        item_name=item.name,
    )
    transactions.append(t)

    # Update the item's stock count
    item.stock_count = payload.quantity_after

    return t
