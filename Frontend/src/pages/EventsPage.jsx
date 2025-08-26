/* global Splide */
import React, { useEffect, useRef } from "react";
import { upcomingEvents } from "../data/events";
import "../styles/EventsPage.css";

const EventsPage = () => {
  const splideRef = useRef(null);

  useEffect(() => {
    if (splideRef.current) {
      const splide = new Splide(splideRef.current, {
        type: "loop",
        perPage: 3,
        gap: "1rem",
        breakpoints: {
          1024: { perPage: 2 },
          640: { perPage: 1 },
        },
      });
      splide.mount();
    }
  }, []);

  return (
    <div className="container eventsPage">
      <h1>Current & Upcoming Events</h1>
      <p>
        Immerse yourself in the vibrant culture of Sabah. Here's what's happening!
      </p>
      <div className="splide" ref={splideRef}>
        <div className="splide__track">
          <ul className="splide__list">
            {upcomingEvents.map((event) => (
              <li key={event.id} className="splide__slide">
                <div className="eventCard">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="eventImage"
                  />
                  <div className="eventInfo">
                    <span className="eventDate">{event.date}</span>
                    <h2 className="eventTitle">{event.title}</h2>
                    <p className="eventLocation">{event.location}</p>
                    <p className="eventDescription">{event.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
