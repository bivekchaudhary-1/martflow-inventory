from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

# ============ CATEGORY SCHEMAS ============
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, example="Electronics")
    description: Optional[str] = Field(None, example="Devices and gadgets")

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ ITEM SCHEMAS ============
class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, example="MacBook Pro")
    category_id: int = Field(..., example=1)
    stock_count: int = Field(..., ge=0, example=50)
    price: float = Field(..., ge=0, example=1299.99)
    location: Optional[str] = Field(None, example="Aisle A1")
    velocity_status: Optional[str] = Field("steady", pattern="^(fast|slow|steady)$")

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    stock_count: Optional[int] = Field(None, ge=0)
    price: Optional[float] = Field(None, ge=0)
    location: Optional[str] = None
    velocity_status: Optional[str] = None

class ItemResponse(ItemBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# ============ USER SCHEMAS ============
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    role: Optional[str] = "user"

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
