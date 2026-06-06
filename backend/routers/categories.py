from fastapi import APIRouter
from typing import List
from models import Category, CategoryCreate
from database import categories

router = APIRouter()


@router.get("/", response_model=List[Category])
def list_categories():
    return categories


@router.post("/", response_model=Category)
def create_category(payload: CategoryCreate):
    new_id = max((c.id for c in categories), default=0) + 1
    category = Category(id=new_id, name=payload.name, description=payload.description)
    categories.append(category)
    return category
