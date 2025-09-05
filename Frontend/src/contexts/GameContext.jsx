import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [points, setPoints] = useState(0);
    const [completedQuests, setCompletedQuests] = useState(new Set());
    const [collectedStamps, setCollectedStamps] = useState(new Set());
    const [quests, setQuests] = useState([]);

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
            console.log(`Quest ${questId} completed! +${quest.points} points.`);
        }
    };

    const collectStamp = (stampId) => {
       if (collectedStamps.has(stampId)) return;
       setCollectedStamps(prev => new Set(prev).add(stampId));
       setPoints(prev => prev + 50); // Add 50 points for each stamp
       console.log(`Stamp ${stampId} collected! +50 points.`);
    };

    const value = { points, completedQuests, collectedStamps, completeQuest, collectStamp, quests };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};