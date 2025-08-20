import { useParams, useLocation } from "react-router-dom";
// Embedded districts data
const districts = {
  "Kota Kinabalu": {
    description:
      "Capital city of Sabah, known for its vibrant markets and waterfront.",
    attractions: [
      {
        name: "Gaya Street",
        desc: "Famous Sunday market with local food, crafts, and souvenirs.",
        image: "/jumbah image/gaya street.JPG",
      },
      {
        name: "Signal Hill Observatory",
        desc: "Best city view and sunset spot in Kota Kinabalu.",
        image: "/jumbah image/gunung kinabalu.jpg",
      },
      {
        name: "Sabah Art Gallery",
        desc: "Modern art museum showcasing local artists.",
        image: "/jumbah image/sabah-art-gallery.jpg",
      },
      {
        name: "Muzium Sabah",
        desc: "Museum of Sabah's history and culture.",
        image: "/jumbah image/Muzium Sabah.jpg",
      },
      {
        name: "Tanjung Aru Beach",
        desc: "Popular beach for sunset and picnics.",
        image: "/jumbah image/Tanjung Aru.jpg",
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
        image: "/jumbah image/kinabatangan river cruise.jpg",
      },
      {
        name: "Poring Hot Springs",
        desc: "Natural hot springs and canopy walk.",
        image: "/jumbah image/poring2.jpg",
      },
      {
        name: "Mari Mari Cultural Village",
        desc: "Experience traditional Sabahan culture and food.",
        image: "/jumbah image/mari2 cv.jpg",
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
        image: "/jumbah image/pulau sipadan.jpg",
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
        image: "/jumbah image/tawau hills.jfif",
      },
    ],
    stamps: [
      { id: 10, name: "Tawau Hills Stamp", location: "Tawau Hills Park" },
    ],
  },
};
import { useGame } from "../contexts/GameContext";
import { useAuth } from "../contexts/AuthContext";
import "../styles/ExplorePage.css";

const ExplorePage = () => {
  const { districtName } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const district = searchParams.get("district");
  const attractionQuery = searchParams.get("attraction");
  const formattedName = districtName.replace(/-/g, " ");
  const districtData = districts[formattedName];
  const { isAuthenticated } = useAuth();
  const { collectStamp, collectedStamps } = useGame();
  // Find the attraction if query param is present
  const foundAttraction =
    attractionQuery && districtData
      ? districtData.attractions.find(
          (a) => a.name.toLowerCase() === attractionQuery.toLowerCase()
        )
      : null;

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
        style={{ backgroundImage: `url(${districtData.attractions[1].image})` }}
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
