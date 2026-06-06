from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, items, categories, audit, events

app = FastAPI(
    title="MartFlow Inventory API",
    description="Inventory & Asset Management — with audit logging and real-time alerts",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router,      prefix="/users",      tags=["users"])
app.include_router(items.router,      prefix="/items",      tags=["items"])
app.include_router(categories.router, prefix="/categories", tags=["categories"])
app.include_router(audit.router,      prefix="/audit",      tags=["audit"])
app.include_router(events.router,     prefix="/events",     tags=["events"])


@app.get("/", tags=["health"])
def root():
    return {"message": "MartFlow API is running", "version": "2.0.0"}


@app.get("/health", tags=["health"])
def health():
    from database import items as _items
    import audit as audit_service
    return {
        "status":       "healthy",
        "items_count":  len(_items),
        "audit_entries": len(audit_service.get_log(limit=500)),
    }
