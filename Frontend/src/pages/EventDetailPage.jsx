import React from "react";
import { useParams, Link } from "react-router-dom";
import { upcomingEvents } from "../data/events";
import "../styles/EventDetailPage.css";

const EventDetailPage = () => {
  const { id } = useParams();
  const event = upcomingEvents.find((e) => e.id === Number(id));

  if (!event) {
    return (
      <div className="container eventDetail">
        <p>Event not found.</p>
        <Link to="/events" className="backLink">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="container eventDetail">
      <h1>{event.title}</h1>
      <img src={event.image} alt={event.title} className="eventImage" />
      <p className="eventDate">{event.date}</p>
      <p className="eventLocation">{event.exactLocation}</p>
      <p className="eventHistory">{event.history}</p>
      <div className="eventActivities">
        <h2>Activities</h2>
        <ul>
          {event.activities.map((activity, index) => (
            <li key={index}>{activity}</li>
          ))}
        </ul>
      </div>
      <p className="eventPrice"><strong>Price:</strong> {event.price}</p>
      <p className="eventDressCode"><strong>Dress Code:</strong> {event.dressCode}</p>
      <Link to="/events" className="backLink">
        Back to Events
      </Link>
    </div>
  );
};

export default EventDetailPage;
