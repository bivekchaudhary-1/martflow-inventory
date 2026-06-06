from src.Core.supabase_client import supabase
from src.Schemas.models import CategoryCreate
from typing import List, Dict, Any

class CategoryService:
    
    @staticmethod
    async def get_all_categories() -> List[Dict[str, Any]]:
        """Fetch all categories from Supabase"""
        try:
            response = supabase.table("categories").select("*").execute()
            return response.data
        except Exception as e:
            print(f"Error fetching categories: {e}")
            return []
    
    @staticmethod
    async def create_category(category_data: CategoryCreate) -> Dict[str, Any]:
        """Create a new category"""
        try:
            response = supabase.table("categories").insert(category_data.dict()).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            raise Exception(f"Failed to create category: {e}")

category_service = CategoryService()
