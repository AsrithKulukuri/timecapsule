from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, capsules, media, notify
from .config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Time Capsule API",
    description="API for creating and managing digital time capsules",
    version="1.0.0"
)

# CORS middleware - configure for production


def _parse_origins(value: str) -> list[str]:
    return [
        origin.strip().rstrip("/")
        for origin in value.split(",")
        if origin.strip()
    ]


allowed_origins = _parse_origins(settings.FRONTEND_URL)

if settings.ENVIRONMENT != "production":
    allowed_origins.extend([
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
    ])

# De-duplicate while preserving order
allowed_origins = list(dict.fromkeys(allowed_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(capsules.router, prefix="/api/capsules", tags=["Capsules"])
app.include_router(media.router, prefix="/api/media", tags=["Media"])
app.include_router(notify.router, prefix="/api/notify", tags=["Notifications"])


@app.get("/")
async def root():
    return {
        "message": "Time Capsule API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy", "environment": settings.ENVIRONMENT}


@app.on_event("startup")
async def startup_event():
    logger.info("Time Capsule API starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Frontend URL: {settings.FRONTEND_URL}")
    logger.info(f"Storage Bucket: {settings.STORAGE_BUCKET}")
    logger.info(f"Allowed CORS origins: {allowed_origins}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Time Capsule API shutting down...")
