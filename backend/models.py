from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class UserLogin(BaseModel):
    username: str
    password: str


class User(BaseModel):
    id: int
    username: str
    role: str
    token: Optional[str] = None


class Category(BaseModel):
    id: int
    name: str
    description: str


class CategoryCreate(BaseModel):
    name: str
    description: str


class Item(BaseModel):
    id: int
    name: str
    category_id: int
    stock_count: int
    price: float
    location: str
    velocity_status: str  # "fast" | "medium" | "slow"


class ItemCreate(BaseModel):
    name: str
    category_id: int
    stock_count: int
    price: float
    location: str
    velocity_status: str


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    stock_count: Optional[int] = None
    price: Optional[float] = None
    location: Optional[str] = None
    velocity_status: Optional[str] = None


# ── Audit Log ─────────────────────────────────────────────────────────────────

class AuditEntry(BaseModel):
    id: int
    timestamp: datetime
    action: str          # "create" | "update" | "delete"
    entity: str          # "item" | "category" | ...
    entity_id: int
    entity_name: str
    username: str
    before: Optional[Any] = None   # snapshot before change
    after: Optional[Any] = None    # snapshot after change
    meta: Optional[str] = None     # extra human-readable note
