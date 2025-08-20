import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"; // Import the routing CSS
import "leaflet-routing-machine"; // Import the routing machine

// Your local styles (make sure this path is correct)
import "../styles/Map.css";

// --- Fix for default icon paths in bundlers like Vite ---
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
// --- End of icon fix ---

export default function LeafletMap() {
  // --- STATE MANAGEMENT ---
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);
  const userLocationMarkerRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [status, setStatus] = useState("Initializing map...");
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [navDestination, setNavDestination] = useState("");

  // --- DATA ---
  const sabahAttractions = [
    {
      name: "Mount Kinabalu",
      lat: 6.0647,
      lng: 116.5621,
      description:
        "Highest mountain in Malaysia and famous for its biodiversity...",
    },
    {
      name: "Sepilok Orangutan Sanctuary",
      lat: 5.8742,
      lng: 117.9444,
      description: "Famous orangutan rehabilitation center...",
    },
    {
      name: "Sipadan Island",
      lat: 4.1133,
      lng: 118.6281,
      description: "One of the most top 10 world-class diving destination...",
    },
    {
      name: "Kinabatangan River",
      lat: 5.5167,
      lng: 118.2333,
      description: "Wildlife sanctuary and river cruise...",
    },
    {
      name: "Tip of Borneo",
      lat: 7.0186,
      lng: 116.6794,
      description: "Northernmost point of Borneo.",
    },
    {
      name: "Mari Mari Cultural Village",
      lat: 6.0433,
      lng: 116.1133,
      description: "Traditional cultural experience.",
    },
  ];

  // --- MAP INITIALIZATION ---
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([5.9804, 116.0735], 8);
      mapInstanceRef.current = map;
      const tiles = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      );
      tiles.on("load", () => {
        setMapLoaded(true);
        setStatus(
          "Map loaded successfully! Click on an attraction to explore."
        );
        addAttractionMarkers(map);
      });
      tiles.addTo(map);
    }
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // --- CORE FUNCTIONS ---
  const addAttractionMarkers = (map) => {
    sabahAttractions.forEach((attraction) => {
      const marker = L.marker([attraction.lat, attraction.lng]).addTo(map);
      marker.bindPopup(`<strong>${attraction.name}</strong>`);
      marker.on("click", () => centerOnAttraction(attraction));
    });
  };

  const centerOnAttraction = (attraction) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setView([attraction.lat, attraction.lng], 13);
    setSelectedAttraction(attraction);
    setStatus(`Viewing: ${attraction.name}`);
  };

  const locateUser = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setStatus("Getting your location...");
    map.locate({ setView: true, maxZoom: 14, enableHighAccuracy: true });
    map.on("locationfound", (e) => {
      setUserLocation([e.latlng.lat, e.latlng.lng]);
      setStatus("Your location has been found!");
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setLatLng(e.latlng);
      } else {
        const userIcon = L.divIcon({
          html: "<span>😀</span>",
          className: "user-location-icon",
          iconSize: [30, 30],
        });
        userLocationMarkerRef.current = L.marker(e.latlng, {
          icon: userIcon,
        }).addTo(map);
      }
      map.stopLocate();
    });
    map.on("locationerror", (err) => {
      setStatus(`Error: ${err.message}`);
      map.stopLocate();
    });
  };

  const handleNavigation = (attraction) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (!userLocation) {
      setStatus("Please find your location first before getting directions.");
      alert("Please click 'My Location' first to get directions.");
      return;
    }
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }
    setStatus(`Calculating route to ${attraction.name}...`);
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(attraction.lat, attraction.lng),
      ],
      routeWhileDragging: true,
      lineOptions: {
        styles: [{ color: "#27ae60", opacity: 1, weight: 5 }],
      },
      show: false,
      addWaypoints: false,
    }).addTo(map);
    routingControlRef.current = routingControl;
  };

  const clearRoute = () => {
    const map = mapInstanceRef.current;
    if (map && routingControlRef.current) {
      map.removeControl(routingControlRef.current);
      routingControlRef.current = null;
      setStatus("Route cleared. Select an attraction to explore.");
    }
  };

  // --- FILTERED ATTRACTIONS ---
  const filteredAttractions = sabahAttractions.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDER ---
  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <div className="panel">
        <div className="panel-header">
          <h1>Sabah Attractions Map</h1>
          <p>Powered by Leaflet & OpenStreetMap</p>
        </div>
        <div className={"status-box " + (mapLoaded ? "loaded" : "loading")}>
          {status}
        </div>
        <div className="panel-controls">
          <button
            onClick={locateUser}
            disabled={!mapLoaded}
            className="control-button"
          >
            My Location
          </button>
          <button
            onClick={clearRoute}
            disabled={!mapLoaded || !routingControlRef.current}
            className="reset-button"
          >
            Clear Route
          </button>
        </div>
        {/* Navigation Dropdown */}
        <div className="panel-controls" style={{ marginTop: 8 }}>
          <select
            value={navDestination}
            onChange={(e) => setNavDestination(e.target.value)}
            className="control-button"
            disabled={!mapLoaded}
          >
            <option value="">Select destination...</option>
            {sabahAttractions.map((attr, idx) => (
              <option key={idx} value={attr.name}>
                {attr.name}
              </option>
            ))}
          </select>
          <button
            className="control-button"
            disabled={!mapLoaded || !navDestination}
            onClick={() => {
              if (!userLocation) {
                setStatus(
                  "Please click 'My Location' first before navigating."
                );
                alert("Please click 'My Location' first before navigating.");
                return;
              }
              const dest = sabahAttractions.find(
                (a) => a.name === navDestination
              );
              if (dest) {
                handleNavigation(dest);
                setSelectedAttraction(dest);
              }
            }}
          >
            Navigate
          </button>
        </div>
        {selectedAttraction && (
          <div className="selected-attraction">
            <h3>{selectedAttraction.name}</h3>
            <p>{selectedAttraction.description}</p>
          </div>
        )}
        <div className="attractions-list">
          <h3>Popular Attractions ({filteredAttractions.length})</h3>
          {filteredAttractions.map((attraction, index) => (
            <div
              key={index}
              className={
                "attraction-item" +
                (selectedAttraction &&
                selectedAttraction.name === attraction.name
                  ? " selected"
                  : "")
              }
            >
              <div
                className="attraction-info"
                onClick={() => centerOnAttraction(attraction)}
                title={"Show " + attraction.name + " on the map"}
              >
                <strong>{attraction.name}</strong>
                <p className="description">{attraction.description}</p>
              </div>
              <button
                className="directions-button"
                onClick={() => handleNavigation(attraction)}
                disabled={!mapLoaded || !userLocation}
                title={
                  !userLocation
                    ? "Click 'My Location' first!"
                    : "Get directions to " + attraction.name
                }
              >
                ➔
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* MAP AREA */}
      <div className="map-area">
        {/* SEARCH BAR TOP RIGHT */}
        <div className="map-search-bar">
          <input
            type="text"
            placeholder="Search attractions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="map-container" ref={mapRef}>
          {!mapLoaded && (
            <div className="loading-overlay">
              <div className="loading-icon">🌐</div>
              <div className="loading-text">Loading Leaflet Map...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
