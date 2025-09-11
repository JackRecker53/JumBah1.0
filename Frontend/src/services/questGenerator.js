import { GoogleGenerativeAI } from '@google/generative-ai';
import { API_BASE_URL } from '../config';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'your-api-key-here');

// Sabah tourism locations and attractions
const SABAH_LOCATIONS = [
  {
    name: 'Mount Kinabalu',
    type: 'Mountain',
    description: 'Highest mountain in Malaysia, UNESCO World Heritage Site',
    activities: ['hiking', 'climbing', 'nature photography', 'bird watching']
  },
  {
    name: 'Sepilok Orangutan Sanctuary',
    type: 'Wildlife Sanctuary',
    description: 'Famous orangutan rehabilitation center',
    activities: ['wildlife viewing', 'photography', 'educational tours']
  },
  {
    name: 'Sipadan Island',
    type: 'Diving Site',
    description: 'World-renowned diving destination',
    activities: ['scuba diving', 'snorkeling', 'marine photography']
  },
  {
    name: 'Kinabatangan River',
    type: 'River',
    description: 'Wildlife sanctuary and river cruise destination',
    activities: ['river cruise', 'wildlife spotting', 'photography']
  },
  {
    name: 'Tip of Borneo',
    type: 'Landmark',
    description: 'Northernmost point of Borneo',
    activities: ['sightseeing', 'photography', 'sunset viewing']
  },
  {
    name: 'Mari Mari Cultural Village',
    type: 'Cultural Site',
    description: 'Traditional cultural experience village',
    activities: ['cultural tours', 'traditional crafts', 'local cuisine']
  },
  {
    name: 'Gaya Street Sunday Market',
    type: 'Market',
    description: 'Famous weekend market in Kota Kinabalu',
    activities: ['shopping', 'food tasting', 'cultural experience']
  },
  {
    name: 'Tunku Abdul Rahman Marine Park',
    type: 'Marine Park',
    description: 'Island hopping and marine activities',
    activities: ['island hopping', 'snorkeling', 'beach activities']
  }
];

const QUEST_TYPES = [
  'photo_challenge',
  'trivia_quest',
  'scavenger_hunt',
  'cultural_interaction',
  'nature_observation',
  'food_discovery',
  'historical_exploration',
  'adventure_activity'
];

class QuestGenerator {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateQuest(location, questType, difficulty = 'medium') {
    const prompt = this.createQuestPrompt(location, questType, difficulty);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const questData = JSON.parse(response.text());
      
      // Add metadata
      questData.id = this.generateQuestId();
      questData.location = location.name;
      questData.type = questType;
      questData.difficulty = difficulty;
      questData.createdAt = new Date().toISOString();
      questData.qrCode = this.generateQRCode(questData.id);
      
      return questData;
    } catch (error) {
      console.error('Error generating quest:', error);
      return this.getFallbackQuest(location, questType);
    }
  }

  createQuestPrompt(location, questType, difficulty) {
    return `
Generate a tourism quest for ${location.name} in Sabah, Malaysia.

Location Details:
- Name: ${location.name}
- Type: ${location.type}
- Description: ${location.description}
- Activities: ${location.activities.join(', ')}

Quest Requirements:
- Quest Type: ${questType}
- Difficulty: ${difficulty}
- Must be related to Sabah tourism and culture
- Should encourage exploration and learning
- Include specific tasks that can be completed at or near the location

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Quest title (max 50 characters)",
  "description": "Detailed quest description (100-200 characters)",
  "objectives": [
    "Specific objective 1",
    "Specific objective 2",
    "Specific objective 3"
  ],
  "points": 50,
  "category": "Tourism",
  "hints": [
    "Helpful hint 1",
    "Helpful hint 2"
  ],
  "completionCriteria": "What needs to be done to complete the quest",
  "culturalInfo": "Interesting cultural or historical fact about the location",
  "estimatedTime": "30-60 minutes"
}

Make it engaging, educational, and fun for tourists visiting Sabah!
    `;
  }

  generateQuestId() {
    return `JUMBAH_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateQRCode(questId) {
    return JSON.stringify({
      type: 'jumbah_quest',
      questId: questId,
      timestamp: Date.now()
    });
  }

  getFallbackQuest(location, questType) {
    const fallbackQuests = {
      photo_challenge: {
        title: `Capture ${location.name}`,
        description: `Take a memorable photo at ${location.name} and discover its beauty`,
        objectives: [
          `Take a photo at ${location.name}`,
          'Share your experience',
          'Learn about the location'
        ],
        points: 30,
        category: 'Tourism',
        hints: [
          'Look for the best viewpoint',
          'Consider the lighting for your photo'
        ],
        completionCriteria: 'Submit a photo taken at the location',
        culturalInfo: `${location.name} is an important ${location.type} in Sabah`,
        estimatedTime: '20-30 minutes'
      },
      trivia_quest: {
        title: `${location.name} Explorer`,
        description: `Test your knowledge about ${location.name} and Sabah culture`,
        objectives: [
          'Answer trivia questions correctly',
          'Learn interesting facts',
          'Explore the area'
        ],
        points: 40,
        category: 'Tourism',
        hints: [
          'Look for information boards',
          'Ask local guides for insights'
        ],
        completionCriteria: 'Answer at least 3 out of 5 questions correctly',
        culturalInfo: `${location.name} has rich cultural significance in Sabah`,
        estimatedTime: '15-25 minutes'
      }
    };

    const quest = fallbackQuests[questType] || fallbackQuests.photo_challenge;
    quest.id = this.generateQuestId();
    quest.location = location.name;
    quest.type = questType;
    quest.difficulty = 'medium';
    quest.createdAt = new Date().toISOString();
    quest.qrCode = this.generateQRCode(quest.id);
    
    return quest;
  }

  async generateMultipleQuests(count = 5) {
    const quests = [];
    
    for (let i = 0; i < count; i++) {
      const location = SABAH_LOCATIONS[Math.floor(Math.random() * SABAH_LOCATIONS.length)];
      const questType = QUEST_TYPES[Math.floor(Math.random() * QUEST_TYPES.length)];
      const difficulty = ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
      
      try {
        const quest = await this.generateQuest(location, questType, difficulty);
        quests.push(quest);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to generate quest ${i + 1}:`, error);
      }
    }
    
    return quests;
  }

  async saveQuestToBackend(quest) {
    try {
      const response = await fetch(`${API_BASE_URL}/quests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quest)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save quest to backend');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving quest:', error);
      throw error;
    }
  }

  getLocationByName(locationName) {
    return SABAH_LOCATIONS.find(loc => 
      loc.name.toLowerCase().includes(locationName.toLowerCase())
    );
  }

  getAllLocations() {
    return SABAH_LOCATIONS;
  }

  getQuestTypes() {
    return QUEST_TYPES;
  }
}

export default new QuestGenerator();
export { SABAH_LOCATIONS, QUEST_TYPES };