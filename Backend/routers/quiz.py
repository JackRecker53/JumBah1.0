from datetime import datetime
from typing import Dict, List

from fastapi import APIRouter, Depends

from ..auth import verify_token
from ..models import ScoreSubmission
from .auth import user_scores

router = APIRouter()

quiz_questions = [
    {
        "question": "What is the capital of Sabah?",
        "answers": ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu"],
        "correctAnswer": "Kota Kinabalu",
    },
    {
        "question": "Which mountain is the highest in Malaysia?",
        "answers": ["Mount Trusmadi", "Mount Kinabalu", "Mount Tambuyukon", "Mount Murud"],
        "correctAnswer": "Mount Kinabalu",
    },
    {
        "question": "What is the famous island in Sabah known for diving?",
        "answers": ["Sipadan Island", "Lankayan Island", "Mabul Island", "Mataking Island"],
        "correctAnswer": "Sipadan Island",
    },
    {
        "question": "What is the traditional harvest festival of Sabah called?",
        "answers": ["Hari Raya", "Chinese New Year", "Tadau Kaamatan", "Deepavali"],
        "correctAnswer": "Tadau Kaamatan",
    },
    {
        "question": "Which wildlife is Sabah famous for protecting?",
        "answers": ["Tigers", "Orangutans", "Elephants", "Pandas"],
        "correctAnswer": "Orangutans",
    },
]


@router.get("/quiz")
async def get_quiz():
    return {"questions": quiz_questions}


@router.post("/scores")
async def submit_score(score_data: ScoreSubmission, current_user: dict = Depends(verify_token)):
    user_id = current_user["user_id"]

    if user_id not in user_scores:
        user_scores[user_id] = []

    user_scores[user_id].append(
        {
            "score": score_data.score,
            "timestamp": datetime.now().isoformat(),
            "username": current_user["username"],
        }
    )

    return {"message": "Score submitted successfully", "score": score_data.score}


@router.get("/leaderboard")
async def get_leaderboard():
    leaderboard: List[Dict[str, int]] = []

    for user_id, scores in user_scores.items():
        if scores:
            max_score = max(score["score"] for score in scores)
            username = scores[0]["username"]
            leaderboard.append({"username": username, "score": max_score})

    leaderboard.sort(key=lambda x: x["score"], reverse=True)
    return leaderboard[:10]
