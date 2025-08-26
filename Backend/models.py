from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, nullable=False)
    password = Column(String(120), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    scores = relationship("Score", back_populates="user", cascade="all, delete-orphan")


class Score(Base):
    __tablename__ = "score"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    score = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="scores")
