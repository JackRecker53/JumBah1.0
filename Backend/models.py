from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, DateTime, Text
from database import Base


class Score(Base):
    __tablename__ = 'score'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    username = Column(String(80), nullable=False)
    score = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)


class ChatSession(Base):
    __tablename__ = 'chat_session'

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), unique=True, nullable=False)
    user_id = Column(Integer, nullable=True)
    messages = Column(Text, default='[]')
    created_at = Column(DateTime, default=datetime.utcnow)
    last_activity = Column(DateTime, default=datetime.utcnow)

    def append_messages(self, new_messages):
        data = json.loads(self.messages or '[]')
        data.extend(new_messages)
        self.messages = json.dumps(data)
