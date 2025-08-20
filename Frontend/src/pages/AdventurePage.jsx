import React from "react";
import { useParams, useLocation } from "react-router-dom";
import "../App.css";

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
  },
};

const AdventurePage = () => {
  const location = useLocation();
  const { districtName } = useParams();
  const searchParams = new URLSearchParams(location.search);
  const district = searchParams.get("district");
  const attractionQuery = searchParams.get("attraction");
  const formattedName = districtName
    ? districtName.replace(/-/g, " ")
    : "Kota Kinabalu";
  const districtData = districts[formattedName];
  const foundAttraction =
    attractionQuery && districtData
      ? districtData.attractions.find(
          (a) => a.name.toLowerCase() === attractionQuery.toLowerCase()
        )
      : null;

  // Itinerary state
  const [itinerary, setItinerary] = React.useState([]);

  // Add/remove attraction to itinerary
  const toggleItinerary = (attraction) => {
    setItinerary((prev) => {
      if (prev.some((a) => a.name === attraction.name)) {
        return prev.filter((a) => a.name !== attraction.name);
      } else {
        return [...prev, attraction];
      }
    });
  };

  // Calculate total price
  const totalPrice = itinerary.reduce((sum, a) => sum + (a.price || 0), 0);

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(
          <span key={i} style={{ color: "#FFD700" }}>
            ★
          </span>
        );
      } else if (rating > i - 1) {
        stars.push(
          <span key={i} style={{ color: "#FFD700" }}>
            ☆
          </span>
        );
      } else {
        stars.push(
          <span key={i} style={{ color: "#ccc" }}>
            ☆
          </span>
        );
      }
    }
    return stars;
  };

  if (!districtData) {
    return (
      <div className="container">
        <h2>District not found!</h2>
      </div>
    );
  }

  // --- EDIT THIS VARIABLE TO CHANGE THE MAIN HEADER TEXT ---
  const mainHeaderText = `${formattedName.toUpperCase()} PLACES`;

  return (
    <div className="explorePage">
      <header
        className="header"
        style={{ backgroundImage: `url(${districtData.attractions[1].image})` }}
      >
        <div className="headerOverlay"></div>
        <div className="headerContent">
          <h1>{mainHeaderText}</h1>
          <p>{districtData.description}</p>
        </div>
      </header>

      <div className="container">
        <section>
          <h2 className="sectionTitle">All Places</h2>
          <div
            className="attractionsGrid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "32px",
              justifyItems: "center",
              margin: "32px 0 24px 0",
            }}
          >
            {(foundAttraction
              ? [foundAttraction]
              : districtData.attractions
            ).map((attraction) => (
              <div
                key={attraction.name}
                className="attractionCard"
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  padding: "24px 18px 18px 18px",
                  maxWidth: "320px",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "box-shadow 0.2s",
                }}
              >
                <img
                  src={attraction.image}
                  alt={attraction.name}
                  style={{
                    width: "220px",
                    height: "140px",
                    objectFit: "cover",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                    marginBottom: "16px",
                  }}
                />
                <div
                  className="cardContent"
                  style={{ textAlign: "center", width: "100%" }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "700",
                      color: "#0484D6",
                      marginBottom: "8px",
                    }}
                  >
                    {attraction.name}
                  </h3>
                  <p style={{ color: "#444", marginBottom: "10px" }}>
                    {attraction.desc}
                  </p>
                  <div style={{ margin: "8px 0", fontWeight: "500" }}>
                    <strong>Price:</strong>{" "}
                    {attraction.price === 0 ? "Free" : `RM ${attraction.price}`}
                  </div>
                  <div style={{ marginBottom: "10px" }}>
                    <strong>Rating:</strong> {renderStars(attraction.rating)}
                    <span
                      style={{
                        fontSize: "0.9em",
                        color: "#888",
                        marginLeft: "4px",
                      }}
                    >
                      ({attraction.rating})
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <button
                      style={{
                        padding: "6px 14px",
                        borderRadius: "6px",
                        border: "none",
                        background: itinerary.some(
                          (a) => a.name === attraction.name
                        )
                          ? "#f44336"
                          : "#e0e0e0",
                        color: itinerary.some((a) => a.name === attraction.name)
                          ? "#fff"
                          : "#333",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                      }}
                      onClick={() => toggleItinerary(attraction)}
                    >
                      {itinerary.some((a) => a.name === attraction.name)
                        ? "Remove from Itinerary"
                        : "Add to Itinerary"}
                    </button>
                    <button
                      style={{
                        background:
                          "linear-gradient(90deg,#0484D6 60%,#00c6fb 100%)",
                        color: "#fff",
                        padding: "6px 18px",
                        borderRadius: "6px",
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
                      }}
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

        {/* Itinerary Maker */}
        <section>
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
              <div style={{ marginTop: "8px" }}>
                <strong>Total Price:</strong> RM {totalPrice}
              </div>
              <button
                style={{
                  marginTop: "12px",
                  background: "#0484D6",
                  color: "#fff",
                }}
                onClick={() =>
                  window.alert(`Booking all places! Total: RM ${totalPrice}`)
                }
              >
                Book All
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdventurePage;
