import { useParams } from 'react-router-dom';
import { districts } from '../data/attractions';
import styles from '../styles/ExplorePage.module.css';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';

const ExplorePage = () => {
    const { districtName } = useParams();
    const formattedName = districtName.replace(/-/g, ' ');
    const district = districts[formattedName];
    const { isAuthenticated } = useAuth();
    const { collectStamp, collectedStamps } = useGame();

    if (!district) {
        return <div className="container"><h2>District not found!</h2></div>;
    }

    return (
        <div className={styles.explorePage}>
            <header className={styles.header} style={{ backgroundImage: `url(${district.attractions[1].image})` }}>
                <div className={styles.headerOverlay}></div>
                <div className={styles.headerContent}>
                    <h1>{formattedName}</h1>
                    <p>{district.description}</p>
                </div>
            </header>
            
            <div className="container">
                <section>
                    <h2 className={styles.sectionTitle}>Key Attractions</h2>
                    <div className={styles.attractionsGrid}>
                        {district.attractions.map(attraction => (
                            <div key={attraction.name} className={styles.attractionCard}>
                                <img src={attraction.image} alt={attraction.name} />
                                <div className={styles.cardContent}>
                                    <h3>{attraction.name}</h3>
                                    <p>{attraction.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                <section>
                    <h2 className={styles.sectionTitle}>Digital Stamps</h2>
                    <div className={styles.stampsGrid}>
                        {district.stamps.map(stamp => (
                            <div key={stamp.id} className={styles.stampCard}>
                                <h3>{stamp.name}</h3>
                                <p>Location: {stamp.location}</p>
                                {isAuthenticated ? (
                                    <button 
                                        onClick={() => collectStamp(stamp.id)} 
                                        disabled={collectedStamps.has(stamp.id)}
                                        className={styles.stampButton}
                                    >
                                        {collectedStamps.has(stamp.id) ? 'Collected!' : 'Collect Stamp (Simulate Scan)'}
                                    </button>
                                ) : (
                                    <p className={styles.loginPrompt}>Log in to collect stamps!</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ExplorePage;