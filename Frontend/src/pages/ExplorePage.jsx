import React from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import "../styles/ExplorePage.css";

// Embedded districts data
const districts = {
  "Kota Kinabalu": {
    description:
      "Capital city of Sabah, known for its vibrant markets and waterfront.",
    attractions: [
      {
        name: "Gaya Street",
        desc: "Famous Sunday market with local food, crafts, and souvenirs.",
        image: "/adventure/gaya street.JPG",
        price: 0,
        rating: 4.5,
      },
      {
        name: "Signal Hill Observatory",
        desc: "Best city view and sunset spot in Kota Kinabalu.",
        image: "/adventure/gunung kinabalu.jpg",
        price: 5,
        rating: 4.7,
      },
      {
        name: "Sabah Art Gallery",
        desc: "Modern art museum showcasing local artists.",
        image: "/adventure/sabah-art-gallery.jpg",
        price: 10,
        rating: 4.2,
      },
      {
        name: "Muzium Sabah",
        desc: "Museum of Sabah's history and culture.",
        image: "/adventure/Muzium Sabah.jpg",
        price: 8,
        rating: 4.3,
      },
      {
        name: "Tanjung Aru Beach",
        desc: "Popular beach for sunset and picnics.",
        image: "/adventure/Tanjung Aru.jpg",
        price: 0,
        rating: 4.8,
      },
    ],
    stamps: [
      { id: 1, name: "Gaya Street Stamp", location: "Gaya Street" },
      { id: 2, name: "Signal Hill Stamp", location: "Signal Hill Observatory" },
      { id: 3, name: "Art Gallery Stamp", location: "Sabah Art Gallery" },
      { id: 4, name: "Museum Stamp", location: "Muzium Sabah" },
      { id: 5, name: "Tanjung Aru Stamp", location: "Tanjung Aru Beach" },
    ],
  },
  Kinabatangan: {
    description:
      "Home to the Kinabatangan River and amazing wildlife experiences.",
    attractions: [
      {
        name: "Kinabatangan River Cruise",
        desc: "River cruise for wildlife spotting: proboscis monkeys, orangutans, and more.",
        image: "/adventure/kinabatangan river cruise.jpg",
        price: 50,
        rating: 4.9,
      },
      {
        name: "Poring Hot Springs",
        desc: "Natural hot springs and canopy walk.",
        image: "/adventure/poring2.jpg",
        price: 15,
        rating: 4.4,
      },
      {
        name: "Mari Mari Cultural Village",
        desc: "Experience traditional Sabahan culture and food.",
        image: "/adventure/mari2 cv.jpg",
        price: 30,
        rating: 4.6,
      },
    ],
    stamps: [
      { id: 6, name: "River Cruise Stamp", location: "Kinabatangan River" },
      { id: 7, name: "Poring Stamp", location: "Poring Hot Springs" },
      {
        id: 8,
        name: "Mari Mari Stamp",
        location: "Mari Mari Cultural Village",
      },
    ],
  },
  Sipadan: {
    description: "World-famous diving destination with crystal clear waters.",
    attractions: [
      {
        name: "Pulau Sipadan",
        desc: "Top diving spot in Malaysia, known for turtles and barracuda.",
        image: "/adventure/pulau sipadan.jpg",
        price: 200,
        rating: 5.0,
      },
    ],
    stamps: [{ id: 9, name: "Sipadan Stamp", location: "Pulau Sipadan" }],
  },
  Tawau: {
    description: "Gateway to Tawau Hills Park and lush rainforest.",
    attractions: [
      {
        name: "Tawau Hills Park",
        desc: "Rainforest park with waterfalls and giant trees.",
        image: "/adventure/tawau hills.jfif",
        price: 10,
        rating: 4.5,
      },
    ],
    stamps: [
      { id: 10, name: "Tawau Hills Stamp", location: "Tawau Hills Park" },
    ],
  },
  Ranau: {
    description: "Home to Mount Kinabalu and beautiful highland scenery.",
    attractions: [
      {
        name: "Mount Kinabalu",
        desc: "Malaysia's highest peak and a UNESCO World Heritage Site.",
        image: "/jumbah image/ranau-kinabalu.jpg",
        price: 0,
        rating: 4.9,
      },
    ],
    stamps: [{ id: 11, name: "Kinabalu Stamp", location: "Mount Kinabalu" }],
  },
  Sandakan: {
    description: "Known for its wildlife and conservation centers.",
    attractions: [
      {
        name: "Sepilok Orangutan Rehabilitation Centre",
        desc: "Famous for orangutan conservation and rehabilitation.",
        image: "/jumbah image/sandakan-orangutan.jpg",
        price: 30,
        rating: 4.8,
      },
    ],
    stamps: [
      { id: 12, name: "Sepilok Stamp", location: "Sepilok Orangutan Centre" },
    ],
  },
};

const getDistrictKey = (districtNameParam) => {
  if (!districtNameParam) return null;
  const formatted = districtNameParam
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return districts[formatted] ? formatted : null;
};

const ExplorePage = () => {
  const { districtName } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const attractionQuery = searchParams.get("attraction");
  const { collectStamp, collectedStamps } = useGame();

  const [itinerary, setItinerary] = React.useState([]);

  const toggleItinerary = (attraction) => {
    setItinerary((prev) => {
      if (prev.some((a) => a.name === attraction.name)) {
        return prev.filter((a) => a.name !== attraction.name);
      } else {
        return [...prev, attraction];
      }
    });
  };

  const totalPrice = itinerary.reduce((sum, a) => sum + (a.price || 0), 0);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: rating >= i ? "#FFD700" : "#ccc" }}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (!districtName) {
    return (
      <div className="explore-list container">
        <h2>Explore Sabah Districts</h2>
        <ul>
          {Object.keys(districts).map((name) => (
            <li key={name}>
              <Link to={`/explore/${name.replace(/ /g, "-")}`}>
                <strong>{name}</strong>: {districts[name].description}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const districtKey = getDistrictKey(districtName);
  const districtData = districtKey ? districts[districtKey] : null;

  if (!districtData) {
    return <div className="container">District not found.</div>;
  }

  const foundAttraction =
    attractionQuery && districtData
      ? districtData.attractions.find(
          (a) => a.name.toLowerCase() === attractionQuery.toLowerCase()
        )
      : null;

  return (
    <div className="explorePage">
      <header
        className="header"
        style={{
          backgroundImage: `url(${districtData.attractions[0]?.image})`,
        }}
      >
        <div className="headerOverlay"></div>
        <div className="headerContent">
          <h1>{districtKey} Attractions</h1>
          <p>{districtData.description}</p>
        </div>
      </header>

      <div className="container">
        <section>
          <h2 className="sectionTitle">All Places</h2>
          <div className="attractionsGrid">
            {(foundAttraction
              ? [foundAttraction]
              : districtData.attractions
            ).map((attraction) => (
              <div key={attraction.name} className="attractionCard">
                <img src={attraction.image} alt={attraction.name} />
                <div className="cardContent">
                  <h3>{attraction.name}</h3>
                  <p>{attraction.desc}</p>
                  {attraction.price !== undefined && (
                    <div className="price">
                      <strong>Price:</strong>{" "}
                      {attraction.price === 0
                        ? "Free"
                        : `RM ${attraction.price}`}
                    </div>
                  )}
                  {attraction.rating !== undefined && (
                    <div className="rating">
                      <strong>Rating:</strong> {renderStars(attraction.rating)}
                      <span>({attraction.rating})</span>
                    </div>
                  )}
                  <div className="actions">
                    <button
                      className={`add-btn ${
                        itinerary.some((a) => a.name === attraction.name)
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => toggleItinerary(attraction)}
                    >
                      {itinerary.some((a) => a.name === attraction.name)
                        ? "Remove"
                        : "Add to Itinerary"}
                    </button>
                    <button
                      className="book-btn"
                      onClick={() =>
                        window.alert(
                          `Booking for ${attraction.name} (RM ${attraction.price})`
                        )
                      }
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="itinerary-section">
          <h2 className="sectionTitle">Your Itinerary</h2>
          {itinerary.length === 0 ? (
            <p>No places added yet.</p>
          ) : (
            <div>
              <ul>
                {itinerary.map((a) => (
                  <li key={a.name}>
                    {a.name} - {a.price === 0 ? "Free" : `RM ${a.price}`}{" "}
                    {renderStars(a.rating)}
                  </li>
                ))}
              </ul>
              <div className="total-price">
                <strong>Total Price:</strong> RM {totalPrice}
              </div>
              <button
                className="book-all-btn"
                onClick={() =>
                  window.alert(`Booking all places! Total: RM ${totalPrice}`)
                }
              >
                Book All
              </button>
            </div>
          )}
        </section>

        <section className="stamps-section">
          <h2 className="sectionTitle">Stamps</h2>
          <ul>
            {districtData.stamps &&
              districtData.stamps.map((s) => (
                <li key={s.id}>
                  {s.name} ({s.location})
                </li>
              ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default ExplorePage;
