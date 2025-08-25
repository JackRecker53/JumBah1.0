import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useGame } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";
import "../styles/ExplorePage.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ExplorePage = () => {
  const [districts, setDistricts] = useState({});
  const { districtName } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const attractionQuery = searchParams.get("attraction");
  const formattedName = districtName.replace(/-/g, " ");
  const districtData = districts[formattedName];
  const { isAuthenticated } = useAuth();
  const { collectStamp, collectedStamps } = useGame();

  useEffect(() => {
    fetch(`${API_BASE}/attractions`)
      .then((res) => res.json())
      .then((data) => setDistricts(data))
      .catch((err) => console.error("Failed to load attractions", err));
  }, []);

  // Find the attraction if query param is present
  const foundAttraction =
    attractionQuery && districtData
      ? districtData.attractions.find(
          (a) => a.name.toLowerCase() === attractionQuery.toLowerCase()
        )
      : null;

  if (Object.keys(districts).length === 0) {
    return (
      <div className="container">
        <h2>Loading attractions...</h2>
      </div>
    );
  }

  if (!districtData) {
    return (
      <div className="container">
        <h2>District not found!</h2>
      </div>
    );
  }

  return (
    <div className="explorePage">
      <header
        className="header"
        style={{ backgroundImage: `url(${districtData.attractions[0].image})` }}
      >
        <div className="headerOverlay"></div>
        <div className="headerContent">
          <h1>{formattedName}</h1>
          <p>{districtData.description}</p>
        </div>
      </header>

      <div className="container">
        <section>
          <h2 className="sectionTitle">Key Attractions</h2>
          <div className="attractionsGrid">
            {/* If an attraction is searched, show only that card */}
            {foundAttraction ? (
              <div
                key={foundAttraction.name}
                className="attractionCard highlight"
              >
                <img src={foundAttraction.image} alt={foundAttraction.name} />
                <div className="cardContent">
                  <h3>{foundAttraction.name}</h3>
                  <p>{foundAttraction.desc}</p>
                </div>
              </div>
            ) : (
              districtData.attractions.map((attraction) => (
                <div key={attraction.name} className="attractionCard">
                  <img src={attraction.image} alt={attraction.name} />
                  <div className="cardContent">
                    <h3>{attraction.name}</h3>
                    <p>{attraction.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="sectionTitle">Digital Stamps</h2>
          <div className="stampsGrid">
            {districtData.stamps.map((stamp) => (
              <div key={stamp.id} className="stampCard">
                <h3>{stamp.name}</h3>
                <p>Location: {stamp.location}</p>
                {isAuthenticated ? (
                  <button
                    onClick={() => collectStamp(stamp.id)}
                    disabled={collectedStamps.has(stamp.id)}
                    className="stampButton"
                  >
                    {collectedStamps.has(stamp.id)
                      ? "Collected!"
                      : "Collect Stamp (Simulate Scan)"}
                  </button>
                ) : (
                  <p className="loginPrompt">Log in to collect stamps!</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExplorePage;
