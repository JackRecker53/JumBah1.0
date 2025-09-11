import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';
import questGenerator from '../services/questGenerator';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [points, setPoints] = useState(0);
    const [completedQuests, setCompletedQuests] = useState(new Set());
    const [collectedStamps, setCollectedStamps] = useState(new Set());
    const [quests, setQuests] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [scannedQuests, setScannedQuests] = useState(new Set());
    const [locationHistory, setLocationHistory] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);

    // Derive active quests from quests (non-completed ones)
    const activeQuests = quests.filter(quest => !completedQuests.has(quest.id));

    useEffect(() => {
        fetch(`${API_BASE_URL}/quests`)
            .then(res => res.json())
            .then(data => setQuests(data))
            .catch(err => console.error('Failed to load quests', err));
    }, []);

    useEffect(() => {
        // Reset game state if user logs out
        if (!isAuthenticated) {
            setPoints(0);
            setCompletedQuests(new Set());
            setCollectedStamps(new Set());
        }
    }, [isAuthenticated]);

    const completeQuest = (questId) => {
        if (completedQuests.has(questId)) return; // Already completed

        const quest = quests.find(q => q.id === questId);
        if (quest) {
            setPoints(prev => prev + quest.points);
            setCompletedQuests(prev => new Set(prev).add(questId));
            checkAchievements(questId, quest.points);
            console.log(`Quest ${questId} completed! +${quest.points} points.`);
        }
    };

    const collectStamp = (stampId) => {
       if (collectedStamps.has(stampId)) return;
       setCollectedStamps(prev => new Set(prev).add(stampId));
       setPoints(prev => prev + 50); // Add 50 points for each stamp
       console.log(`Stamp ${stampId} collected! +50 points.`);
    };

    const handleQRScan = async (qrData) => {
        try {
            const { questId } = qrData;
            
            if (scannedQuests.has(questId)) {
                return { success: false, message: 'Quest already scanned!' };
            }

            // Mark quest as scanned
            setScannedQuests(prev => new Set(prev).add(questId));
            
            // Check if it's an existing quest or generate new one
            let quest = quests.find(q => q.id === questId);
            
            if (!quest) {
                // Generate new quest based on location
                const location = questGenerator.getLocationByName(questId.split('_')[1] || 'Mount Kinabalu');
                quest = await questGenerator.generateQuest(location, 'photo_challenge');
                setQuests(prev => [...prev, quest]);
            }

            // Complete the quest
            completeQuest(questId);
            
            return { 
                success: true, 
                message: `Quest "${quest.title}" discovered and completed!`,
                quest: quest
            };
        } catch (error) {
            console.error('Error handling QR scan:', error);
            return { success: false, message: 'Failed to process QR code' };
        }
    };

    const generateAIQuest = async (location, questType = 'photo_challenge') => {
        try {
            const quest = await questGenerator.generateQuest(location, questType);
            setQuests(prev => [...prev, quest]);
            return quest;
        } catch (error) {
            console.error('Error generating AI quest:', error);
            throw error;
        }
    };

    const checkAchievements = (questId, pointsEarned) => {
        const newAchievements = [];
        
        // Points-based achievements
        if (points + pointsEarned >= 100 && !achievements.find(a => a.id === 'points_100')) {
            newAchievements.push({
                id: 'points_100',
                title: 'Century Explorer',
                description: 'Earned 100 points',
                icon: '🏆',
                points: 20
            });
        }
        
        if (points + pointsEarned >= 500 && !achievements.find(a => a.id === 'points_500')) {
            newAchievements.push({
                id: 'points_500',
                title: 'Sabah Master',
                description: 'Earned 500 points',
                icon: '👑',
                points: 50
            });
        }

        // Quest completion achievements
        const totalCompleted = completedQuests.size + 1;
        if (totalCompleted >= 5 && !achievements.find(a => a.id === 'quests_5')) {
            newAchievements.push({
                id: 'quests_5',
                title: 'Quest Seeker',
                description: 'Completed 5 quests',
                icon: '🎯',
                points: 25
            });
        }

        if (totalCompleted >= 10 && !achievements.find(a => a.id === 'quests_10')) {
            newAchievements.push({
                id: 'quests_10',
                title: 'Adventure Master',
                description: 'Completed 10 quests',
                icon: '⭐',
                points: 50
            });
        }

        // Add new achievements
        if (newAchievements.length > 0) {
            setAchievements(prev => [...prev, ...newAchievements]);
            const bonusPoints = newAchievements.reduce((sum, ach) => sum + ach.points, 0);
            setPoints(prev => prev + bonusPoints);
        }
    };

    const updateLocation = (location) => {
        setCurrentLocation(location);
        setLocationHistory(prev => {
            const newHistory = [{
                ...location,
                timestamp: new Date().toISOString()
            }, ...prev];
            return newHistory.slice(0, 50); // Keep last 50 locations
        });
    };

    const addQuest = (newQuest) => {
        setQuests(prev => [...prev, newQuest]);
    };

    const value = { 
        points, 
        completedQuests, 
        collectedStamps, 
        quests,
        activeQuests,
        achievements,
        scannedQuests,
        locationHistory,
        currentLocation,
        completeQuest,
        addQuest, 
        collectStamp,
        handleQRScan,
        generateAIQuest,
        updateLocation
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};