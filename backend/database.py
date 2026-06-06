"""
MartFlow — In-memory data store
Mirrors the Supabase schema so the FastAPI backend works as a full offline fallback.
All data is seeded to match the frontend mockData.js exactly.
"""

from datetime import datetime, timezone
from models import (
    User, Category, Location, Supplier,
    Item, StockTransaction, Alert, PurchaseOrder, PurchaseOrderItem,
)

# ── JWT config ────────────────────────────────────────────────────────────────
SECRET_KEY = "martflow-secret-key-2024"
ALGORITHM  = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24   # 24 hours


# ════════════════════════════════════════════════════════════════════════════════
# SEED DATA
# ════════════════════════════════════════════════════════════════════════════════

users: list[User] = [
    User(id=1, username="admin",   role="admin",   email="admin@martflow.com",   full_name="Admin User"),
    User(id=2, username="manager", role="manager", email="manager@martflow.com", full_name="Jane Manager"),
    User(id=3, username="staff",   role="staff",   email="staff@martflow.com",   full_name="Bob Staff"),
]

categories: list[Category] = [
    Category(id=1, name="Electronics",     description="Electronic devices and components", color="#6366f1", icon="cpu"),
    Category(id=2, name="Office Supplies", description="Stationery and office equipment",   color="#10b981", icon="pencil"),
    Category(id=3, name="Furniture",       description="Desks, chairs, and storage",        color="#f59e0b", icon="armchair"),
    Category(id=4, name="Networking",      description="Cables, switches, and routers",     color="#3b82f6", icon="wifi"),
    Category(id=5, name="Peripherals",     description="Keyboards, mice, monitors",         color="#ec4899", icon="monitor"),
]

locations: list[Location] = [
    Location(id=1,  name="Warehouse A", type="warehouse", address="Building 1, North Wing",   capacity=5000, description="Main storage warehouse"),
    Location(id=2,  name="Warehouse B", type="warehouse", address="Building 2, South Wing",   capacity=3000, description="Secondary warehouse"),
    Location(id=3,  name="Shelf A-1",   type="shelf",     address="Warehouse A, Aisle 1",     capacity=200,  description="Small electronics"),
    Location(id=4,  name="Shelf A-2",   type="shelf",     address="Warehouse A, Aisle 2",     capacity=200,  description="Computers & SBCs"),
    Location(id=5,  name="Shelf A-3",   type="shelf",     address="Warehouse A, Aisle 3",     capacity=300,  description="Cables & networking"),
    Location(id=6,  name="Shelf B-1",   type="shelf",     address="Warehouse B, Aisle 1",     capacity=400,  description="Paper & consumables"),
    Location(id=7,  name="Shelf B-2",   type="shelf",     address="Warehouse B, Aisle 2",     capacity=200,  description="Stationery"),
    Location(id=8,  name="Shelf B-3",   type="shelf",     address="Warehouse B, Aisle 3",     capacity=300,  description="Power & accessories"),
    Location(id=9,  name="Shelf C-1",   type="shelf",     address="Warehouse A, Aisle C-1",   capacity=150,  description="AV & cameras"),
    Location(id=10, name="Shelf C-2",   type="shelf",     address="Warehouse A, Aisle C-2",   capacity=250,  description="Peripherals"),
]

suppliers: list[Supplier] = [
    Supplier(id=1, name="Apple Distribution Ltd.",  contact_name="John Smith",  email="john@appledist.com",     phone="+1-800-275-2273", website="https://apple.com"),
    Supplier(id=2, name="Dell Technologies",        contact_name="Sara Lee",    email="sara.lee@dell.com",      phone="+1-800-289-3355", website="https://dell.com"),
    Supplier(id=3, name="Logitech B2B",             contact_name="Mike Torres", email="mike@logitech.com",      phone="+1-510-713-4000", website="https://logitech.com"),
    Supplier(id=4, name="IKEA Business",            contact_name="Anna Berg",   email="anna@ikea.com",          phone="+46-476-35000",   website="https://ikea.com/business"),
    Supplier(id=5, name="Cisco Systems",            contact_name="Ray Nguyen",  email="ray.nguyen@cisco.com",   phone="+1-408-526-4000", website="https://cisco.com"),
    Supplier(id=6, name="Officeworks Trade",        contact_name="Claire Wu",   email="claire@officeworks.com", phone="+61-3-8831-9000"),
    Supplier(id=7, name="Raspberry Pi Foundation",  contact_name="Dr. Jo Hall", email="jo@raspberrypi.org",     phone="+44-1223-644-720", website="https://raspberrypi.org"),
    Supplier(id=8, name="Samsung Electronics",      contact_name="David Kim",   email="dkim@samsung.com",       phone="+82-2-2255-0114",  website="https://samsung.com"),
]

items: list[Item] = [
    Item(id=1,  name='MacBook Pro 14"',      sku="SKU-001", category_id=1, location_id=1,  supplier_id=1, stock_count=12,  min_stock=5,  unit_price=1999.99, cost_price=1600.00, velocity_status="fast",   unit="pcs", category_name="Electronics",     location_name="Warehouse A", supplier_name="Apple Distribution Ltd."),
    Item(id=2,  name='Dell Monitor 27"',     sku="SKU-002", category_id=5, location_id=2,  supplier_id=2, stock_count=8,   min_stock=5,  unit_price=349.99,  cost_price=280.00,  velocity_status="medium", unit="pcs", category_name="Peripherals",     location_name="Warehouse B", supplier_name="Dell Technologies"),
    Item(id=3,  name="Logitech MX Keys",     sku="SKU-003", category_id=5, location_id=10, supplier_id=3, stock_count=25,  min_stock=10, unit_price=99.99,   cost_price=70.00,   velocity_status="fast",   unit="pcs", category_name="Peripherals",     location_name="Shelf C-2",   supplier_name="Logitech B2B"),
    Item(id=4,  name="Ergonomic Chair",      sku="SKU-004", category_id=3, location_id=1,  supplier_id=4, stock_count=5,   min_stock=3,  unit_price=499.99,  cost_price=350.00,  velocity_status="slow",   unit="pcs", category_name="Furniture",       location_name="Warehouse A", supplier_name="IKEA Business"),
    Item(id=5,  name="Standing Desk",        sku="SKU-005", category_id=3, location_id=1,  supplier_id=4, stock_count=3,   min_stock=2,  unit_price=799.99,  cost_price=600.00,  velocity_status="slow",   unit="pcs", category_name="Furniture",       location_name="Warehouse A", supplier_name="IKEA Business"),
    Item(id=6,  name="USB-C Hub 7-in-1",     sku="SKU-006", category_id=4, location_id=3,  supplier_id=1, stock_count=40,  min_stock=15, unit_price=49.99,   cost_price=25.00,   velocity_status="fast",   unit="pcs", category_name="Networking",      location_name="Shelf A-1",   supplier_name="Apple Distribution Ltd."),
    Item(id=7,  name="Ethernet Cable 10m",   sku="SKU-007", category_id=4, location_id=5,  supplier_id=5, stock_count=60,  min_stock=20, unit_price=12.99,   cost_price=5.00,    velocity_status="medium", unit="pcs", category_name="Networking",      location_name="Shelf A-3",   supplier_name="Cisco Systems"),
    Item(id=8,  name="A4 Paper Ream",        sku="SKU-008", category_id=2, location_id=6,  supplier_id=6, stock_count=200, min_stock=50, unit_price=8.99,    cost_price=5.00,    velocity_status="fast",   unit="ream",category_name="Office Supplies", location_name="Shelf B-1",   supplier_name="Officeworks Trade"),
    Item(id=9,  name="Whiteboard Markers",   sku="SKU-009", category_id=2, location_id=7,  supplier_id=6, stock_count=7,   min_stock=10, unit_price=5.99,    cost_price=2.50,    velocity_status="medium", unit="set", category_name="Office Supplies", location_name="Shelf B-2",   supplier_name="Officeworks Trade"),
    Item(id=10, name="Cisco Switch 24-port", sku="SKU-010", category_id=4, location_id=2,  supplier_id=5, stock_count=4,   min_stock=2,  unit_price=899.99,  cost_price=700.00,  velocity_status="slow",   unit="pcs", category_name="Networking",      location_name="Warehouse B", supplier_name="Cisco Systems"),
    Item(id=11, name='iPad Pro 12.9"',       sku="SKU-011", category_id=1, location_id=1,  supplier_id=1, stock_count=9,   min_stock=5,  unit_price=1099.99, cost_price=850.00,  velocity_status="medium", unit="pcs", category_name="Electronics",     location_name="Warehouse A", supplier_name="Apple Distribution Ltd."),
    Item(id=12, name="Webcam 4K",            sku="SKU-012", category_id=5, location_id=9,  supplier_id=2, stock_count=15,  min_stock=8,  unit_price=149.99,  cost_price=95.00,   velocity_status="fast",   unit="pcs", category_name="Peripherals",     location_name="Shelf C-1",   supplier_name="Dell Technologies"),
    Item(id=13, name="Wireless Mouse",       sku="SKU-013", category_id=5, location_id=10, supplier_id=3, stock_count=30,  min_stock=10, unit_price=39.99,   cost_price=18.00,   velocity_status="fast",   unit="pcs", category_name="Peripherals",     location_name="Shelf C-2",   supplier_name="Logitech B2B"),
    Item(id=14, name="Filing Cabinet",       sku="SKU-014", category_id=3, location_id=2,  supplier_id=4, stock_count=6,   min_stock=3,  unit_price=249.99,  cost_price=180.00,  velocity_status="slow",   unit="pcs", category_name="Furniture",       location_name="Warehouse B", supplier_name="IKEA Business"),
    Item(id=15, name="Raspberry Pi 4",       sku="SKU-015", category_id=1, location_id=4,  supplier_id=7, stock_count=2,   min_stock=5,  unit_price=75.00,   cost_price=52.00,   velocity_status="medium", unit="pcs", category_name="Electronics",     location_name="Shelf A-2",   supplier_name="Raspberry Pi Foundation"),
    Item(id=16, name="HDMI Cable 2m",        sku="SKU-016", category_id=4, location_id=5,  supplier_id=2, stock_count=55,  min_stock=20, unit_price=9.99,    cost_price=3.50,    velocity_status="fast",   unit="pcs", category_name="Networking",      location_name="Shelf A-3",   supplier_name="Dell Technologies"),
    Item(id=17, name="Stapler Heavy Duty",   sku="SKU-017", category_id=2, location_id=7,  supplier_id=6, stock_count=18,  min_stock=5,  unit_price=24.99,   cost_price=12.00,   velocity_status="slow",   unit="pcs", category_name="Office Supplies", location_name="Shelf B-2",   supplier_name="Officeworks Trade"),
    Item(id=18, name="Laptop Stand",         sku="SKU-018", category_id=5, location_id=9,  supplier_id=3, stock_count=22,  min_stock=10, unit_price=59.99,   cost_price=32.00,   velocity_status="medium", unit="pcs", category_name="Peripherals",     location_name="Shelf C-1",   supplier_name="Logitech B2B"),
    Item(id=19, name="External SSD 1TB",     sku="SKU-019", category_id=1, location_id=4,  supplier_id=8, stock_count=11,  min_stock=5,  unit_price=129.99,  cost_price=85.00,   velocity_status="fast",   unit="pcs", category_name="Electronics",     location_name="Shelf A-2",   supplier_name="Samsung Electronics"),
    Item(id=20, name="Power Strip 6-outlet", sku="SKU-020", category_id=4, location_id=8,  supplier_id=2, stock_count=35,  min_stock=10, unit_price=29.99,   cost_price=14.00,   velocity_status="medium", unit="pcs", category_name="Networking",      location_name="Shelf B-3",   supplier_name="Dell Technologies"),
]

# Seed some stock transactions
_now = datetime.now(timezone.utc)
transactions: list[StockTransaction] = [
    StockTransaction(id=1, item_id=1,  type="in",         quantity=5,  quantity_before=7,   quantity_after=12,  reason="PO receipt",         performed_by="admin",   created_at=_now, item_name='MacBook Pro 14"'),
    StockTransaction(id=2, item_id=8,  type="in",         quantity=50, quantity_before=150, quantity_after=200, reason="Bulk restocking",    performed_by="manager", created_at=_now, item_name="A4 Paper Ream"),
    StockTransaction(id=3, item_id=9,  type="out",        quantity=3,  quantity_before=10,  quantity_after=7,   reason="Issued to accounts", performed_by="staff",   created_at=_now, item_name="Whiteboard Markers"),
    StockTransaction(id=4, item_id=15, type="adjustment", quantity=2,  quantity_before=4,   quantity_after=2,   reason="Damaged units found",performed_by="manager", created_at=_now, item_name="Raspberry Pi 4"),
    StockTransaction(id=5, item_id=6,  type="in",         quantity=10, quantity_before=30,  quantity_after=40,  reason="PO receipt",         performed_by="admin",   created_at=_now, item_name="USB-C Hub 7-in-1"),
]

# Seed alerts for low-stock items
alerts: list[Alert] = [
    Alert(id=1, type="low_stock",   item_id=9,  item_name="Whiteboard Markers",  message="Whiteboard Markers is low on stock (7 remaining, min 10)", stock_count=7,  threshold=10, created_at=_now, location_name="Shelf B-2",   category_name="Office Supplies"),
    Alert(id=2, type="low_stock",   item_id=10, item_name="Cisco Switch 24-port",message="Cisco Switch 24-port is low on stock (4 remaining, min 2)", stock_count=4,  threshold=2,  created_at=_now, location_name="Warehouse B", category_name="Networking"),
    Alert(id=3, type="low_stock",   item_id=15, item_name="Raspberry Pi 4",      message="Raspberry Pi 4 is low on stock (2 remaining, min 5)",      stock_count=2,  threshold=5,  created_at=_now, location_name="Shelf A-2",   category_name="Electronics"),
    Alert(id=4, type="out_of_stock",item_id=5,  item_name="Standing Desk",       message="Standing Desk is low on stock (3 remaining, min 2)",       stock_count=3,  threshold=2,  created_at=_now, location_name="Warehouse A", category_name="Furniture"),
]

# Seed one draft purchase order
purchase_orders: list[PurchaseOrder] = [
    PurchaseOrder(
        id=1,
        po_number="PO-20260101-1000",
        supplier_id=1,
        status="draft",
        notes="Quarterly electronics restock",
        expected_date="2026-07-01",
        created_at=_now,
        supplier_name="Apple Distribution Ltd.",
        purchase_order_items=[
            PurchaseOrderItem(id=1, po_id=1, item_id=1,  quantity=10, unit_cost=1600.00, received=0, item_name='MacBook Pro 14"',  item_sku="SKU-001"),
            PurchaseOrderItem(id=2, po_id=1, item_id=11, quantity=5,  unit_cost=850.00,  received=0, item_name='iPad Pro 12.9"',   item_sku="SKU-011"),
            PurchaseOrderItem(id=3, po_id=1, item_id=15, quantity=20, unit_cost=52.00,   received=0, item_name="Raspberry Pi 4",   item_sku="SKU-015"),
        ]
    ),
]


# ════════════════════════════════════════════════════════════════════════════════
# HELPERS
# ════════════════════════════════════════════════════════════════════════════════

def get_user_by_username(username: str) -> User | None:
    return next((u for u in users if u.username == username), None)

def get_item_by_id(item_id: int) -> Item | None:
    return next((i for i in items if i.id == item_id), None)

def get_location_by_id(loc_id: int) -> Location | None:
    return next((l for l in locations if l.id == loc_id), None)

def get_supplier_by_id(sup_id: int) -> Supplier | None:
    return next((s for s in suppliers if s.id == sup_id), None)

def get_category_by_id(cat_id: int) -> Category | None:
    return next((c for c in categories if c.id == cat_id), None)

def get_po_by_id(po_id: int) -> PurchaseOrder | None:
    return next((p for p in purchase_orders if p.id == po_id), None)

def enrich_item(item: Item) -> Item:
    """Fill in denormalized name fields from related records."""
    cat = get_category_by_id(item.category_id) if item.category_id else None
    loc = get_location_by_id(item.location_id) if item.location_id else None
    sup = get_supplier_by_id(item.supplier_id) if item.supplier_id else None
    item.category_name = cat.name if cat else None
    item.location_name = loc.name if loc else None
    item.supplier_name = sup.name if sup else None
    return item
