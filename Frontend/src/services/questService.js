// Service for fetching quests from the backend API

const API_BASE_URL = 'http://localhost:8000';

export const questService = {
  /**
   * Fetch all available quests from the backend
   * @returns {Promise<Array>} Array of quest objects
   */
  async fetchQuests() {
    try {
      const response = await fetch(`${API_BASE_URL}/quests`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch quests: ${response.status}`);
      }
      
      const quests = await response.json();
      return quests;
    } catch (error) {
      console.error('Error fetching quests:', error);
      throw error;
    }
  }
};