from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.Api.v1.endpoints import items, categories
from src.Core.config import settings

app = FastAPI(
    title="MartFlow Inventory API",
    description="Inventory Management System API with Supabase",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(items.router, prefix="/api/v1")
app.include_router(categories.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "name": "MartFlow Inventory API",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.ENVIRONMENT
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "supabase": "connected"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
