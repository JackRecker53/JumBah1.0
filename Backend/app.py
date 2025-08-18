import os
from pathlib import Path
from datetime import datetime

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, get_jwt_identity, jwt_required, JWTManager
)
from flask_migrate import Migrate

# Optional: use Uvicorn with Flask via ASGI adapter
try:
    from asgiref.wsgi import WsgiToAsgi  # pip install asgiref
except Exception:  # If not installed, Uvicorn path won't be available
    WsgiToAsgi = None

# -------------------------
# App initialization
# -------------------------
BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")

app = Flask(__name__)
from flask_cors import CORS

CORS(app, supports_credentials=True, resources={
  r"/*": {"origins": [
    "http://127.0.0.1:5173", "http://localhost:5173",   # Vite
    "http://127.0.0.1:5174", "http://localhost:5174",   # Vite (fallback)
    "http://127.0.0.1:3000", "http://localhost:3000"    # CRA (if you use it sometimes)
  ]}
}
)


# -------------------------
# Config
# -------------------------
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-CHANGE")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///jumbah.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# -------------------------
# Extensions
# -------------------------
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# -------------------------
# Models
# -------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship("User", backref=db.backref("scores", lazy=True))

# -------------------------
# Gemini (lazy + safe)
# -------------------------
import google.generativeai as genai

def get_gemini_model():
    """Configure and return Gemini model if key exists; else None."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")

# -------------------------
# Health & Error Handlers
# -------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200

@app.errorhandler(404)
def not_found(e):
    return jsonify({"msg": "Not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    # Avoid leaking internals; log in real apps
    return jsonify({"msg": "Internal server error"}), 500

# -------------------------
# Auth Endpoints
# -------------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, password=hashed)
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        token = create_access_token(identity={"username": user.username, "id": user.id})
        return jsonify(access_token=token), 200
    return jsonify({"msg": "Bad username or password"}), 401

@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    return jsonify(logged_in_as=get_jwt_identity()), 200

# -------------------------
# Quiz / Scores
# -------------------------
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
]

@app.route("/quiz", methods=["GET"])
def get_quiz():
    return jsonify(quiz_questions), 200

@app.route("/scores", methods=["POST"])
@jwt_required()
def submit_score():
    data = request.get_json(silent=True) or {}
    score_value = data.get("score")
    if score_value is None:
        return jsonify({"msg": "Score is required"}), 400

    current_user = get_jwt_identity()
    new_score = Score(user_id=current_user["id"], score=int(score_value))
    db.session.add(new_score)
    db.session.commit()
    return jsonify({"msg": "Score submitted successfully"}), 201

@app.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    scores = (
        db.session.query(User.username, db.func.max(Score.score))
        .join(Score)
        .group_by(User.username)
        .order_by(db.func.max(Score.score).desc())
        .limit(10)
        .all()
    )
    return jsonify([{"username": u, "score": s} for u, s in scores]), 200

# -------------------------
# AI Planner Endpoints
# -------------------------
def create_planner_prompt(data, prompt_type="itinerary"):
    """Creates a detailed prompt for the Gemini model based on planner data."""
    if prompt_type == "itinerary":
        return (
            f"Create a travel itinerary for Sabah, Malaysia with the following details:\n"
            f"- Duration: {data.get('duration', 'not specified')}\n"
            f"- Budget: MYR {data.get('budget', 'not specified')}\n"
            f"- Interests: {', '.join(data.get('interests', ['not specified']))}\n"
            f"- Accommodation Style: {data.get('accommodation', 'not specified')}\n"
            f"- Group Size: {data.get('group_size', 'not specified')} people\n\n"
            f"Provide a day-by-day plan. Be creative and helpful."
        )
    elif prompt_type == "flights":
        return (
            f"Find flight recommendations to Kota Kinabalu, Sabah from {data.get('origin', 'not specified')}.\n"
            f"- Departure Date: {data.get('departure_date', 'any')}\n"
            f"- Return Date: {data.get('return_date', 'any')}\n"
            f"- Passengers: {data.get('passengers', '1')}\n"
            f"- Class: {data.get('class', 'economy')}\n\n"
            f"Suggest 1-2 airlines and typical price ranges. Mention that this is an estimate and booking should be done directly."
        )
    elif prompt_type == "recommendations":
        return (
            f"As a friendly tour guide for Sabah, Malaysia, answer the following question concisely: "
            f"'{data.get('query', 'Tell me something interesting about Sabah.')}'"
        )
    return "Tell me something about Sabah."

@app.route("/generate-itinerary", methods=["POST"])
def generate_itinerary():
    model = get_gemini_model()
    if model is None:
        return jsonify({"success": False, "error": "AI service not configured"}), 503
    
    data = request.get_json(silent=True) or {}
    prompt = create_planner_prompt(data, "itinerary")
    
    try:
        resp = model.generate_content(prompt)
        return jsonify({"success": True, "itinerary": resp.text})
    except Exception as e:
        return jsonify({"success": False, "error": "Failed to generate itinerary"}), 500

@app.route("/flight-recommendations", methods=["POST"])
def flight_recommendations():
    model = get_gemini_model()
    if model is None:
        return jsonify({"success": False, "error": "AI service not configured"}), 503
    
    data = request.get_json(silent=True) or {}
    prompt = create_planner_prompt(data, "flights")
    
    try:
        resp = model.generate_content(prompt)
        return jsonify({"success": True, "recommendations": resp.text})
    except Exception as e:
        return jsonify({"success": False, "error": "Failed to get flight recommendations"}), 500

@app.route("/travel-recommendations", methods=["POST"])
def travel_recommendations():
    model = get_gemini_model()
    if model is None:
        return jsonify({"success": False, "error": "AI service not configured"}), 503
    
    data = request.get_json(silent=True) or {}
    prompt = create_planner_prompt(data, "recommendations")
    
    try:
        resp = model.generate_content(prompt)
        return jsonify({"success": True, "recommendations": resp.text})
    except Exception as e:
        return jsonify({"success": False, "error": "Failed to get travel recommendations"}), 500


# -------------------------
# Example AI endpoint (optional)
# -------------------------
@app.route("/ai/echo", methods=["POST"])
def ai_echo():
    """
    Minimal example using Gemini. Expects {"prompt": "..."}.
    Returns 503 if GEMINI_API_KEY is missing (won't crash app).
    """
    model = get_gemini_model()
    if model is None:
        return jsonify({"msg": "Missing GEMINI_API_KEY"}), 503

    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt", "Hello from JumBah!")
    try:
        resp = model.generate_content(prompt)
        text = getattr(resp, "text", None) or str(resp)
        return jsonify({"reply": text}), 200
    except Exception:
        return jsonify({"msg": "AI generation failed"}), 500

# -------------------------
# ASGI wrapper for Uvicorn
# -------------------------
if WsgiToAsgi is not None:
    asgi_app = WsgiToAsgi(app)
else:
    # Fallback name so uvicorn import doesn't break if asgiref isn't installed
    asgi_app = None

# -------------------------
# Main (WSGI dev server)
# -------------------------
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    # Default to port 8000 so it matches many frontend dev setups
    app.run(debug=True, host="127.0.0.1", port=int(os.getenv("PORT", 8000)))
