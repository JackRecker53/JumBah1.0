from datetime import datetime
import uuid
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException

from ..auth import create_access_token, hash_password, verify_password, verify_token
from ..models import UserLogin, UserRegister

router = APIRouter()

# In-memory storage for demonstration purposes
users_db: Dict[str, Dict[str, Any]] = {}
user_scores: Dict[str, List[Dict[str, Any]]] = {}


@router.post("/register")
async def register(user_data: UserRegister):
    if user_data.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")

    hashed_password = hash_password(user_data.password)
    user_id = str(uuid.uuid4())

    users_db[user_data.username] = {
        "user_id": user_id,
        "username": user_data.username,
        "password": hashed_password,
        "created_at": datetime.now().isoformat(),
    }

    user_scores[user_id] = []

    return {"message": "User registered successfully", "user_id": user_id}


@router.post("/login")
async def login(user_data: UserLogin):
    user = users_db.get(user_data.username)
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    access_token = create_access_token({"username": user["username"], "user_id": user["user_id"]})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"username": user["username"], "user_id": user["user_id"]},
    }


@router.get("/profile")
async def get_profile(current_user: dict = Depends(verify_token)):
    return {
        "username": current_user["username"],
        "user_id": current_user["user_id"],
        "message": "Profile retrieved successfully",
    }
