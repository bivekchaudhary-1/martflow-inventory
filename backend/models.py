from pydantic import BaseModel
from typing import Optional, Any, List
from datetime import datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: int
    username: str
    role: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    token: Optional[str] = None


# ── Category ──────────────────────────────────────────────────────────────────

class Category(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#6366f1"
    icon: Optional[str] = "box"

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#6366f1"
    icon: Optional[str] = "box"


# ── Location ──────────────────────────────────────────────────────────────────

class Location(BaseModel):
    id: int
    name: str
    type: str = "shelf"          # warehouse | shelf | zone
    address: Optional[str] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    is_active: bool = True

class LocationCreate(BaseModel):
    name: str
    type: str = "shelf"
    address: Optional[str] = None
    capacity: Optional[int] = None
    description: Optional[str] = None

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


# ── Supplier ──────────────────────────────────────────────────────────────────

class Supplier(BaseModel):
    id: int
    name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True

class SupplierCreate(BaseModel):
    name: str
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


# ── Item ──────────────────────────────────────────────────────────────────────

class Item(BaseModel):
    id: int
    name: str
    sku: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    location_id: Optional[int] = None
    supplier_id: Optional[int] = None
    stock_count: int = 0
    min_stock: int = 10
    max_stock: Optional[int] = None
    unit_price: float = 0.0
    cost_price: Optional[float] = None
    unit: str = "pcs"
    velocity_status: str = "medium"   # fast | medium | slow
    is_active: bool = True
    notes: Optional[str] = None
    # Denormalized join fields (populated when reading)
    category_name: Optional[str] = None
    location_name: Optional[str] = None
    supplier_name: Optional[str] = None

class ItemCreate(BaseModel):
    name: str
    sku: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    location_id: Optional[int] = None
    supplier_id: Optional[int] = None
    stock_count: int = 0
    min_stock: int = 10
    max_stock: Optional[int] = None
    unit_price: float = 0.0
    cost_price: Optional[float] = None
    unit: str = "pcs"
    velocity_status: str = "medium"
    notes: Optional[str] = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    location_id: Optional[int] = None
    supplier_id: Optional[int] = None
    stock_count: Optional[int] = None
    min_stock: Optional[int] = None
    max_stock: Optional[int] = None
    unit_price: Optional[float] = None
    cost_price: Optional[float] = None
    unit: Optional[str] = None
    velocity_status: Optional[str] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


# ── Stock Transaction ─────────────────────────────────────────────────────────

class StockTransaction(BaseModel):
    id: int
    item_id: int
    type: str                       # in | out | adjustment | transfer
    quantity: int
    quantity_before: int
    quantity_after: int
    reason: Optional[str] = None
    reference: Optional[str] = None
    performed_by: Optional[str] = None
    created_at: datetime = None
    # Denormalized
    item_name: Optional[str] = None

class TransactionCreate(BaseModel):
    item_id: int
    type: str
    quantity: int
    quantity_before: int
    quantity_after: int
    reason: Optional[str] = None
    reference: Optional[str] = None


# ── Alert ─────────────────────────────────────────────────────────────────────

class Alert(BaseModel):
    id: int
    type: str                       # low_stock | out_of_stock | overstock
    item_id: int
    item_name: str
    message: str
    stock_count: Optional[int] = None
    threshold: Optional[int] = None
    is_acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    created_at: datetime = None
    # Denormalized
    location_name: Optional[str] = None
    category_name: Optional[str] = None


# ── Purchase Order ────────────────────────────────────────────────────────────

class PurchaseOrderItem(BaseModel):
    id: int
    po_id: int
    item_id: int
    quantity: int
    unit_cost: float
    received: int = 0
    notes: Optional[str] = None
    # Denormalized
    item_name: Optional[str] = None
    item_sku: Optional[str] = None

class PurchaseOrder(BaseModel):
    id: int
    po_number: str
    supplier_id: Optional[int] = None
    status: str = "draft"           # draft | sent | received | cancelled
    notes: Optional[str] = None
    expected_date: Optional[str] = None
    received_date: Optional[str] = None
    created_at: datetime = None
    # Denormalized
    supplier_name: Optional[str] = None
    purchase_order_items: Optional[List[PurchaseOrderItem]] = []

class POCreate(BaseModel):
    supplier_id: Optional[int] = None
    notes: Optional[str] = None
    expected_date: Optional[str] = None

class POItemCreate(BaseModel):
    item_id: int
    quantity: int
    unit_cost: float
    notes: Optional[str] = None


# ── Audit Log ─────────────────────────────────────────────────────────────────

class AuditEntry(BaseModel):
    id: int
    timestamp: datetime
    action: str          # create | update | delete
    entity: str          # item | category | location | supplier
    entity_id: int
    entity_name: str
    username: str
    before: Optional[Any] = None
    after: Optional[Any] = None
    meta: Optional[str] = None
