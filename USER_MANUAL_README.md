# JumBah - User Manual & Documentation

## 🌟 Overview
JumBah is an interactive tourism platform for exploring Sabah, Malaysia through gamified quests, cultural learning, and adventure discovery.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+
- Modern web browser

### Running the Application
1. **Backend Setup:**
   - Navigate to `Backend/` folder
   - Run `uvicorn app:app --host 0.0.0.0 --port 8000 --reload`
   - Backend runs on `http://localhost:8000`

2. **Frontend Setup:**
   - Navigate to `Frontend/` folder
   - Run `npm run dev`
   - Frontend runs on `http://localhost:5173`

## 📱 Website Pages & Features

### 🏠 **Home Page**
- **Purpose:** Landing page and main navigation hub
- **Features:**
  - Welcome message and site overview
  - Navigation to main sections
  - User authentication status
  - Quick access to popular features

### 🎮 **Game Page** (Main Hub)
- **Purpose:** Central gaming and quest management interface
- **Key Sections:**
  - **User Stats Header:** Points, stamps collected, achievements earned
  - **Quest Discovery:** Browse and start available quests
  - **My Quests:** View active and completed quests
  - **Achievements:** Display earned badges and milestones
  - **Quiz Game:** Interactive Sabah knowledge quiz
- **Features:**
  - Start new quests from discovery section
  - Complete quests to earn points and stamps
  - Track progress and achievements
  - QR code scanning functionality

### 🗺️ **Quest Board**
- **Purpose:** Dedicated quest browsing and management
- **Features:**
  - Grid view of all available quests
  - Quest filtering by type (QR, Photo, Audio, Trivia)
  - Quest statistics and progress tracking
  - Direct quest starting interface
- **Quest Types:**
  - **QR Quests:** Scan QR codes at locations
  - **Photo Quests:** Take photos at specific spots
  - **Audio Quests:** Record local phrases
  - **Trivia Quests:** Answer cultural questions

### 🎯 **Individual Quest Pages**
- **Purpose:** Complete specific quest activities
- **Features:**
  - Quest details and instructions
  - Interactive completion interfaces
  - Real-time camera/microphone access
  - Progress tracking and validation
  - Reward display upon completion

### 📖 **Stampbook**
- **Purpose:** Collection and achievement tracking
- **Features:**
  - Visual stamp collection display
  - Progress statistics
  - Rarity system (Common, Uncommon, Rare, Legendary)
  - Achievement history
  - Completion percentage tracking

### 🔍 **Explore Page**
- **Purpose:** Discover Sabah attractions and districts
- **Features:**
  - District-based exploration
  - Attraction information and details
  - Interactive maps and guides
  - Cultural and historical content

### 🤖 **AI Planner**
- **Purpose:** Personalized trip planning assistance
- **Features:**
  - AI-powered itinerary suggestions
  - Customized recommendations
  - Interactive planning tools
  - Integration with quest system

### 📚 **Dictionary Page**
- **Purpose:** Local language learning and translation
- **Features:**
  - Dusun-English dictionary
  - Phrase translations
  - Cultural context explanations
  - Audio pronunciations

### 👤 **User Profile**
- **Purpose:** Account management and personal statistics
- **Features:**
  - User information display
  - Achievement showcase
  - Progress statistics
  - Account settings

## 🎯 Quest System Explained

### Quest Types & Mechanics
1. **QR Code Quests:**
   - Find physical QR codes at locations
   - Scan using built-in camera
   - Validate secret codes for completion

2. **Photo Quests:**
   - Take photos at specified locations
   - Upload through camera interface
   - Automatic validation and processing

3. **Audio Quests:**
   - Record local phrases or greetings
   - Practice pronunciation
   - Submit recordings for validation

4. **Trivia Quests:**
   - Answer cultural and historical questions
   - Multiple choice format
   - Immediate feedback and scoring

### Progression System
- **Points:** Earned by completing quests (varies by difficulty)
- **Stamps:** Collected as quest rewards
- **Achievements:** Unlocked based on milestones
- **Levels:** Progress through point accumulation

## 🛠️ Technical Architecture

### Frontend (React + Vite)
- **Framework:** React 18 with modern hooks
- **Styling:** CSS modules with responsive design
- **State Management:** Context API for global state
- **Routing:** React Router for navigation
- **Icons:** React Icons library
- **Camera/Audio:** Web APIs for media access

### Backend (FastAPI + Python)
- **Framework:** FastAPI for REST API
- **Database:** SQLite with SQLAlchemy ORM
- **Authentication:** JWT token-based auth
- **File Storage:** Local file system
- **Data:** JSON files for quest and attraction data

### Key Components
- **GameContext:** Global state management for quests, points, achievements
- **AuthContext:** User authentication and session management
- **QRScanner:** Camera-based QR code scanning
- **QuestCard:** Reusable quest display component

## 📊 Data Structure

### Quest Object
```json
{
  "id": "kk-001",
  "title": "Quest Name",
  "district": "kk",
  "type": "qr|photo|audio|trivia",
  "image": "image_url",
  "description": "Quest description",
  "points": 100,
  "category": "exploration",
  "reward": {
    "type": "stamp|badge",
    "name": "Reward Name"
  }
}
```

### User Progress
- **Points:** Total accumulated points
- **Completed Quests:** Set of completed quest IDs
- **Collected Stamps:** Set of earned stamps
- **Achievements:** Array of achievement objects

## 🔧 Development Guidelines

### Adding New Quests
1. Update `Frontend/src/data/quests.json`
2. Follow existing quest object structure
3. Ensure unique IDs and proper categorization
4. Test all quest types thoroughly

### Styling Conventions
- Use CSS custom properties for theming
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use semantic HTML elements

### State Management
- Use GameContext for quest-related state
- Keep component state minimal and local
- Implement proper error boundaries
- Handle loading states appropriately

## 🐛 Common Issues & Solutions

### Camera/Microphone Access
- **Issue:** Browser blocks media access
- **Solution:** Ensure HTTPS or localhost usage
- **Fallback:** Provide mock completion options

### Quest Completion Tracking
- **Issue:** Progress not saving
- **Solution:** Check GameContext state updates
- **Debug:** Use browser dev tools to inspect state

### Performance Optimization
- Use React.memo for expensive components
- Implement lazy loading for images
- Minimize re-renders with proper dependencies

## 📱 Mobile Considerations

### Responsive Design
- All pages optimized for mobile devices
- Touch-friendly interface elements
- Proper viewport configuration
- Accessible font sizes and spacing

### PWA Features
- Add to home screen capability
- Offline functionality (limited)
- App-like experience on mobile

## 🔒 Security & Privacy

### Data Protection
- User data stored locally in browser
- No sensitive information in localStorage
- Secure API endpoints with authentication
- Input validation and sanitization

### Best Practices
- Regular security updates
- Proper error handling
- User consent for media access
- Data minimization principles

---

## 📞 Support & Maintenance

For technical issues or feature requests, refer to the development team or check the project repository for updates and documentation.

**Last Updated:** December 2024
**Version:** 1.0
**Platform:** Web Application (React + FastAPI)