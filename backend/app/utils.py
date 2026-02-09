from datetime import datetime
from typing import Optional
import os
import uuid


def generate_unique_filename(original_filename: str) -> str:
    """Generate a unique filename using UUID"""
    ext = os.path.splitext(original_filename)[1]
    return f"{uuid.uuid4()}{ext}"


def is_future_date(date: datetime) -> bool:
    """Check if the given date is in the future"""
    return date > datetime.utcnow()


def format_datetime(dt: Optional[datetime]) -> Optional[str]:
    """Format datetime to ISO string"""
    if dt:
        return dt.isoformat()
    return None
