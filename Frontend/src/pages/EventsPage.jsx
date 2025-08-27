// import React from "react";
// import { upcomingEvents } from "../data/events";
// import "../styles/EventsPage.css";

// const EventsPage = () => {
//   return (
//     <div className="container eventsPage">
//       <h1>Current & Upcoming Events</h1>
//       <p>
//         Immerse yourself in the vibrant culture of Sabah. Here's what's
//         happening!
//       </p>
//       <div className="eventList">
//         {upcomingEvents.map((event) => (
//           <div key={event.id} className="eventCard">
//             <div className="eventInfo">
//               <span className="eventDate">{event.date}</span>
//               <h2 className="eventTitle">{event.title}</h2>
//               <p className="eventLocation">{event.location}</p>
//               <p className="eventDescription">{event.description}</p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default EventsPage;

import React from "react";
import { Link } from "react-router-dom";
import { upcomingEvents } from "../data/events";
import { FaArrowRight } from "react-icons/fa"; // Import the arrow icon
import "../styles/EventsPage.css";

const EventsPage = () => {
  return (
    <div className="container eventsPage">
      <h1>Current & Upcoming Events</h1>
      <p>
        Immerse yourself in the vibrant culture of Sabah. Here's what's
        happening!
      </p>
      <div className="eventList">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="eventCard">
            {/* Main content area */}
            <div className="eventInfo">
              <span className="eventDate">{event.date}</span>
              <h2 className="eventTitle">{event.title}</h2>
              <p className="eventLocation">{event.location}</p>
              <p className="eventDescription">{event.description}</p>
            </div>
            {/* "See More" link navigates to detail page */}
            <Link to={`/events/${event.id}`} className="readMore">
              See More <FaArrowRight size="0.8em" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
