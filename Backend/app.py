# This is the main backend file for your Flask application.
# It handles server-side logic, like user authentication, database interactions,
# and communication with the Gemini AI. It is completely separate from your
# frontend React code.

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from datetime import datetime
import json
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from flask_migrate import Migrate

# --- App Initialization ---
# Load environment variables from a .env file
load_dotenv()

app = Flask(__name__)
# Enable Cross-Origin Resource Sharing (CORS) to allow your frontend 
# to make requests to this backend.
CORS(app, supports_credentials=True)

# --- Configurations ---
# Secret key for JWT (important for security)
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'a-super-secret-key-for-development')
# Database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jumbah.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# --- Extensions Initialization ---
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# --- Database Models ---
# Represents the 'user' table in the database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

# Represents the 'score' table in the database
class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', backref=db.backref('scores', lazy=True))

# --- Gemini AI Configuration ---
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    # This will stop the app if the API key is not found
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please set it in the .env file.")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

# --- API Endpoints (Routes) ---

# Endpoint for user registration
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201

# Endpoint for user login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        # Create a new token with the user's identity
        access_token = create_access_token(identity={'username': user.username, 'id': user.id})
        return jsonify(access_token=access_token)

    return jsonify({"msg": "Bad username or password"}), 401

# An example of a protected route
@app.route('/profile')
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

# --- Game Endpoints ---
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

@app.route('/quiz', methods=['GET'])
def get_quiz():
    return jsonify(quiz_questions)

@app.route('/scores', methods=['POST'])
@jwt_required()
def submit_score():
    data = request.get_json()
    score_value = data.get('score')
    current_user = get_jwt_identity()
    user_id = current_user['id']

    if score_value is None:
        return jsonify({"msg": "Score is required"}), 400

    new_score = Score(user_id=user_id, score=score_value)
    db.session.add(new_score)
    db.session.commit()

    return jsonify({"msg": "Score submitted successfully"}), 201

@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    # Query to get the highest score for each user
    scores = db.session.query(
        User.username, 
        db.func.max(Score.score)
    ).join(Score).group_by(User.username).order_by(db.func.max(Score.score).desc()).limit(10).all()
    
    leaderboard = [{"username": username, "score": score} for username, score in scores]
    return jsonify(leaderboard)

# --- AI Planner Endpoints ---
# (The AI Planner class and its routes would go here)
# Note: I'm omitting the full AI planner code for brevity, but it belongs in this file.

# --- Main Execution ---
if __name__ == '__main__':
    # This block runs when the script is executed directly (e.g., `python app.py`)
    # It starts the Flask development server.
    with app.app_context():
        db.create_all() # Ensure all tables are created before running
    app.run(debug=True, port=5000)