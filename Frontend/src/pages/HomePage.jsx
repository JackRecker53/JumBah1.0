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
      <header className="heroSection">
        <div className="heroOverlay"></div>
        <div className="heroContent">
          <h1>Welcome to Sabah, Land Below the Wind</h1>
          <p>Your unforgettable adventure starts with JumBah!</p>
          <Link to="/adventure" className="btn-primary">
            Start Your Adventure
          </Link>
        </div>
      </header>

      {/* Sabah Highlights Section */}
      <section className="section highlightsSection container">
        <h2 className="sectionTitle">Top Sabah Highlights</h2>
        <div className="highlightsGrid">
          <div className="highlightCard">
            <img
              src="/jumbah image/gunung kinabalu.jpg"
              alt="Mount Kinabalu"
            />
            <h3>Mount Kinabalu</h3>
            <p>Climb Southeast Asia's highest peak for sunrise views.</p>
          </div>
          <div className="highlightCard">
            <img src="/jumbah image/pulau sipadan.jpg" alt="Sipadan Island" />
            <h3>Sipadan Island</h3>
            <p>Dive into crystal waters filled with turtles and barracudas.</p>
          </div>
          <div className="highlightCard">
            <img
              src="/jumbah image/kinabatangan river cruise.jpg"
              alt="Kinabatangan River"
            />
            <h3>Kinabatangan River</h3>
            <p>Spot orangutans and proboscis monkeys along the riverbanks.</p>
          </div>
        </div>
      </section>

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
