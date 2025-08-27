import React from "react";
import { Link } from "react-router-dom";
import { upcomingEvents } from "../data/events";
import { FaArrowRight } from "react-icons/fa";
import WeatherWidget from "../components/WeatherWidget";

// Import Swiper React components and modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Import local styles and data
import "../styles/HomePage.css";
import { districts } from "../data/attractions";

const HomePage = () => {
  const districtList = Object.keys(districts);

  return (
    <div className="homePage full-height-page">
      {/* --- Hero Section --- */}
      <header className="heroSection">
        <div className="heroOverlay"></div>
        <div className="heroContent">
          <h1>Welcome to Sabah, Land Below the Wind</h1>
          <p>Your unforgettable adventure starts with JumBah!</p>
          <Link to="/adventure" className="btn-primary">
            Start Your Adventure
          </Link>
        </div>
        <WeatherWidget />
      </header>

      {/* --- Explore Districts Section --- */}
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
    </div>
  );
};

export default HomePage;
