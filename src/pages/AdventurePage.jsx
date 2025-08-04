import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { quests } from '../data/quests';
import styles from '../styles/AdventurePage.module.css';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaAward, FaTicketAlt } from 'react-icons/fa';

const AdventurePage = () => {
    const { isAuthenticated } = useAuth();
    const { points, completedQuests, collectedStamps } = useGame();

    if (!isAuthenticated) {
        return (
            <div className={`container ${styles.loginWall}`}>
                <h2>Join the Adventure!</h2>
                <p>Log in or create an account to track your quests, earn points, and collect stamps!</p>
                <Link to="/login" className="btn-primary">Login to Begin</Link>
            </div>
        );
    }
    
    return (
        <div className={`container ${styles.adventurePage}`}>
            <header className={styles.header}>
                <h1>Your Adventure Hub</h1>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <FaAward size={30} className={styles.icon} />
                        <span>{points} Points</span>
                    </div>
                    <div className={styles.statItem}>
                        <FaTicketAlt size={30} className={styles.icon} />
                        <span>{collectedStamps.size} Stamps</span>
                    </div>
                </div>
            </header>

            <div className={styles.contentGrid}>
                {/* Quests Section */}
                <div className={styles.section}>
                    <h2>Quests</h2>
                    <ul className={styles.questList}>
                        {quests.map(quest => (
                            <li key={quest.id} className={`${styles.questItem} ${completedQuests.has(quest.id) ? styles.completed : ''}`}>
                                <div className={styles.questInfo}>
                                    <h3>{quest.title}</h3>
                                    <p>{quest.description}</p>
                                </div>
                                <div className={styles.questReward}>
                                    {completedQuests.has(quest.id) ? 
                                        <FaCheckCircle size={24} className={styles.checkIcon} /> : 
                                        <span>{quest.points} pts</span>
                                    }
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Badges/Achievements Section */}
                <div className={styles.section}>
                    <h2>Achievements</h2>
                    <p className={styles.comingSoon}>More exciting badges and achievements are coming soon!</p>
                </div>
            </div>
        </div>
    );
};

export default AdventurePage;