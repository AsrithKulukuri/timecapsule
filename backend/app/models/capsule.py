from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    capsules = relationship("Capsule", back_populates="owner")


class Capsule(Base):
    __tablename__ = "capsules"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    message = Column(Text)
    unlock_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_opened = Column(Boolean, default=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="capsules")
    media = relationship("Media", back_populates="capsule")


class Media(Base):
    __tablename__ = "media"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String)
    capsule_id = Column(Integer, ForeignKey("capsules.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    capsule = relationship("Capsule", back_populates="media")
