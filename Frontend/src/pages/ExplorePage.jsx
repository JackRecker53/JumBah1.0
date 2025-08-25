import { useLocation, useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
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
  Ranau: {
    description: "Home to Mount Kinabalu and beautiful highland scenery.",
    attractions: [
      {
        name: "Mount Kinabalu",
        desc: "Malaysia's highest peak and a UNESCO World Heritage Site.",
        image: "/jumbah image/ranau-kinabalu.jpg",
      },
      // Add more attractions as needed
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
      },
      // Add more attractions as needed
    ],
    stamps: [
      { id: 12, name: "Sepilok Stamp", location: "Sepilok Orangutan Centre" },
    ],
  },
};

const getDistrictKey = (districtNameParam) => {
  // Try exact match first
  if (districts[districtNameParam]) return districtNameParam;
  // Try replacing hyphens with spaces and capitalizing each word
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
  const { isAuthenticated } = useAuth();
  const { collectStamp, collectedStamps } = useGame();

  // If no districtName, show all districts
  if (!districtName) {
    return (
      <div className="explore-list">
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

  // Fix: Use getDistrictKey to handle capitalization and hyphens
  const districtKey = getDistrictKey(districtName);
  const districtData = districtKey ? districts[districtKey] : null;

  if (!districtData) {
    return <div>District not found.</div>;
  }

  // Find the attraction if query param is present
  const foundAttraction =
    attractionQuery && districtData
      ? districtData.attractions.find(
          (a) => a.name.toLowerCase() === attractionQuery.toLowerCase()
        )
      : null;

  // FIX: Use districtKey for the title instead of undefined formattedName
  return (
    <div className="explore-details">
      <h2>{districtKey}</h2>
      <p>{districtData.description}</p>
      <h3>Attractions</h3>
      <ul>
        {districtData.attractions.map((a) => (
          <li key={a.name}>
            <img src={a.image} alt={a.name} style={{ width: "120px" }} />
            <strong>{a.name}</strong>: {a.desc}
          </li>
        ))}
      </ul>
      <h3>Stamps</h3>
      <ul>
        {districtData.stamps.map((s) => (
          <li key={s.id}>
            {s.name} ({s.location})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExplorePage;
