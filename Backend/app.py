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
from passlib.context import CryptContext

# Load environment variables
load_dotenv()

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

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# In-memory storage (replace with database in production)
users_db: Dict[str, Dict[str, Any]] = {}
chat_sessions: Dict[str, List[Dict[str, Any]]] = {}
user_contexts: Dict[str, Dict[str, Any]] = {}
user_scores: Dict[str, List[Dict[str, Any]]] = {}

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

# Initialize Gemini AI
def get_gemini_model():
    """Configure and return Gemini model if key exists; else None."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")

def create_system_prompt():
    """Create a system prompt that defines the chatbot's personality and knowledge."""
    return """You are JumBah AI, a friendly and casual travel assistant for Sabah, Malaysia. 

Keep your responses conversational and natural - like talking to a knowledgeable local friend. Don't use formal structures, bullet points, or numbered lists unless specifically asked. Just chat naturally about Sabah travel topics.

You know about:
- Sabah attractions like Mount Kinabalu, Sipadan Island, wildlife parks
- Local food, restaurants, and cultural experiences  
- Transportation, accommodation, and practical travel tips
- Costs and timing for activities
- Local customs and hidden gems

Be enthusiastic but casual. Give helpful advice in a natural conversational way. If someone asks something outside of Sabah travel, politely redirect the conversation back to helping them explore Sabah.

Keep responses focused and conversational - avoid overly structured or formal formatting."""

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

def build_conversation_context(session_id: str, new_message: str) -> str:
    """Build conversation context from chat history with strict off-topic handling."""
    system_prompt = create_system_prompt()

    # STRICT off-topic behavior (no random suggestions).
    off_topic_instruction = """
You are ONLY a Sabah travel assistant.

If the user's message is unrelated to Sabah travel, reply EXACTLY with:
"Sorry, I can only help with Sabah travel questions."

Do not provide suggestions, alternatives, or reframe their question.
Keep responses conversational and short. Avoid bullet points unless the user asks for them.
"""

    full_system_prompt = system_prompt + "\n" + off_topic_instruction

    if session_id not in chat_sessions:
        return f"{full_system_prompt}\n\nUser: {new_message}"

    # Use only the last few turns to keep the context focused
    recent_messages = chat_sessions[session_id][-8:]

    conversation = f"{full_system_prompt}\n\nRecent conversation:\n"
    for msg in recent_messages:
        role = "You" if msg["role"] == "assistant" else "User"
        conversation += f"{role}: {msg['content']}\n"

    conversation += f"\nUser: {new_message}"
    return conversation


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
    
    hashed_password = pwd_context.hash(user_data.password)
    user_id = str(uuid.uuid4())
    
    users_db[user_data.username] = {
        "user_id": user_id,
        "username": user_data.username,
        "password": hashed_password,
        "created_at": datetime.now().isoformat()
    }
    
    user_scores[user_id] = []
    
    return {"message": "User registered successfully", "user_id": user_id}

@app.post("/login")
async def login(user_data: UserLogin):
    user = users_db.get(user_data.username)
    if not user or not pwd_context.verify(user_data.password, user["password"]):
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
        "message": "🌺 Hello! I'm JumBah AI, your intelligent travel assistant for Sabah, Malaysia! I'm powered by advanced AI to help you discover the incredible beauty and experiences that Sabah has to offer. How can I help you plan your perfect Sabah adventure today?",
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
        ai_response = response.text
        
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
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )