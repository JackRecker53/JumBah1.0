import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css";

// Leaflet's default icon path can break in React. This fixes it.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Popular Sabah attractions data
const sabahAttractions = [
  {
    name: "Mount Kinabalu",
    lat: 6.0647,
    lng: 116.5621,
    description: "Highest mountain in Malaysia",
  },
  {
    name: "Sepilok Orangutan Sanctuary",
    lat: 5.8742,
    lng: 117.9444,
    description: "Famous orangutan rehabilitation center",
  },
  {
    name: "Sipadan Island",
    lat: 4.1133,
    lng: 118.6281,
    description: "World-class diving destination",
  },
  {
    name: "Kinabatangan River",
    lat: 5.5167,
    lng: 118.2333,
    description: "Wildlife sanctuary and river cruise",
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
  const markersRef = useRef([]);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [status, setStatus] = useState(
    "Explore popular attractions in Sabah, Malaysia"
  );

  // Function to clear all markers
  const clearMarkers = () => {
    markersRef.current.forEach((marker) => {
      mapRef.current.removeLayer(marker);
    });
    markersRef.current = [];
  };

  // Function to add attraction markers
  const addAttractionMarkers = () => {
    clearMarkers();

    sabahAttractions.forEach((attraction) => {
      const marker = L.marker([attraction.lat, attraction.lng])
        .addTo(mapRef.current)
        .bindPopup(
          `<strong>${attraction.name}</strong><br/>${attraction.description}`
        )
        .on("click", () => {
          setSelectedAttraction(attraction);
          setStatus(`Selected: ${attraction.name}`);
        });

      markersRef.current.push(marker);
    });
  };

  // Function to center map on specific attraction
  const centerOnAttraction = (attraction) => {
    mapRef.current.setView([attraction.lat, attraction.lng], 12);
    setSelectedAttraction(attraction);
    setStatus(`Viewing: ${attraction.name}`);
  };

  // Function to reset map view
  const resetMapView = () => {
    mapRef.current.setView([5.9804, 116.0735], 8); // Centered on Sabah
    setSelectedAttraction(null);
    setStatus("Explore popular attractions in Sabah, Malaysia");
  };

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([5.9804, 116.0735], 8); // Centered on Sabah
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      // Add attraction markers
      addAttractionMarkers();
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        clearMarkers();
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
            >
              {attraction.name}
            </button>
          ))}
        </div>

        <div className="button-group">
          <button className="reset-btn" onClick={resetMapView}>
            Reset View
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div id="map" className="map-container"></div>
    </div>
  );
}
