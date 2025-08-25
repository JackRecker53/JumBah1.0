import json
from typing import List, Dict
from sqlalchemy.orm import Session
from models import ChatSession


def fetch_recent_history(
    db: Session, session_id: str, limit: int = 8
) -> List[Dict[str, str]]:
    """Return the most recent messages for a chat session."""
    chat_session = (
        db.query(ChatSession).filter_by(session_id=session_id).first()
    )
    if not chat_session or not chat_session.messages:
        return []
    messages = json.loads(chat_session.messages)
    return messages[-limit:]
