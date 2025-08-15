const API_BASE_URL = "http://localhost:5000/api";

export const aiPlannerService = {
  // Generate complete itinerary
  async generateItinerary(plannerData) {
    try {
      console.log("Sending itinerary request:", plannerData);
      const response = await fetch(`${API_BASE_URL}/generate-itinerary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plannerData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Itinerary response:", result);
      return result;
    } catch (error) {
      console.error("Error generating itinerary:", error);
      throw error;
    }
  },

  // Get flight recommendations
  async getFlightRecommendations(flightData) {
    try {
      console.log("Sending flight request:", flightData);
      const response = await fetch(`${API_BASE_URL}/flight-recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(flightData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Flight response:", result);
      return result;
    } catch (error) {
      console.error("Error getting flight recommendations:", error);
      throw error;
    }
  },

  // Get travel recommendations
  async getTravelRecommendations(query) {
    try {
      console.log("Sending recommendation request:", query);
      const response = await fetch(`${API_BASE_URL}/travel-recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Recommendation response:", result);
      return result;
    } catch (error) {
      console.error("Error getting travel recommendations:", error);
      throw error;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const result = await response.json();
      console.log("Health check:", result);
      return result;
    } catch (error) {
      console.error("Health check failed:", error);
      throw error;
    }
  },
};
