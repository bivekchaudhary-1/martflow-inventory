from fastapi import APIRouter, HTTPException
from src.Schemas.models import ItemCreate, ItemUpdate, ItemResponse
from src.Services.inventory_service import inventory_service

router = APIRouter(prefix="/items", tags=["Items"])

@router.get("/", response_model=list[ItemResponse])
async def get_items():
    """Get all inventory items"""
    items = await inventory_service.get_all_items()
    return items

@router.get("/low-stock", response_model=list[ItemResponse])
async def get_low_stock_items(threshold: int = 10):
    """Get items with stock below threshold"""
    items = await inventory_service.get_low_stock_items(threshold)
    return items

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int):
    """Get a single item by ID"""
    item = await inventory_service.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/", response_model=ItemResponse, status_code=201)
async def create_item(item: ItemCreate):
    """Create a new inventory item"""
    try:
        new_item = await inventory_service.create_item(item)
        return new_item
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(item_id: int, item: ItemUpdate):
    """Update an existing item"""
    updated = await inventory_service.update_item(item_id, item)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated

@router.delete("/{item_id}")
async def delete_item(item_id: int):
    """Delete an item"""
    deleted = await inventory_service.delete_item(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted successfully"}
