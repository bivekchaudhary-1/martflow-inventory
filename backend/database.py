from models import User, Category, Item

# JWT config
SECRET_KEY = "martflow-secret-key-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# ── In-memory data store ─────────────────────────────────────────────────────

users = [
    User(id=1, username="admin",   role="admin"),
    User(id=2, username="manager", role="manager"),
    User(id=3, username="staff",   role="staff"),
]

categories = [
    Category(id=1, name="Electronics",     description="Electronic devices and components"),
    Category(id=2, name="Office Supplies", description="Stationery and office equipment"),
    Category(id=3, name="Furniture",       description="Desks, chairs, and storage"),
    Category(id=4, name="Networking",      description="Cables, switches, and routers"),
    Category(id=5, name="Peripherals",     description="Keyboards, mice, monitors"),
]

items = [
    Item(id=1,  name='MacBook Pro 14"',      category_id=1, stock_count=12,  price=1999.99, location="Warehouse A", velocity_status="fast"),
    Item(id=2,  name='Dell Monitor 27"',     category_id=5, stock_count=8,   price=349.99,  location="Warehouse B", velocity_status="medium"),
    Item(id=3,  name="Logitech MX Keys",     category_id=5, stock_count=25,  price=99.99,   location="Shelf C-2",   velocity_status="fast"),
    Item(id=4,  name="Ergonomic Chair",      category_id=3, stock_count=5,   price=499.99,  location="Warehouse A", velocity_status="slow"),
    Item(id=5,  name="Standing Desk",        category_id=3, stock_count=3,   price=799.99,  location="Warehouse A", velocity_status="slow"),
    Item(id=6,  name="USB-C Hub 7-in-1",     category_id=4, stock_count=40,  price=49.99,   location="Shelf A-1",   velocity_status="fast"),
    Item(id=7,  name="Ethernet Cable 10m",   category_id=4, stock_count=60,  price=12.99,   location="Shelf A-3",   velocity_status="medium"),
    Item(id=8,  name="A4 Paper Ream",        category_id=2, stock_count=200, price=8.99,    location="Shelf B-1",   velocity_status="fast"),
    Item(id=9,  name="Whiteboard Markers",   category_id=2, stock_count=7,   price=5.99,    location="Shelf B-2",   velocity_status="medium"),
    Item(id=10, name="Cisco Switch 24-port", category_id=4, stock_count=4,   price=899.99,  location="Warehouse B", velocity_status="slow"),
    Item(id=11, name='iPad Pro 12.9"',       category_id=1, stock_count=9,   price=1099.99, location="Warehouse A", velocity_status="medium"),
    Item(id=12, name="Webcam 4K",            category_id=5, stock_count=15,  price=149.99,  location="Shelf C-1",   velocity_status="fast"),
    Item(id=13, name="Wireless Mouse",       category_id=5, stock_count=30,  price=39.99,   location="Shelf C-2",   velocity_status="fast"),
    Item(id=14, name="Filing Cabinet",       category_id=3, stock_count=6,   price=249.99,  location="Warehouse B", velocity_status="slow"),
    Item(id=15, name="Raspberry Pi 4",       category_id=1, stock_count=2,   price=75.00,   location="Shelf A-2",   velocity_status="medium"),
    Item(id=16, name="HDMI Cable 2m",        category_id=4, stock_count=55,  price=9.99,    location="Shelf A-3",   velocity_status="fast"),
    Item(id=17, name="Stapler Heavy Duty",   category_id=2, stock_count=18,  price=24.99,   location="Shelf B-2",   velocity_status="slow"),
    Item(id=18, name="Laptop Stand",         category_id=5, stock_count=22,  price=59.99,   location="Shelf C-1",   velocity_status="medium"),
    Item(id=19, name="External SSD 1TB",     category_id=1, stock_count=11,  price=129.99,  location="Shelf A-2",   velocity_status="fast"),
    Item(id=20, name="Power Strip 6-outlet", category_id=4, stock_count=35,  price=29.99,   location="Shelf B-3",   velocity_status="medium"),
]

# ── Helpers ──────────────────────────────────────────────────────────────────

def get_user_by_username(username: str):
    return next((u for u in users if u.username == username), None)

def get_item_by_id(item_id: int):
    return next((i for i in items if i.id == item_id), None)
