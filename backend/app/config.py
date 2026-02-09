from pydantic_settings import BaseSettings
from typing import Optional


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

    # Production flag
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
