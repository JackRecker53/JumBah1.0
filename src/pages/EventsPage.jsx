import React from 'react';
import { upcomingEvents } from '../data/events';
import styles from '../styles/EventsPage.module.css'; // Create this file

const EventsPage = () => {
    return (
        <div className={`container ${styles.eventsPage}`}>
            <h1>Current & Upcoming Events</h1>
            <p>Immerse yourself in the vibrant culture of Sabah. Here's what's happening!</p>
            <div className={styles.eventList}>
                {upcomingEvents.map(event => (
                    <div key={event.id} className={styles.eventCard}>
                        <div className={styles.eventInfo}>
                            <span className={styles.eventDate}>{event.date}</span>
                            <h2 className={styles.eventTitle}>{event.title}</h2>
                            <p className={styles.eventLocation}>{event.location}</p>
                            <p className={styles.eventDescription}>{event.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventsPage;