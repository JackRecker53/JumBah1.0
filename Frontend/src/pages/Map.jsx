import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"; // Import the routing CSS
import "leaflet-routing-machine"; // Import the routing machine
import { useGame } from "../contexts/GameContext";
import { FaMapMarkerAlt, FaHistory, FaCar, FaBus, FaWalking, FaBicycle, FaPlane, FaClock, FaRoute } from "react-icons/fa";

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
  const markersRef = useRef({});

  const [mapLoaded, setMapLoaded] = useState(false);
  const [status, setStatus] = useState("Initializing map...");
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [navDestination, setNavDestination] = useState("");
  const [externalResults, setExternalResults] = useState([]);
  const [transportMode, setTransportMode] = useState('driving');
  const [showLocationHistory, setShowLocationHistory] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [pinnedLocations, setPinnedLocations] = useState([]);
  const [showPOIDetails, setShowPOIDetails] = useState(null);
  
  const { updateLocation, locationHistory, currentLocation } = useGame();

  // --- DATA ---
  const sabahAttractions = [
    {
      name: "Mount Kinabalu",
      lat: 6.0647,
      lng: 116.5621,
      description:
        "Highest mountain in Malaysia and famous for its biodiversity...",
      icon: "⛰️",
      category: "nature",
    },
    {
      name: "Sepilok Orangutan Sanctuary",
      lat: 5.8742,
      lng: 117.9444,
      description: "Famous orangutan rehabilitation center...",
      icon: "🦧",
      category: "nature",
    },
    {
      name: "Sipadan Island",
      lat: 4.1133,
      lng: 118.6281,
      description: "One of the most top 10 world-class diving destination...",
      icon: "🏝️",
      category: "nature",
    },
    {
      name: "Kinabatangan River",
      lat: 5.5167,
      lng: 118.2333,
      description: "Wildlife sanctuary and river cruise...",
      icon: "🐊",
      category: "nature",
    },
    {
      name: "Tip of Borneo",
      lat: 7.0186,
      lng: 116.6794,
      description: "Northernmost point of Borneo.",
      icon: "📍",
      category: "nature",
    },
    {
      name: "Mari Mari Cultural Village",
      lat: 6.0433,
      lng: 116.1133,
      description: "Traditional cultural experience.",
      icon: "🏘️",
      category: "culture",
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
        // Start GPS tracking after map loads
        startLocationTracking();
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

  // GPS tracking function
  const startLocationTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude, timestamp: Date.now() };
          
          setUserLocation([latitude, longitude]);
          updateLocation(newLocation);
          
          // Update current location marker
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setLatLng([latitude, longitude]);
          } else {
            const currentLocationIcon = L.divIcon({
              className: 'current-location-marker',
              html: '<div class="pulse-marker">📍</div>',
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            });
            
            userLocationMarkerRef.current = L.marker([latitude, longitude], {
              icon: currentLocationIcon
            }).addTo(mapInstanceRef.current);
          }
        },
        (error) => {
          console.error('GPS tracking error:', error);
          setStatus('GPS tracking failed');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setStatus('GPS not supported');
    }
  };

  // --- CORE FUNCTIONS ---
  const addAttractionMarkers = (map) => {
    sabahAttractions.forEach((attraction) => {
      // Create custom POI icon
      const poiIcon = L.divIcon({
        className: 'poi-marker',
        html: `<div class="poi-icon">${attraction.category === 'nature' ? '🌿' : attraction.category === 'culture' ? '🏛️' : '🏖️'}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30]
      });
      
      const marker = L.marker([attraction.lat, attraction.lng], { icon: poiIcon })
        .addTo(map)
        .bindPopup(
          `<div class="poi-popup">
            <h3>${attraction.name}</h3>
            <p>${attraction.description}</p>
            <div class="poi-popup-actions">
              <button onclick="window.centerOnAttraction('${attraction.name}')">📍 Center</button>
              <button onclick="window.navigateToAttraction('${attraction.name}')">🧭 Navigate</button>
              <button onclick="window.showPOIDetails('${attraction.name}')">ℹ️ Details</button>
            </div>
          </div>`
        );

      // Store marker reference
      markersRef.current[attraction.name] = marker;
      marker.on("click", () => centerOnAttraction(attraction));
    });

    // Make functions globally accessible
    window.centerOnAttraction = (attractionName) => {
      const attraction = sabahAttractions.find((a) => a.name === attractionName);
      if (attraction) {
        centerOnAttraction(attraction);
      }
    };
    
    window.navigateToAttraction = (attractionName) => {
      const attraction = sabahAttractions.find((a) => a.name === attractionName);
      if (attraction) {
        setNavDestination(attraction.name);
        handleNavigation(attraction);
      }
    };
    
    window.showPOIDetails = (attractionName) => {
      const attraction = sabahAttractions.find((a) => a.name === attractionName);
      if (attraction) {
        showPOIInfo(attraction);
      }
    };
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
    
    // Get transport mode profile
    const getRouteProfile = () => {
      switch(transportMode) {
        case 'walking': return 'foot';
        case 'cycling': return 'bike';
        case 'driving': return 'car';
        case 'bus': return 'car'; // Use car profile for bus routes
        default: return 'car';
      }
    };
    
    setStatus(`Calculating ${transportMode} route to ${attraction.name}...`);
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
      router: L.Routing.osrmv1({
        serviceUrl: `https://router.project-osrm.org/route/v1/${getRouteProfile()}`
      })
    }).on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      
      // Calculate ETA based on transport mode
      const distance = (summary.totalDistance / 1000).toFixed(1); // km
      let timeInMinutes = Math.round(summary.totalTime / 60);
      
      // Adjust time based on transport mode
      if (transportMode === 'bus') {
        timeInMinutes *= 1.5; // Add 50% for bus delays
      } else if (transportMode === 'walking') {
        timeInMinutes = Math.round(summary.totalDistance / 83.33); // 5 km/h walking speed
      } else if (transportMode === 'cycling') {
        timeInMinutes = Math.round(summary.totalDistance / 250); // 15 km/h cycling speed
      }
      
      setRouteDistance(distance);
      setEstimatedTime(timeInMinutes);
      setStatus(`Route found: ${distance}km, ETA: ${timeInMinutes} min`);
    }).addTo(map);
    routingControlRef.current = routingControl;
  };
  
  // Pin current location
  const pinCurrentLocation = () => {
    if (userLocation) {
      const newPin = {
        id: Date.now(),
        lat: userLocation[0],
        lng: userLocation[1],
        name: `Pinned Location ${pinnedLocations.length + 1}`,
        timestamp: new Date().toLocaleString()
      };
      
      setPinnedLocations([...pinnedLocations, newPin]);
      
      // Add pin marker to map
      const pinIcon = L.divIcon({
        className: 'pin-marker',
        html: '📌',
        iconSize: [25, 25],
        iconAnchor: [12, 25]
      });
      
      L.marker([newPin.lat, newPin.lng], { icon: pinIcon })
        .bindPopup(`<b>${newPin.name}</b><br>Pinned: ${newPin.timestamp}`)
        .addTo(mapInstanceRef.current);
        
      setStatus('Location pinned successfully!');
    }
  };
  
  // Show POI details
  const showPOIInfo = (attraction) => {
    setShowPOIDetails(attraction);
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

  // --- EXTERNAL SEARCH ---
  const sabahBoundingBox = "4.0,115.0,7.5,119.0"; // south, west, north, east

  const searchExternalLocations = async (query) => {
    if (!query) return;
    // Use Sabah bounding box for location search
    // viewbox=west,north,east,south (approximate Sabah: 115.0,7.5,119.0,4.0)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}&bounded=1&viewbox=115.0,7.5,119.0,4.0`;
    const response = await fetch(url);
    const data = await response.json();
    setExternalResults(data);
  };

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchExternalLocations(searchTerm);
    } else {
      setExternalResults([]);
    }
  }, [searchTerm]);

  // --- RENDER ---
  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <div className="panel">
        <div className="panel-header">
          <h1>Sabah Map</h1>
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
        {/* Search Box for Locations */}
        <div className="panel-controls" style={{ marginTop: 16 }}>
          <input
            type="text"
            className="control-input"
            placeholder="Search for a place or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!mapLoaded}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "1em",
              borderRadius: "6px",
              border: "1px solid #ccc",
              marginBottom: "8px",
            }}
          />
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
          {/* External Search Results */}
          {externalResults.length > 0 && (
            <>
              <h3>Other Locations</h3>
              {externalResults.map((place, idx) => (
                <div key={idx} className="attraction-item">
                  <div className="attraction-info">
                    <strong>{place.display_name}</strong>
                    <p>
                      Lat: {place.lat}, Lon: {place.lon}
                    </p>
                  </div>
                  <button
                    className="directions-button"
                    onClick={() => {
                      // Center map on external location
                      const map = mapInstanceRef.current;
                      if (map) {
                        map.setView(
                          [parseFloat(place.lat), parseFloat(place.lon)],
                          13
                        );
                        setSelectedAttraction({
                          name: place.display_name,
                          lat: parseFloat(place.lat),
                          lng: parseFloat(place.lon),
                          description: "External location from OpenStreetMap",
                        });
                      }
                    }}
                  >
                    ➔
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      {/* MAP AREA */}
      <div className="map-area">
        <div className="map-container" ref={mapRef}>
          {!mapLoaded && (
            <div className="loading-overlay">
              <div className="loading-icon">🌐</div>
              <div className="loading-text">Loading Leaflet Map...</div>
            </div>
          )}
        </div>
        
        {/* Status overlay */}
        <div className="status-overlay">
          <p>{status}</p>
          {estimatedTime && routeDistance && (
            <div className="route-info">
              <FaClock /> {estimatedTime} min • <FaRoute /> {routeDistance} km
            </div>
          )}
        </div>

        {/* Enhanced Map Controls */}
        <div className="map-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search attractions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={locateUser} className="locate-btn">
              <FaMapMarkerAlt /> My Location
            </button>
            <button onClick={pinCurrentLocation} className="pin-btn">
              📌 Pin Location
            </button>
          </div>

          {/* Transport Mode Selection */}
          <div className="transport-section">
            <label>Transport Mode:</label>
            <div className="transport-modes">
              <button 
                className={`transport-btn ${transportMode === 'walking' ? 'active' : ''}`}
                onClick={() => setTransportMode('walking')}
              >
                <FaWalking /> Walk
              </button>
              <button 
                className={`transport-btn ${transportMode === 'cycling' ? 'active' : ''}`}
                onClick={() => setTransportMode('cycling')}
              >
                <FaBicycle /> Bike
              </button>
              <button 
                className={`transport-btn ${transportMode === 'driving' ? 'active' : ''}`}
                onClick={() => setTransportMode('driving')}
              >
                <FaCar /> Drive
              </button>
              <button 
                className={`transport-btn ${transportMode === 'bus' ? 'active' : ''}`}
                onClick={() => setTransportMode('bus')}
              >
                <FaBus /> Bus
              </button>
            </div>
          </div>

          <div className="navigation-section">
            <input
              type="text"
              placeholder="Enter destination..."
              value={navDestination}
              onChange={(e) => setNavDestination(e.target.value)}
              className="nav-input"
            />
            <button onClick={() => {
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
            }} className="nav-btn">
              🧭 Navigate
            </button>
            <button onClick={clearRoute} className="clear-btn">
              ❌ Clear Route
            </button>
          </div>
          
          {/* Location History Toggle */}
          <div className="history-section">
            <button 
              onClick={() => setShowLocationHistory(!showLocationHistory)}
              className="history-btn"
            >
              <FaHistory /> Location History
            </button>
          </div>
        </div>
        
        {/* Location History Panel */}
        {showLocationHistory && (
          <div className="location-history-panel">
            <h3>Location History</h3>
            {locationHistory.length > 0 ? (
              <div className="history-list">
                {locationHistory.slice(-10).reverse().map((location, index) => (
                  <div key={index} className="history-item">
                    <div className="history-coords">
                      {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                    <div className="history-time">
                      {new Date(location.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No location history available</p>
            )}
          </div>
        )}
        
        {/* POI Details Modal */}
        {showPOIDetails && (
          <div className="poi-details-modal">
            <div className="poi-details-content">
              <button 
                className="close-btn"
                onClick={() => setShowPOIDetails(null)}
              >
                ×
              </button>
              <h2>{showPOIDetails.name}</h2>
              <p>{showPOIDetails.description}</p>
              <div className="poi-actions">
                <button 
                  onClick={() => centerOnAttraction(showPOIDetails)}
                  className="poi-action-btn"
                >
                  <FaMapMarkerAlt /> Show on Map
                </button>
                <button 
                  onClick={() => handleNavigation(showPOIDetails)}
                  className="poi-action-btn"
                >
                  🧭 Get Directions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
