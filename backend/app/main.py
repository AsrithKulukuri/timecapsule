from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, capsules, media
from app.config import settings
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
allowed_origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
]

if settings.ENVIRONMENT == "production":
    # Add your production frontend URL
    allowed_origins = [settings.FRONTEND_URL]

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


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Time Capsule API shutting down...")
