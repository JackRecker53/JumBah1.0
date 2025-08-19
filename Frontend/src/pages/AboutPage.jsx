import React from "react";
import "../styles/AboutPage.css";

const AboutPage = () => {
  return (
    <div className="container aboutPage">
      <header className="header">
        <h1>About JumBah</h1>
      </header>
      <section className="content">
        <h2>Our Mission</h2>
        <p>
          "JumBah", it is a friendly local invitation meaning "Let's Go!" It was
          born from a love for Sabah's rich culture, breathtaking nature, and
          warm hospitality. Our mission is to create a seamless, enriching, and
          fun travel experience for every tourist. We aim to be the single,
          trusted platform where visitors can immerse themselves in Sabahan
          culture, and local vendors can proudly showcase their unique
          offerings.
        </p>

        <h2>What We Do</h2>
        <p>
          We connect tourists directly with certified local businesses—from cozy
          homestays and bustling cafes to unique gift shops and thrilling
          events. By leveraging AI through our friendly chatbot, Madu, the
          Sabah's sunbear, we offer personalized itineraries, cultural insights,
          and even language help. The gamified elements like quests and stamp
          collections are designed to make exploration more interactive and
          rewarding.
        </p>

        <h2>To be recognized and certified by Sabah Tourism Board </h2>
        <p>
          Trust and authenticity are at our core. We work closely with the Sabah
          Tourism Board website and catch up with their latest events that
          ensure all listings and information on our platform are verified and
          of high quality, giving you peace of mind as you plan your adventure
          in the Land Below the Wind.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
