from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import declarative_base, relationship

# SQLAlchemy ORM base
Base = declarative_base()


class User(Base):
    """ORM model for application users."""

    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scores = relationship("Score", back_populates="user")


class ChatHistory(Base):
    """ORM model storing chat messages."""

    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True, nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Score(Base):
    """ORM model for quiz scores."""

    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scores")


# Pydantic models
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    username: str
    password: str


class ChatMessage(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: datetime
    context: Optional[Dict[str, Any]] = None


class ChatSession(BaseModel):
    session_id: str
    messages: List[Dict[str, Any]]
    created_at: datetime
    last_activity: datetime


class ScoreSubmission(BaseModel):
    score: int = Field(..., ge=0, le=100)


class TravelRecommendationRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    interests: Optional[List[str]] = []
    budget: Optional[str] = None
    duration: Optional[str] = None


class ItineraryRequest(BaseModel):
    duration: str = Field(..., min_length=1)
    budget: str = Field(..., min_length=1)
    interests: List[str] = Field(..., min_items=1)
    accommodation: str
    group_size: int = Field(..., gt=0)


class FlightRequest(BaseModel):
    origin: str = Field(..., min_length=1)
    departure_date: str
    return_date: Optional[str] = None
    passengers: int = Field(default=1, gt=0)
    flight_class: str = Field(default="economy")
