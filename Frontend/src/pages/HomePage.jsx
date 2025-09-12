import React from "react";
import { Link } from "react-router-dom";
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
import heroImage from "/backgrounds/MountKinabalu.png";

const HomePage = () => {
  const districtList = Object.keys(districts);

  return (
    <div className="homePage full-height-page">
      {/* --- Hero Section --- */}
      <header
        className="heroSection"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
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
      <section class="aboutSection">
        <div class="aboutContainer">
          <div class="aboutText">
            <h2>About Us</h2>
            <p>
              At JumBah, we turn exploring Sabah into an adventure. Discover
              attractions, culture, and events through an interactive, gamified
              journey where you can complete challenges, earn rewards, and
              redeem prizes at the Departure Gate. Our mission is to make
              Sabah’s beauty and traditions more accessible while creating fun,
              meaningful, and unforgettable travel experiences. With JumBah,
              exploring isn’t just travel — it’s about playing, learning, and
              connecting with Sabah like never before.
            </p>
          </div>

          <div class="aboutImageWrapper">
            <img
              src="/adventure/sabah page.jpeg"
              alt="About Jumbah"
              class="aboutUs"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
