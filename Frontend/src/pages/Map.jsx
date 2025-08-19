import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css";

// Fix Leaflet's default icons for React; guard to avoid double-deletes during HMR
try {
  if (L.Icon?.Default?.prototype?._getIconUrl) {
    delete L.Icon.Default.prototype._getIconUrl;
  }
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
} catch {}

// Popular Sabah attractions data
const sabahAttractions = [
  {
    name: "Mount Kinabalu",
    lat: 6.0647,
    lng: 116.5621,
    description:
      "Highest mountain in Malaysia and famous for its biodiversity as it is the home to thousand of plant species, including the rare Rafflesia flower and 'The King of Orchid', Paphiopedilum rothschildianum, the rarest orchid speciin the world.",
  },
  {
    name: "Sepilok Orangutan Sanctuary",
    lat: 5.8742,
    lng: 117.9444,
    description:
      "Famous orangutan rehabilitation center that is responsible in protecting and rehabilitating orphaned orangutan while offering visitors to observe them in their natural setting.",
  },
  {
    name: "Sipadan Island",
    lat: 4.1133,
    lng: 118.6281,
    description:
      "One of the most top 10 world-class diving destination, it is abudance in marine life and coral reefs.",
  },
  {
    name: "Kinabatangan River",
    lat: 5.5167,
    lng: 118.2333,
    description:
      "Wildlife sanctuary and river cruise. The Kinabatangan River is one of the best places in Southeast Asia to see wildlife in the wild — especially orangutans, proboscis monkeys, hornbills, and pygmy elephants.",
  },
  {
    name: "Tip of Borneo",
    lat: 7.0186,
    lng: 116.6794,
    description: "Northernmost point of Borneo",
  },
  {
    name: "Mari Mari Cultural Village",
    lat: 6.0433,
    lng: 116.1133,
    description: "Traditional cultural experience",
  },
  {
    name: "Kundasang Market",
    lat: 6.0167,
    lng: 116.6,
    description: "Local market with fresh produce",
  },
  {
    name: "Maliau Basin",
    lat: 4.7333,
    lng: 116.9667,
    description: "Lost world conservation area",
  },
];

export default function Map() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [status, setStatus] = useState("Loading map...");
  const [mapLoaded, setMapLoaded] = useState(false);

  // Function to add attraction markers
  const addAttractionMarkers = () => {
    if (!mapInstanceRef.current) return;

    sabahAttractions.forEach((attraction) => {
      const marker = L.marker([attraction.lat, attraction.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<strong>${attraction.name}</strong><br/>${attraction.description}`
        )
        .on("click", () => {
          setSelectedAttraction(attraction);
          setStatus(`Selected: ${attraction.name}`);
        });
    });
  };

  // Function to center map on specific attraction
  const centerOnAttraction = (attraction) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([attraction.lat, attraction.lng], 12);
    setSelectedAttraction(attraction);
    setStatus(`Viewing: ${attraction.name}`);
  };

  // Function to reset map view
  const resetMapView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([5.9804, 116.0735], 8);
    setSelectedAttraction(null);
    setStatus("Explore popular attractions in Sabah, Malaysia");
  };

  useEffect(() => {
    // Wait a bit to ensure DOM is ready
    const timer = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        try {
          console.log("Initializing map...");

          mapInstanceRef.current = L.map(mapRef.current, {
            center: [5.9804, 116.0735],
            zoom: 8,
            zoomControl: true,
          });

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }).addTo(mapInstanceRef.current);

          // Wait for tiles to load then add markers and fix sizing
          mapInstanceRef.current.whenReady(() => {
            console.log("Map is ready, adding markers...");
            addAttractionMarkers();
            setMapLoaded(true);
            setStatus("Explore popular attractions in Sabah, Malaysia");

            // Ensure correct size after initial layout
            setTimeout(() => {
              try {
                mapInstanceRef.current?.invalidateSize(true);
              } catch {}
            }, 50);
          });
        } catch (error) {
          console.error("Error initializing map:", error);
          setStatus("Error loading map. Please refresh the page.");
        }
      }
    }, 100);

    // Handle window resize to keep map sized correctly
    const handleResize = () => {
      try {
        mapInstanceRef.current?.invalidateSize();
      } catch {}
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (error) {
          console.error("Error cleaning up map:", error);
        }
      }
    };
  }, []);

  return (
    <div className="app-container">
      {/* Control Panel */}
      <div className="panel">
        <h1>Sabah Attractions Map</h1>
        <p>Discover amazing places to visit in Sabah, Malaysia</p>

        <div className="status">{status}</div>

        {selectedAttraction && (
          <div className="location-info">
            <h3>{selectedAttraction.name}</h3>
            <p>{selectedAttraction.description}</p>
            <p>
              <strong>Coordinates:</strong> {selectedAttraction.lat.toFixed(4)},{" "}
              {selectedAttraction.lng.toFixed(4)}
            </p>
          </div>
        )}

        <div className="attractions-list">
          <h3>Popular Attractions</h3>
          {sabahAttractions.map((attraction, index) => (
            <button
              key={index}
              className="attraction-btn"
              onClick={() => centerOnAttraction(attraction)}
              disabled={!mapLoaded}
            >
              {attraction.name}
            </button>
          ))}
        </div>

        <div className="button-group">
          <button
            className="reset-btn"
            onClick={resetMapView}
            disabled={!mapLoaded}
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        id="map"
        className="map-container"
        style={{ width: "100%", height: "100%" }}
      >
        {!mapLoaded && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              background: "#f8f9fa",
              color: "#666",
            }}
          >
            Loading map...
          </div>
        )}
      </div>
    </div>
  );
}
