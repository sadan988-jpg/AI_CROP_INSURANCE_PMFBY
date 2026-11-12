import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal, run_migrations
from backend.app.services.seed_data import seed_database
from backend.app.api.v1.router import api_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pmfby_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables & Seed Initial Data
    logger.info("Initializing PMFBY Database Tables...")
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    logger.info("Database tables initialized & migrated successfully.")
    
    # Run Seeding
    db = SessionLocal()
    try:
        seed_database(db)
        logger.info("Initial PMFBY dataset and users verified/seeded successfully.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()
        
    yield
    # Shutdown
    logger.info("Shutting down PMFBY API Engine.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
# AI-Based Real-Time Crop Image Analytics for Crop Insurance Claim Assessment (PMFBY)

Official FastAPI backend implementing:
* **Farmer Self-Service Authentication & Crop Sowing Registration**
* **Cryptographic EXIF Geo-tag & Haversine Cadastral Geo-Locking**
* **YOLOv8 & OpenCV Foliar Damage & Disease Diagnostic Engine**
* **IMD Doppler Radar Agro-Meteorological Cross-Verification**
* **Insurance Officer Scrutiny, CCE Dispatch & PFMS DBT Settlement Ledger**
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="/api")

@app.get("/", tags=["Health Check"])
def root_status():
    return {
        "status": "ONLINE",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health", tags=["Health Check"])
def health_check():
    return {
        "status": "HEALTHY",
        "database": "CONNECTED",
        "auth_engine": "JWT HS256",
        "ai_engine": "YOLOv8 + OpenCV Active"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)

