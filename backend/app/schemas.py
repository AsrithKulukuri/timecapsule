from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# Auth Schemas
class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    username: str = Field(..., min_length=3, max_length=50)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


# Capsule Schemas
class CapsuleCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    unlock_date: datetime
    is_group: bool = False
    group_members: Optional[List[str]] = []  # List of user IDs


class CapsuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    unlock_date: Optional[datetime] = None


class MediaItem(BaseModel):
    id: str
    filename: str
    file_type: str
    file_url: Optional[str] = None
    uploaded_at: datetime


class CapsuleResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    unlock_date: datetime
    created_at: datetime
    is_unlocked: bool
    is_group: bool
    owner_id: str
    media: List[MediaItem] = []

    class Config:
        from_attributes = True


# Media Schemas
class MediaUploadResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_url: str
    capsule_id: str
