from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from datetime import datetime
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini AI with environment variable
api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

class AITravelPlanner:
    def __init__(self):
        self.sabah_context = """
        You are an expert AI travel planner specializing in Sabah, Malaysia (Land Below the Wind).
        
        Key Sabah Information:
        - Capital: Kota Kinabalu
        - Famous for: Mount Kinabalu, Sepilok Orangutan Sanctuary, Sipadan Island
        - Districts: Kota Kinabalu, Sandakan, Tawau, Lahad Datu, Keningau, Beaufort
        - Best time to visit: March to September (dry season)
        - Languages: Malay, English, Kadazan-Dusun
        - Currency: Malaysian Ringgit (MYR)
        
        Popular Attractions:
        - Mount Kinabalu National Park
        - Kinabalu Park
        - Sipadan Island (world-class diving)
        - Sepilok Orangutan Rehabilitation Centre
        - Kinabatangan River
        - Maliau Basin Conservation Area
        - Danum Valley Conservation Area
        - Tip of Borneo (Simpang Mengayau)
        - Kundasang Market
        - Mari Mari Cultural Village
        
        Accommodation Types:
        - Luxury resorts (4-5 star)
        - Boutique hotels
        - Budget hostels
        - Eco-lodges
        - Homestays
        
        Transportation:
        - Kota Kinabalu International Airport (BKI)
        - Car rental
        - Tour buses
        - Boats for island hopping
        
        Always provide practical, detailed recommendations with estimated costs in MYR.
        """
    
    def generate_itinerary(self, prompt_data):
        """Generate a detailed travel itinerary"""
        prompt = f"""
        {self.sabah_context}
        
        Create a detailed {prompt_data['duration']} itinerary for Sabah, Malaysia with the following preferences:
        
        Duration: {prompt_data['duration']}
        Budget: {prompt_data['budget']} MYR
        Interests: {', '.join(prompt_data['interests'])}
        Accommodation: {prompt_data['accommodation']}
        Group Size: {prompt_data['group_size']} people
        
        Please provide:
        1. Day-by-day detailed itinerary
        2. Estimated costs breakdown
        3. Accommodation recommendations
        4. Transportation suggestions
        5. Must-try local food
        6. Cultural tips and etiquette
        7. What to pack
        8. Best photo spots
        
        Format as a comprehensive travel guide with clear sections and bullet points.
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating itinerary: {str(e)}"
    
    def get_flight_recommendations(self, travel_data):
        """Get flight recommendations"""
        prompt = f"""
        {self.sabah_context}
        
        Provide flight recommendations to Kota Kinabalu International Airport (BKI) from {travel_data['origin']}:
        
        Origin: {travel_data['origin']}
        Departure Date: {travel_data['departure_date']}
        Return Date: {travel_data['return_date']} 
        Passengers: {travel_data['passengers']}
        Class: {travel_data['class']}
        
        Include:
        1. Major airlines that fly this route
        2. Typical flight duration and connections
        3. Estimated price ranges in MYR
        4. Best booking times for deals
        5. Airport transfer options from BKI to city center
        6. Tips for international travelers
        
        Format with clear sections and practical information.
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error getting flight recommendations: {str(e)}"
    
    def get_recommendations(self, query):
        """Get general travel recommendations"""
        prompt = f"""
        {self.sabah_context}
        
        User Query: {query}
        
        Provide detailed, helpful recommendations for traveling in Sabah, Malaysia.
        Include practical tips, costs, and local insights.
        Format the response clearly with bullet points and sections where appropriate.
        """
        
        try:
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error getting recommendations: {str(e)}"

# Initialize AI Travel Planner
ai_planner = AITravelPlanner()

@app.route('/api/generate-itinerary', methods=['POST'])
def generate_itinerary():
    try:
        data = request.json
        print(f"Generating itinerary for: {data}")  # Debug log
        result = ai_planner.generate_itinerary(data)
        return jsonify({
            'success': True,
            'itinerary': result,
            'generated_at': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in generate_itinerary: {str(e)}")  # Debug log
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/flight-recommendations', methods=['POST'])
def flight_recommendations():
    try:
        data = request.json
        print(f"Getting flight recommendations for: {data}")  # Debug log
        result = ai_planner.get_flight_recommendations(data)
        return jsonify({
            'success': True,
            'recommendations': result,
            'generated_at': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in flight_recommendations: {str(e)}")  # Debug log
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/travel-recommendations', methods=['POST'])
def travel_recommendations():
    try:
        data = request.json
        query = data.get('query', '')
        print(f"Getting travel recommendations for: {query}")  # Debug log
        result = ai_planner.get_recommendations(query)
        return jsonify({
            'success': True,
            'recommendations': result,
            'generated_at': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in travel_recommendations: {str(e)}")  # Debug log
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'AI Travel Planner',
        'timestamp': datetime.now().isoformat(),
        'gemini_configured': bool(api_key)
    })

if __name__ == '__main__':
    print("Starting AI Travel Planner Backend...")
    print(f"Gemini API Key configured: {'Yes' if api_key else 'No'}")
    app.run(debug=True, host='0.0.0.0', port=5000)