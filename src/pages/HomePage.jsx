import "../styles/HomePage.css";
import { Link } from "react-router-dom";
import { districts } from "../data/attractions";
import { upcomingEvents } from "../data/events";
import { FaArrowRight } from "react-icons/fa";

// Import Swiper for sliding feature (run: npm install swiper)
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const HomePage = () => {
  const districtList = Object.keys(districts);

  return (
    <div className="homePage">
      {/* Hero Section */}
      <div
        className="heroSection"
        style={{ backgroundImage: `url('/backgrounds/MountKinabalu.png')` }}
      >
        <div className="heroOverlay"></div>
        <div className="heroContent">
          <h1>Welcome to Sabah, Land Below the Wind</h1>
          <p>
            Your unforgettable adventure starts with JumBah. Let's explore guys!
            🗺️
          </p>
          <Link to="/adventure" className="btn-primary">
            Start Your Adventure
          </Link>
        </div>
      </div>

      {/* Explore Districts Section */}
      <section className="section container">
        <h2 className="sectionTitle">Explore Our Districts</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {districtList.map((name) => (
            <SwiperSlide key={name}>
              <Link
                to={`/explore/${name.replace(/\s+/g, "-")}`}
                className="districtCard"
              >
                <img src={districts[name].attractions[0].image} alt={name} />
                <div className="cardOverlay">
                  <h3>{name}</h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Upcoming Events Section */}
      <section className="section eventsSection container">
        <h2 className="sectionTitle">Upcoming Events</h2>
        <div className="eventList">
          {upcomingEvents.slice(0, 3).map((event) => (
            <div key={event.id} className="eventCard">
              <div className="eventDate">{event.date}</div>
              <h3 className="eventTitle">{event.title}</h3>
              <p className="eventLocation">{event.location}</p>
              <Link to="/events" className="readMore">
                See More <FaArrowRight />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
