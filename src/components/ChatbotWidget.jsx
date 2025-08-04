import { useState } from 'react';
import styles from '../styles/Chatbot.module.css';
import { runChat } from '../services/geminiService';
import { FaCommentDots, FaPaperPlane, FaTimes, FaSpinner } from 'react-icons/fa';
import { useGame } from '../contexts/GameContext';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { completeQuest, completedQuests } = useGame();

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen && messages.length === 0) {
            setMessages([
                { sender: 'bot', text: "Hello! I'm Madu, your Sabahan sun bear guide. How can I help you plan your adventure?" }
            ]);
        }
    };

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponse = await runChat(input);
            const botMessage = { sender: 'bot', text: botResponse };
            setMessages(prev => [...prev, botMessage]);
            
            // Gamification hook
            if (!completedQuests.has('q2')) completeQuest('q2');
            if (input.toLowerCase().includes('how to say') && !completedQuests.has('q4')) {
                completeQuest('q4');
            }

        } catch (error) {
            const errorMessage = { sender: 'bot', text: "Oops! I'm having a little trouble connecting. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <button className={styles.fab} onClick={toggleOpen} aria-label="Open Chatbot">
                 {isOpen ? <FaTimes /> : <img src="public\backgrounds\madu-icon.png" alt="Madu Chat" style={{ width: '40px', height: '40px' }} />}
            </button>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <h3>Chat with Madu</h3>
                        <button onClick={toggleOpen}><FaTimes /></button>
                    </div>
                    <div className={styles.chatBody}>
                        {messages.map((msg, index) => (
                            <div key={index} className={`${styles.message} ${styles[msg.sender]}`}>
                                {msg.text}
                            </div>
                        ))}
                         {isLoading && <div className={`${styles.message} ${styles.bot}`}><FaSpinner className={styles.spinner} /></div>}
                    </div>
                    <div className={styles.chatInput}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about your trip..."
                        />
                        <button onClick={handleSend}><FaPaperPlane /></button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatbotWidget;