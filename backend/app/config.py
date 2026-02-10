from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str  # anon/public key
    SUPABASE_SERVICE_KEY: str  # service role key for admin operations

    # JWT
    SUPABASE_JWT_SECRET: str  # from Supabase project settings
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Storage
    STORAGE_BUCKET: str = "capsule-media"
    MAX_FILE_SIZE: int = 52428800  # 50MB in bytes

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # Email (SendGrid)
    SENDGRID_API_KEY: Optional[str] = None
    SENDGRID_FROM: Optional[str] = None

    # Notifications
    NOTIFY_SECRET: str = "change-me"
    NOTIFY_WINDOW_HOURS: int = 24

    # Production flag
    ENVIRONMENT: str = "development"

    class Config:
        # Look for .env file in the backend directory
        env_file = Path(__file__).parent.parent / ".env"
        env_file_encoding = "utf-8"


settings = Settings()
