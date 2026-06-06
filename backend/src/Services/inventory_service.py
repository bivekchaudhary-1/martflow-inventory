from src.Core.supabase_client import supabase
from src.Schemas.models import ItemCreate, ItemUpdate
from typing import List, Dict, Any

class InventoryService:
    
    @staticmethod
    async def get_all_items() -> List[Dict[str, Any]]:
        """Fetch all inventory items from Supabase"""
        try:
            response = supabase.table("items").select("*").execute()
            return response.data
        except Exception as e:
            print(f"Error fetching items: {e}")
            return []
    
    @staticmethod
    async def get_low_stock_items(threshold: int = 10) -> List[Dict[str, Any]]:
        """Fetch items with stock below threshold"""
        try:
            response = supabase.table("items")\
                .select("*")\
                .lt("stock_count", threshold)\
                .execute()
            return response.data
        except Exception as e:
            print(f"Error fetching low stock items: {e}")
            return []
    
    @staticmethod
    async def get_item_by_id(item_id: int) -> Dict[str, Any]:
        """Fetch a single item by ID"""
        try:
            response = supabase.table("items").select("*").eq("id", item_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error fetching item: {e}")
            return None
    
    @staticmethod
    async def create_item(item_data: ItemCreate) -> Dict[str, Any]:
        """Create a new inventory item"""
        try:
            response = supabase.table("items").insert(item_data.dict()).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            raise Exception(f"Failed to create item: {e}")
    
    @staticmethod
    async def update_item(item_id: int, item_data: ItemUpdate) -> Dict[str, Any]:
        """Update an existing item"""
        try:
            # Remove None values
            update_data = {k: v for k, v in item_data.dict().items() if v is not None}
            
            response = supabase.table("items")\
                .update(update_data)\
                .eq("id", item_id)\
                .execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            raise Exception(f"Failed to update item: {e}")
    
    @staticmethod
    async def delete_item(item_id: int) -> bool:
        """Delete an item"""
        try:
            response = supabase.table("items").delete().eq("id", item_id).execute()
            return len(response.data) > 0
        except Exception as e:
            raise Exception(f"Failed to delete item: {e}")

inventory_service = InventoryService()
