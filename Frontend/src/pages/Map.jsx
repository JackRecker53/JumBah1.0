import React, { useEffect, useRef, useState } from "react";

export default function MapTilerMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [status, setStatus] = useState("Initializing map...");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(true);

  // Popular Sabah attractions data
  const sabahAttractions = [
    {
      name: "Mount Kinabalu",
      lat: 6.0647,
      lng: 116.5621,
      description:
        "Highest mountain in Malaysia and famous for its biodiversity as it is the home to thousand of plant species, including the rare Rafflesia flower and 'The King of Orchid', Paphiopedilum rothschildianum, the rarest orchid species in the world.",
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
        "One of the most top 10 world-class diving destination, it is abundance in marine life and coral reefs.",
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

  const [markersRef, setMarkersRef] = useState([]);

  // Load Leaflet dynamically
  const loadLeaflet = async () => {
    if (window.L) return window.L;

    return new Promise((resolve, reject) => {
      // Load CSS
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        // Fix default markers
        if (window.L && window.L.Icon && window.L.Icon.Default) {
          delete window.L.Icon.Default.prototype._getIconUrl;
          window.L.Icon.Default.mergeOptions({
            iconRetinaUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl:
              "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          });
        }
        resolve(window.L);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  // Initialize map with MapTiler
  const initializeMap = async () => {
    try {
      if (!apiKey.trim()) {
        setStatus("Please enter your MapTiler API key");
        return;
      }

      const L = await loadLeaflet();
      setStatus("Loading map tiles...");

      const mapContainer = mapRef.current;
      if (!mapContainer) return;

      // Clear any existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Create new map instance
      const map = L.map(mapContainer, {
        center: [5.9804, 116.0735],
        zoom: 8,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // Add MapTiler tiles
      const tileLayer = L.tileLayer(
        `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${apiKey}`,
        {
          attribution:
            '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
          maxZoom: 19,
          tileSize: 256,
          zoomOffset: 0,
        }
      );

      // Handle tile loading success/failure
      let tilesLoaded = false;
      let hasError = false;

      tileLayer.on("loading", () => {
        if (!tilesLoaded) {
          setStatus("Loading MapTiler tiles...");
        }
      });

      tileLayer.on("load", () => {
        if (!tilesLoaded && !hasError) {
          tilesLoaded = true;
          setMapLoaded(true);
          setStatus(
            "Map loaded successfully! Click on attractions to explore."
          );
          addAttractionMarkers(L, map);
        }
      });

      tileLayer.on("tileerror", (e) => {
        hasError = true;
        console.error("Tile loading error:", e);
        setStatus(
          "Error loading MapTiler tiles. Please check your API key and try again."
        );

        // Fallback to OpenStreetMap
        map.removeLayer(tileLayer);
        const fallbackTiles = L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
          }
        );
        fallbackTiles.addTo(map);
        setStatus("Switched to fallback tiles (OpenStreetMap)");
        if (!tilesLoaded) {
          tilesLoaded = true;
          setMapLoaded(true);
          addAttractionMarkers(L, map);
        }
      });

      tileLayer.addTo(map);

      // Handle map ready
      map.whenReady(() => {
        setTimeout(() => {
          map.invalidateSize();
          if (!tilesLoaded && !hasError) {
            tilesLoaded = true;
            setMapLoaded(true);
            setStatus("Map initialized successfully!");
            addAttractionMarkers(L, map);
          }
        }, 500);
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      setStatus(
        "Failed to load map. Please check your internet connection and API key."
      );
    }
  };

  // Add attraction markers to map
  const addAttractionMarkers = (L, map) => {
    if (!L || !map) return;

    const markers = [];

    sabahAttractions.forEach((attraction) => {
      const marker = L.marker([attraction.lat, attraction.lng])
        .addTo(map)
        .bindPopup(
          `<strong>${attraction.name}</strong><br/>${attraction.description}`
        )
        .on("click", () => {
          setSelectedAttraction(attraction);
          setStatus(`Selected: ${attraction.name}`);
        });

      markers.push(marker);
    });

    setMarkersRef(markers);
  };

  // Center map on specific attraction
  const centerOnAttraction = (attraction) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([attraction.lat, attraction.lng], 12);
    setSelectedAttraction(attraction);
    setStatus(`Viewing: ${attraction.name}`);
  };

  // Reset map view
  const resetMapView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([5.9804, 116.0735], 8);
    setSelectedAttraction(null);
    setStatus("Explore popular attractions in Sabah, Malaysia");
  };

  // Get user location
  const locateUser = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) {
      setStatus("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = [coords.latitude, coords.longitude];
        setUserLocation(position);

        if (window.L && mapInstanceRef.current) {
          window.L.marker(position)
            .addTo(mapInstanceRef.current)
            .bindPopup("You are here")
            .openPopup();
          mapInstanceRef.current.setView(position, 13);
        }
        setStatus("Located your position");
      },
      (error) => {
        console.error("Geolocation error:", error);
        setStatus("Unable to get your location");
      }
    );
  };

  // Search for places
  const searchPlace = async () => {
    if (!searchQuery.trim()) return;

    const found = sabahAttractions.find((attraction) =>
      attraction.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      centerOnAttraction(found);
      return;
    }

    // Try geocoding with Nominatim as backup
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          searchQuery + " Sabah Malaysia"
        )}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const data = await response.json();

      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        if (mapInstanceRef.current && window.L) {
          mapInstanceRef.current.setView([lat, lng], 14);
          window.L.marker([lat, lng])
            .addTo(mapInstanceRef.current)
            .bindPopup(data[0].display_name)
            .openPopup();
          setStatus(`Found: ${data[0].display_name}`);
        }
      } else {
        setStatus("Place not found");
      }
    } catch (error) {
      setStatus("Search failed. Try searching from the attractions list.");
    }
  };

  // Handle API key submission
  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      setShowKeyInput(false);
      initializeMap();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (error) {
          console.error("Error cleaning up map:", error);
        }
      }
    };
  }, []);

  if (showKeyInput) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f8f9fa",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            maxWidth: "500px",
            width: "90%",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "20px",
              color: "#2c3e50",
            }}
          >
            MapTiler API Key Required
          </h2>
          <p
            style={{
              textAlign: "center",
              marginBottom: "30px",
              color: "#7f8c8d",
              lineHeight: 1.6,
            }}
          >
            To use MapTiler maps, you need a free API key from{" "}
            <a
              href="https://www.maptiler.com/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#3498db" }}
            >
              maptiler.com
            </a>
          </p>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
                color: "#2c3e50",
              }}
            >
              Enter your MapTiler API Key:
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your MapTiler API key..."
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
              }}
              onKeyPress={(e) => e.key === "Enter" && handleApiKeySubmit()}
            />
          </div>

          <button
            onClick={handleApiKeySubmit}
            disabled={!apiKey.trim()}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: apiKey.trim() ? "#3498db" : "#bdc3c7",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: apiKey.trim() ? "pointer" : "not-allowed",
              transition: "background-color 0.3s",
            }}
          >
            Initialize Map
          </button>

          <div
            style={{
              marginTop: "20px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: "#2c3e50" }}>
              How to get a free API key:
            </h4>
            <ol
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "#7f8c8d",
                fontSize: "14px",
              }}
            >
              <li>
                Go to{" "}
                <a
                  href="https://www.maptiler.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  maptiler.com
                </a>
              </li>
              <li>Sign up for a free account</li>
              <li>Go to your account dashboard</li>
              <li>Copy your API key</li>
              <li>Paste it above and click "Initialize Map"</li>
            </ol>
          </div>

          <button
            onClick={() => {
              setShowKeyInput(false);
              setStatus(
                "Initializing without MapTiler (using OpenStreetMap)..."
              );
              setTimeout(initializeMap, 100);
            }}
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "transparent",
              color: "#7f8c8d",
              border: "1px solid #ddd",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              marginTop: "15px",
            }}
          >
            Skip and use OpenStreetMap instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Control Panel */}
      <div
        style={{
          width: "350px",
          padding: "20px",
          backgroundColor: "white",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          overflowY: "auto",
          zIndex: 1000,
        }}
      >
        <h1
          style={{
            color: "#2c3e50",
            fontSize: "24px",
            marginBottom: "10px",
            borderBottom: "3px solid #3498db",
            paddingBottom: "10px",
          }}
        >
          Sabah Attractions Map
        </h1>
        <p style={{ color: "#7f8c8d", marginBottom: "20px" }}>
          Powered by MapTiler & OpenStreetMap
        </p>

        <div
          style={{
            padding: "10px",
            backgroundColor: mapLoaded ? "#e8f5e8" : "#fff3cd",
            borderRadius: "5px",
            marginBottom: "20px",
            fontSize: "14px",
            color: mapLoaded ? "#27ae60" : "#856404",
          }}
        >
          {status}
        </div>

        {/* Search Controls */}
        <div style={{ marginBottom: "20px" }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attractions..."
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              marginBottom: "10px",
            }}
            onKeyPress={(e) => e.key === "Enter" && searchPlace()}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={searchPlace}
              disabled={!mapLoaded}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: mapLoaded ? "#3498db" : "#bdc3c7",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: mapLoaded ? "pointer" : "not-allowed",
              }}
            >
              Search
            </button>
            <button
              onClick={locateUser}
              disabled={!mapLoaded}
              style={{
                flex: 1,
                padding: "8px 12px",
                backgroundColor: mapLoaded ? "#e74c3c" : "#bdc3c7",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: mapLoaded ? "pointer" : "not-allowed",
              }}
            >
              My Location
            </button>
          </div>
        </div>

        {/* Selected Attraction Info */}
        {selectedAttraction && (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "2px solid #3498db",
            }}
          >
            <h3 style={{ color: "#2c3e50", marginBottom: "8px" }}>
              {selectedAttraction.name}
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.4",
                marginBottom: "10px",
                color: "#555",
              }}
            >
              {selectedAttraction.description}
            </p>
            <p style={{ fontSize: "12px", color: "#7f8c8d" }}>
              <strong>Coordinates:</strong> {selectedAttraction.lat.toFixed(4)},{" "}
              {selectedAttraction.lng.toFixed(4)}
            </p>
          </div>
        )}

        {/* Attractions List */}
        <div>
          <h3 style={{ color: "#2c3e50", marginBottom: "15px" }}>
            Popular Attractions ({sabahAttractions.length})
          </h3>
          {sabahAttractions.map((attraction, index) => (
            <button
              key={index}
              onClick={() => centerOnAttraction(attraction)}
              disabled={!mapLoaded}
              style={{
                display: "block",
                width: "100%",
                padding: "12px",
                marginBottom: "8px",
                backgroundColor:
                  selectedAttraction?.name === attraction.name
                    ? "#3498db"
                    : "white",
                color:
                  selectedAttraction?.name === attraction.name
                    ? "white"
                    : "#2c3e50",
                border: "1px solid #ddd",
                borderRadius: "6px",
                textAlign: "left",
                cursor: mapLoaded ? "pointer" : "not-allowed",
                opacity: mapLoaded ? 1 : 0.6,
                transition: "all 0.2s",
                fontSize: "14px",
              }}
            >
              <strong>{attraction.name}</strong>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                {attraction.description.substring(0, 60)}...
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
          <button
            onClick={resetMapView}
            disabled={!mapLoaded}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: mapLoaded ? "#95a5a6" : "#bdc3c7",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: mapLoaded ? "pointer" : "not-allowed",
              fontSize: "14px",
            }}
          >
            Reset View
          </button>
          <button
            onClick={() => {
              setShowKeyInput(true);
              setMapLoaded(false);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
              }
            }}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: "#f39c12",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Change API Key
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        style={{
          flex: 1,
          height: "100vh",
          backgroundColor: "#e8f4f8",
        }}
      >
        {!mapLoaded && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              flexDirection: "column",
              backgroundColor: "#f8f9fa",
              color: "#666",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                marginBottom: "20px",
                animation: "spin 1s linear infinite",
              }}
            >
              🌐
            </div>
            <div style={{ fontSize: "18px", marginBottom: "10px" }}>
              Loading MapTiler Map...
            </div>
            <div style={{ fontSize: "14px", color: "#999" }}>{status}</div>
            <style>
              {`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}
      </div>
    </div>
  );
}
