import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users, items, categories, audit, events

app = FastAPI(
    title="MartFlow Inventory API",
    description="Inventory & Asset Management — with audit logging and real-time alerts",
    version="2.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow localhost in dev + any origins set via ALLOWED_ORIGINS env var in prod.
_env_origins = os.getenv("ALLOWED_ORIGINS", "")
_extra = [o.strip() for o in _env_origins.split(",") if o.strip()]

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
] + _extra

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
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
        "status":        "healthy",
        "items_count":   len(_items),
        "audit_entries": len(audit_service.get_log(limit=500)),
    }
