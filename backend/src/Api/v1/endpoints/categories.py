from fastapi import APIRouter, HTTPException
from src.Schemas.models import CategoryCreate, CategoryResponse
from src.Services.category_service import category_service

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=list[CategoryResponse])
async def get_categories():
    """Get all categories"""
    categories = await category_service.get_all_categories()
    return categories

@router.post("/", response_model=CategoryResponse, status_code=201)
async def create_category(category: CategoryCreate):
    """Create a new category"""
    try:
        new_category = await category_service.create_category(category)
        return new_category
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
