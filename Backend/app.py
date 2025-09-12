from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
import uuid
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
import google.generativeai as genai
import jwt
import requests
from bs4 import BeautifulSoup
import re

# Load environment variables
load_dotenv()

# Import routers
from Routers.translator import router as translator_router

# Initialize FastAPI app
app = FastAPI(
    title="JumBah AI Travel Chatbot",
    description="AI-powered chatbot for Sabah travel assistance using Gemini",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(translator_router, prefix="/api", tags=["translator"])

security = HTTPBearer()

# Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# In-memory storage (replace with database in production)
users_db: Dict[str, Dict[str, Any]] = {
    "jer@jumbah.com": {
        "user_id": "dummy-user-001",
        "username": "Adventure Seeker",
        "password": "jer@jumbah",
        "created_at": "2024-01-01T00:00:00"
    }
}
chat_sessions: Dict[str, List[Dict[str, Any]]] = {}
user_contexts: Dict[str, Dict[str, Any]] = {}
user_scores: Dict[str, List[Dict[str, Any]]] = {
    "dummy-user-001": []
}
# Game progression storage
user_game_progress: Dict[str, Dict[str, Any]] = {
    "dummy-user-001": {
        "points": 0,
        "completed_quests": [],
        "active_quests": [],
        "achievements": [],
        "collected_stamps": [],
        "quiz_scores": []
    }
}
# Map history storage
user_map_history: Dict[str, List[Dict[str, Any]]] = {
    "dummy-user-001": []
}
# AI planner prompt history storage
user_ai_history: Dict[str, List[Dict[str, Any]]] = {
    "dummy-user-001": []
}

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

class GameProgressUpdate(BaseModel):
    points: Optional[int] = None
    completed_quests: Optional[List[str]] = None
    active_quests: Optional[List[Dict[str, Any]]] = None
    achievements: Optional[List[str]] = None
    collected_stamps: Optional[List[str]] = None
    quiz_scores: Optional[List[int]] = None

class MapHistoryEntry(BaseModel):
    location: str
    coordinates: Optional[Dict[str, float]] = None
    timestamp: Optional[str] = None
    notes: Optional[str] = None

class AIPromptEntry(BaseModel):
    prompt: str
    response: str
    timestamp: Optional[str] = None
    category: Optional[str] = None

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

# Initialize Gemini AI
def get_gemini_model():
    """Configure and return Gemini model if key exists; else None."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")

def create_system_prompt():
    """Create a concise system prompt for the chatbot."""
    return """You are JumBah AI, a friendly Sabah travel assistant. 

IMPORTANT: Write like you're casually chatting with a friend. Never use bullet points, asterisks (*), or structured lists. Just write in natural paragraphs and sentences.

Help with Sabah attractions, food, activities, costs, and travel tips in a conversational way.

For non-Sabah topics, reply: "Sorry, I can only help with Sabah travel questions."""

def clean_ai_response(response_text: str) -> str:
    """Remove bullet points and structured formatting from AI response."""
    # Remove bullet points and asterisks at start of lines
    response_text = re.sub(r'^\s*[\*\-\•]\s*', '', response_text, flags=re.MULTILINE)
    response_text = re.sub(r'\*\*(.*?)\*\*', r'\1', response_text)  # Remove bold formatting
    return response_text.strip()

def build_conversation_context(session_id: str, new_message: str) -> str:
    """Build conversation context from chat history."""
    system_prompt = create_system_prompt()

    if session_id not in chat_sessions:
        return f"{system_prompt}\n\nUser: {new_message}"

    # Use only last 6 messages to keep context focused
    recent_messages = chat_sessions[session_id][-6:]

    conversation = f"{system_prompt}\n\n"
    for msg in recent_messages:
        role = "You" if msg["role"] == "assistant" else "User"
        conversation += f"{role}: {msg['content']}\n"

    conversation += f"\nUser: {new_message}"
    return conversation

# Utility functions
def create_access_token(data: dict):
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return user info."""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "user_id": payload.get("user_id")}
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_session_id():
    """Generate a unique session ID."""
    return str(uuid.uuid4())

def create_specialized_prompt(request_data: dict, prompt_type: str) -> str:
    """Create specialized prompts for different features."""
    if prompt_type == "itinerary":
        return f"""Create a detailed travel itinerary for Sabah, Malaysia with the following specifications:

Duration: {request_data.get('duration', 'not specified')}
Budget: MYR {request_data.get('budget', 'flexible')}
Interests: {', '.join(request_data.get('interests', ['general sightseeing']))}
Accommodation Style: {request_data.get('accommodation', 'mid-range')}
Group Size: {request_data.get('group_size', 1)} people

Please provide:
1. Day-by-day detailed itinerary
2. Estimated costs for major expenses
3. Transportation recommendations between locations
4. Accommodation suggestions for each area
5. Must-try local foods and recommended restaurants
6. Important tips and considerations
7. Alternative options based on weather or availability

Make it practical, engaging, and tailored to the specified interests and budget."""

    elif prompt_type == "flights":
        return f"""Provide flight recommendations for travel to Kota Kinabalu, Sabah from {request_data.get('origin', 'unspecified location')}:

Departure Date: {request_data.get('departure_date', 'flexible')}
Return Date: {request_data.get('return_date', 'open-ended')}
Passengers: {request_data.get('passengers', 1)}
Class: {request_data.get('flight_class', 'economy')}

Please include:
1. Major airlines that serve this route
2. Typical flight duration and connections
3. Estimated price ranges (mention these are approximate)
4. Best booking platforms or travel agencies
5. Tips for getting better deals
6. Best times to fly (seasonality considerations)
7. Airport information (Kota Kinabalu International Airport details)

Important: Emphasize that prices and availability change frequently, and users should check directly with airlines or travel booking sites for current information."""

    elif prompt_type == "recommendations":
        query = request_data.get('query', 'Tell me about Sabah')
        interests = request_data.get('interests', [])
        budget = request_data.get('budget', '')
        duration = request_data.get('duration', '')
        
        context = f"User query: {query}\n"
        if interests:
            context += f"User interests: {', '.join(interests)}\n"
        if budget:
            context += f"Budget consideration: {budget}\n"
        if duration:
            context += f"Trip duration: {duration}\n"
            
        return f"""As an expert Sabah travel guide, please answer this travel question with detailed, practical advice:

{context}

Provide comprehensive, helpful information that includes:
- Specific recommendations tailored to the query
- Practical tips and insider knowledge
- Cost considerations where relevant
- Best times to visit or experience what's asked about
- Any important cultural or practical considerations
- Alternative suggestions if applicable

Be conversational, enthusiastic, and provide actionable advice."""

    return "Tell me about the wonderful destinations and experiences available in Sabah, Malaysia."

# Quiz questions (from your original Flask app)
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
    }
]

# Load quests data from JSON file
quests_path = os.path.join(os.path.dirname(__file__), "data", "quests.json")
try:
    with open(quests_path, "r", encoding="utf-8") as f:
        quests_data = json.load(f)
except Exception:
    quests_data = []

# Health check
@app.get("/health")
async def health_check():
    gemini_status = "available" if get_gemini_model() else "unavailable"
    return {
        "status": "healthy",
        "service": "JumBah AI Chatbot",
        "gemini_ai": gemini_status,
        "timestamp": datetime.now().isoformat()
    }

# Authentication endpoints
@app.post("/register")
async def register(user_data: UserRegister):
    if user_data.username in users_db:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    user_id = str(uuid.uuid4())
    # Store password in plain text (NOT recommended for production)
    users_db[user_data.username] = {
        "user_id": user_id,
        "username": user_data.username,
        "password": user_data.password,
        "created_at": datetime.now().isoformat()
    }
    user_scores[user_id] = []
    return {"message": "User registered successfully", "user_id": user_id}

@app.post("/login")
async def login(user_data: UserLogin):
    user = users_db.get(user_data.username)
    if not user or user_data.password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token = create_access_token({
        "username": user["username"],
        "user_id": user["user_id"]
    })
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "user_id": user["user_id"]
        }
    }

@app.get("/profile")
async def get_profile(current_user: dict = Depends(verify_token)):
    return {
        "username": current_user["username"],
        "user_id": current_user["user_id"],
        "message": "Profile retrieved successfully"
    }

# Quiz endpoints
@app.get("/quiz")
async def get_quiz():
    return {"questions": quiz_questions}

@app.post("/scores")
async def submit_score(score_data: ScoreSubmission, current_user: dict = Depends(verify_token)):
    user_id = current_user["user_id"]
    
    if user_id not in user_scores:
        user_scores[user_id] = []
    
    user_scores[user_id].append({
        "score": score_data.score,
        "timestamp": datetime.now().isoformat(),
        "username": current_user["username"]
    })
    
    return {"message": "Score submitted successfully", "score": score_data.score}

@app.get("/leaderboard")
async def get_leaderboard():
    leaderboard = []
    
    for user_id, scores in user_scores.items():
        if scores:
            max_score = max(score["score"] for score in scores)
            username = scores[0]["username"]  # Get username from first score
            leaderboard.append({
                "username": username,
                "score": max_score
            })
    
    # Sort by score descending
    leaderboard.sort(key=lambda x: x["score"], reverse=True)
    return leaderboard[:10]  # Top 10

# Game progression endpoints
@app.get("/game-progress")
async def get_game_progress(current_user: dict = Depends(verify_token)):
    user_id = current_user["user_id"]
    if user_id not in user_game_progress:
        user_game_progress[user_id] = {
            "points": 0,
            "completed_quests": [],
            "active_quests": [],
            "achievements": [],
            "collected_stamps": [],
            "quiz_scores": []
        }
    return user_game_progress[user_id]

@app.post("/game-progress")
async def update_game_progress(progress_data: GameProgressUpdate, current_user: dict = Depends(verify_token)):
    user_id = current_user["user_id"]
    
    if user_id not in user_game_progress:
        user_game_progress[user_id] = {
            "points": 0,
            "completed_quests": [],
            "active_quests": [],
            "achievements": [],
            "collected_stamps": [],
            "quiz_scores": []
        }
    
    # Update only provided fields
    if progress_data.points is not None:
        user_game_progress[user_id]["points"] = progress_data.points
    if progress_data.completed_quests is not None:
        user_game_progress[user_id]["completed_quests"] = progress_data.completed_quests
    if progress_data.active_quests is not None:
        user_game_progress[user_id]["active_quests"] = progress_data.active_quests
    if progress_data.achievements is not None:
        user_game_progress[user_id]["achievements"] = progress_data.achievements
    if progress_data.collected_stamps is not None:
        user_game_progress[user_id]["collected_stamps"] = progress_data.collected_stamps
    if progress_data.quiz_scores is not None:
        user_game_progress[user_id]["quiz_scores"] = progress_data.quiz_scores
    
    return {"message": "Game progress updated successfully", "progress": user_game_progress[user_id]}

# Map history endpoints
@app.get("/map-history")
async def get_map_history(current_user: dict = Depends(verify_token)):
    user_id = current_user["user_id"]
    if user_id not in user_map_history:
        user_map_history[user_id] = []
    return user_map_history[user_id]

@app.post("/map-history")
async def add_map_history(map_entry: MapHistoryEntry, current_user: dict = Depends(verify_token)):
    user_id = current_user["user_id"]
    
    if user_id not in user_map_history:
        user_map_history[user_id] = []
    
    entry = {
        "location": map_entry.location,
        "coordinates": map_entry.coordinates,
        "timestamp": map_entry.timestamp or datetime.now().isoformat(),
        "notes": map_entry.notes
    }
    
    user_map_history[user_id].append(entry)
    return {"message": "Map history entry added successfully", "entry": entry}

# AI planner prompt history endpoints
@app.get("/ai-history")
async def get_ai_history(current_user: dict = Depends(verify_token)):
    user_id = current_user["user_id"]
    if user_id not in user_ai_history:
        user_ai_history[user_id] = []
    return user_ai_history[user_id]

@app.post("/ai-history")
async def add_ai_history(ai_entry: AIPromptEntry, current_user: dict = Depends(verify_token)):
    user_id = current_user["user_id"]
    
    if user_id not in user_ai_history:
        user_ai_history[user_id] = []
    
    entry = {
        "prompt": ai_entry.prompt,
        "response": ai_entry.response,
        "timestamp": ai_entry.timestamp or datetime.now().isoformat(),
        "category": ai_entry.category
    }
    
    user_ai_history[user_id].append(entry)
    return {"message": "AI history entry added successfully", "entry": entry}

@app.get("/quests")
async def get_quests():
    return quests_data

# Attractions endpoint
@app.get("/attractions")
async def get_attractions():
    """Return tourism attractions grouped by district."""
    data_path = os.path.join(os.path.dirname(__file__), "data", "attractions.json")
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)


# Latest highlights from Sabah Tourism
@app.get("/explore/latest")
async def get_latest_explore():
    """Scrape the Sabah Tourism website for the latest articles."""
    url = "https://sabahtourism.com"
    try:
        resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        items = []
        for article in soup.select("article")[:5]:
            link = article.find("a")
            title = link.get_text(strip=True) if link else article.get_text(strip=True)
            href = link["href"] if link and link.get("href") else url
            items.append({"title": title, "link": href})
        return items
    except Exception as e:
        return {"error": str(e)}

# Chatbot endpoints
@app.get("/chatbot/info")
async def get_chatbot_info():
    return {
        "name": "JumBah AI Travel Assistant",
        "description": "Your intelligent guide to Sabah, Malaysia",
        "powered_by": "Google Gemini AI",
        "capabilities": [
            "Personalized travel recommendations",
            "Detailed itinerary planning",
            "Local attractions and activities information",
            "Food and dining suggestions",
            "Transportation and accommodation advice",
            "Cultural insights and festival information",
            "Wildlife and nature activity planning",
            "Budget planning assistance",
            "Flight recommendations",
            "Local customs and etiquette guidance"
        ]
    }

@app.post("/chatbot/session/new")
async def create_chat_session():
    session_id = generate_session_id()
    chat_sessions[session_id] = []
    user_contexts[session_id] = {
        "created_at": datetime.now(),
        "preferences": {},
        "user_info": {}
    }
    
    return {
        "session_id": session_id,
        "message": "Hello! I'm JumBah AI, your friendly travel assistant for Sabah, Malaysia! How can I help you plan your perfect Sabah adventure today?",
        "created_at": datetime.now()
    }

@app.get("/chatbot/session/{session_id}")
async def get_chat_session(session_id: str):
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    return ChatSession(
        session_id=session_id,
        messages=chat_sessions[session_id],
        created_at=user_contexts[session_id]["created_at"],
        last_activity=datetime.now()
    )

@app.post("/chatbot/chat", response_model=ChatResponse)
async def chat_with_bot(message: ChatMessage):
    model = get_gemini_model()
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="AI service is not available. Please check Gemini API configuration."
        )
    
    # Create session if not provided
    session_id = message.session_id or generate_session_id()
    
    if session_id not in chat_sessions:
        chat_sessions[session_id] = []
        user_contexts[session_id] = {
            "created_at": datetime.now(),
            "preferences": {},
            "user_info": {}
        }
    
    # Update context if provided
    if message.context:
        user_contexts[session_id].update(message.context)
    
    try:
        # Build conversation context
        conversation_prompt = build_conversation_context(session_id, message.message)
        
        # Generate AI response
        response = model.generate_content(conversation_prompt)
        ai_response = clean_ai_response(response.text)
        
        # Store messages in session
        timestamp = datetime.now()
        chat_sessions[session_id].extend([
            {
                "role": "user",
                "content": message.message,
                "timestamp": timestamp.isoformat()
            },
            {
                "role": "assistant",
                "content": ai_response,
                "timestamp": timestamp.isoformat()
            }
        ])
        
        return ChatResponse(
            response=ai_response,
            session_id=session_id,
            timestamp=timestamp,
            context=user_contexts.get(session_id)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {str(e)}"
        )

@app.delete("/chatbot/session/{session_id}")
async def delete_chat_session(session_id: str):
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Chat session not found")
    
    del chat_sessions[session_id]
    if session_id in user_contexts:
        del user_contexts[session_id]
    
    return {"message": "Chat session deleted successfully"}

@app.get("/chatbot/sessions")
async def get_all_sessions():
    return {
        "total_sessions": len(chat_sessions),
        "sessions": [
            {
                "session_id": sid,
                "message_count": len(messages),
                "last_activity": messages[-1]["timestamp"] if messages else None
            }
            for sid, messages in chat_sessions.items()
        ]
    }

# Specialized AI endpoints
@app.post("/generate-itinerary")
async def generate_itinerary(request: ItineraryRequest):
    model = get_gemini_model()
    if model is None:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    prompt = create_specialized_prompt(request.dict(), "itinerary")
    
    try:
        response = model.generate_content(prompt)
        return {"success": True, "itinerary": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate itinerary: {str(e)}")

@app.post("/flight-recommendations")
async def flight_recommendations(request: FlightRequest):
    model = get_gemini_model()
    if model is None:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    prompt = create_specialized_prompt(request.dict(), "flights")
    
    try:
        response = model.generate_content(prompt)
        return {"success": True, "recommendations": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get flight recommendations: {str(e)}")

@app.post("/travel-recommendations")
async def travel_recommendations(request: TravelRecommendationRequest):
    model = get_gemini_model()
    if model is None:
        raise HTTPException(status_code=503, detail="AI service not available")
    
    prompt = create_specialized_prompt(request.dict(), "recommendations")
    
    try:
        response = model.generate_content(prompt)
        return {"success": True, "recommendations": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get travel recommendations: {str(e)}")

# Root endpoint
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>JumBah AI Chatbot</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; color: #4CAF50; margin-bottom: 30px; }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; }
            .method { color: #007bff; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏝️ JumBah AI Travel Chatbot</h1>
            <p>Powered by Google Gemini AI</p>
        </div>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
            <strong class="method">GET</strong> /docs - Interactive API Documentation
        </div>
        
        <div class="endpoint">
            <strong class="method">GET</strong> /health - Health Check
        </div>
        
        <div class="endpoint">
            <strong class="method">POST</strong> /chatbot/session/new - Start New Chat Session
        </div>
        
        <div class="endpoint">
            <strong class="method">POST</strong> /chatbot/chat - Chat with AI
        </div>
        
        <div class="endpoint">
            <strong class="method">POST</strong> /register - User Registration
        </div>
        
        <div class="endpoint">
            <strong class="method">POST</strong> /login - User Login
        </div>
        
        <div class="endpoint">
            <strong class="method">GET</strong> /quiz - Get Quiz Questions
        </div>
        
        <div class="endpoint">
            <strong class="method">POST</strong> /generate-itinerary - AI Itinerary Planning
        </div>
        
        <div class="endpoint">
            <strong class="method">POST</strong> /flight-recommendations - AI Flight Suggestions
        </div>
        
        <div class="endpoint">
            <strong class="method">POST</strong> /travel-recommendations - AI Travel Advice
        </div>
        
        <p><strong>Visit <a href="/docs">/docs</a> for interactive API testing!</strong></p>
    </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info",
    )