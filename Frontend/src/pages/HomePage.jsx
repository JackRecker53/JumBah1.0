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
      <h2> About Jumbah </h2>
      <p>
        JumBah is a Sabah-first adventure platform that turns your journey into
        a game, inviting you to discover districts, culture, food, and festivals
        through interactive quests and location-based challenges. Its purpose is
        to help you explore Sabah in a playful, meaningful way—unlocking
        stories, earning points and badges, and supporting local communities as
        you go. Finish quests, rack up milestones, and you’ll redeem prizes at
        the departure gate, giving your trip a rewarding finale before you fly.
        With JumBah, every step becomes an adventure—and every adventure comes
        with real-world rewards.
      </p>
      <img
        src="Frontend/public/backgrounds/WhatsApp Image 2025-09-04 at 14.50.23.jpeg"
        alt="Collage for homepage 1"
        className="About JumBah"
      />
      <br></br>
      <h2> Meet Us </h2>
      <p>
        JumBah is built by a Sabah-rooted team of designers, developers, and
        cultural storytellers who turn the whole state into a playable
        adventure. We co-create quests with local communities and tourism
        partners so every challenge feels authentic, respectful, and fun. Our
        tech crew crafts smooth UX and location-smart gameplay; our field team
        curates real stories, food, and festivals. Together, we champion
        sustainable, inclusive travel—so players explore deeper, support locals,
        and finish with real rewards at the departure gate.
      </p>
      <img
        src="Frontend\public\backgrounds\WhatsApp Image 2025-09-04 at 14.42.46.jpeg"
        alt="Collage for homepage 2"
        className="About JumBah"
      />
    </div>
  );
};

export default HomePage;
