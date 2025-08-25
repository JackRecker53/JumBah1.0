import React from "react";
import "../styles/AboutPage.css";

const AboutPage = () => {
  return (
    <div className="container aboutPage">
      <header className="header">
        <h1>About JumBah</h1>
      </header>
      <section className="content">
        <div className="about-section">
          <img
            src="/backgrounds/MountKinabalu.png"
            alt="Mount Kinabalu in Sabah"
            className="section-image"
          />
          <h2>Geography</h2>
          <p>
            Located on the northern part of the island of Borneo, Sabah is the
            second largest state in Malaysia. It shares a border with Sarawak to
            the southwest and Kalimantan, Indonesia to the south. Sabah's
            coastline is washed by the South China, Sulu, and Celebes seas. The
            state's landscape is a mix of mountainous regions, coastal plains, and
            lush tropical rainforests. The Crocker Range, running through the
            heart of Sabah, is home to Mount Kinabalu, the highest peak in
            Malaysia and Southeast Asia, standing at 4,095 meters. The
            Kinabatangan River, the longest in Sabah, flows from the Crocker Range
            to the Sulu Sea.
          </p>
        </div>

        <div className="about-section">
          <img
            src="/adventure/Tanjung%20Aru.jpg"
            alt="Tanjung Aru beach"
            className="section-image"
          />
          <h2>Area and Climate</h2>
          <p>
            Sabah covers an area of approximately 73,619 square kilometers. It
            enjoys a warm tropical climate with temperatures generally ranging
            from 23°C to 32°C. Known as the "Land Below the Wind," Sabah is
            situated south of the typhoon belt, making it generally free from
            major climatic disturbances. The state experiences a wet season from
            November to April and a drier season from May to October, although
            rainfall is common year-round.
          </p>
        </div>

        <div className="about-section">
          <img
            src="/adventure/Muzium%20Sabah.jpg"
            alt="Sabah State Museum"
            className="section-image"
          />
          <h2>History and Economy</h2>
          <p>
            Sabah's history dates back over 20,000 years, with evidence of early
            human settlements. Before the 15th century, it was influenced by the
            Srivijaya and Majapahit empires. Later, it became part of the
            Sultanates of Brunei and Sulu. In the late 19th century, the British
            North Borneo Company was established, and the territory became a
            British protectorate. After World War II, it became a British Crown
            Colony. On September 16, 1963, Sabah joined with Malaya, Sarawak, and
            Singapore to form the Federation of Malaysia. Sabah's economy has
            traditionally been reliant on the export of natural resources. Today,
            its key economic sectors are agriculture (especially palm oil),
            tourism, and manufacturing. Eco-tourism is a major contributor, with
            attractions like Mount Kinabalu, Sipadan Island, and numerous wildlife
            conservation areas.
          </p>
        </div>

        <div className="about-section">
          <img
            src="/adventure/sabah-art-gallery.jpg"
            alt="Sabah Art Gallery"
            className="section-image"
          />
          <h2>People and Culture</h2>
          <p>
            Sabah is a vibrant multicultural state with over 30 different ethnic
            groups and more than 80 local dialects. The largest indigenous groups
            are the Kadazan-Dusun, Bajau, and Murut. There is also a significant
            Chinese population. The total population of Sabah is estimated to be
            around 3.4 million people. This cultural diversity is reflected in the
            state's unique blend of traditions, festivals, languages, and food.
            The Kaamatan Harvest Festival, celebrated by the Kadazan-Dusun, is one
            of the most significant cultural events in Sabah.
          </p>
        </div>

        <div className="about-section">
          <img
            src="/adventure/mari2%20cv.jpg"
            alt="Mari Mari Cultural Village"
            className="section-image"
          />
          <h2>Official Religion</h2>
          <p>
            The official religion of Sabah is Islam. However, other religions,
            including Christianity, Buddhism, and Hinduism, are widely and freely
            practiced.
          </p>
        </div>

        <div className="about-section">
          <img
            src="/adventure/kinabatangan%20river%20cruise.jpg"
            alt="Kinabatangan River Cruise"
            className="section-image"
          />
          <h2>National Language</h2>
          <p>
            The official language is Bahasa Melayu (Malay), which is widely
            spoken. English is also commonly used, especially in business and
            tourism. The various indigenous groups also speak their own languages
            and dialects.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

// TRY OUT CODE BELOW ABOVE IS ORIGINAL
