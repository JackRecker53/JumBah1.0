import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2xUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";
import "../styles/Map.css";

// Configure Leaflet default icons so they load when bundled by Vite
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2xUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

export default function LeafletMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [status, setStatus] = useState("Initializing map...");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Initialize map with OpenStreetMap (no API key required)
  const initializeMap = async () => {
    try {
      setStatus("Loading map tiles...");

      const container = mapRef.current;
      if (!container) {
        setStatus("Map container not ready");
        return;
      }

      // Remove any existing map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }

      // Create map
      const map = L.map(container, {
        center: [5.9804, 116.0735],
        zoom: 8,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // Primary tile layer (OpenStreetMap)
      let tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: "abc",
        }
      );

      let tilesLoaded = false;
      let loadTimeout;

      const onTilesLoaded = () => {
        if (!tilesLoaded) {
          tilesLoaded = true;
          setMapLoaded(true);
          setStatus(
            "Map loaded successfully! Click on attractions to explore."
          );
          addAttractionMarkers(L, map);
          if (loadTimeout) clearTimeout(loadTimeout);
        }
      };

      tileLayer.on("loading", () => {
        if (!tilesLoaded) setStatus("Loading map tiles...");
      });
      tileLayer.on("load", onTilesLoaded);
      let errorCount = 0;
      tileLayer.on("tileerror", (e) => {
        console.error("Tile loading error:", e);
        errorCount += 1;
        // If we see several early errors, switch to Carto basemap fallback
        if (!tilesLoaded && errorCount >= 3) {
          try {
            map.removeLayer(tileLayer);
          } catch {}
          const carto = L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              subdomains: "abcd",
              maxZoom: 19,
            }
          );
          tileLayer = carto;
          errorCount = 0;
          tileLayer.on("load", onTilesLoaded);
          tileLayer.on(
            "loading",
            () => !tilesLoaded && setStatus("Loading map tiles...")
          );
          tileLayer.addTo(map);
          setStatus("Switched to fallback tiles (Carto)");
        } else if (!tilesLoaded) {
          setTimeout(onTilesLoaded, 1000);
        }
      });

      tileLayer.addTo(map);

      loadTimeout = setTimeout(() => {
        if (!tilesLoaded) onTilesLoaded();
      }, 3000);

      map.whenReady(() => {
        setTimeout(() => {
          try {
            map.invalidateSize();
            if (!tilesLoaded) onTilesLoaded();
          } catch (e) {
            console.error("Error in map ready handler:", e);
          }
        }, 200);
      });

      // Ensure resizing or layout changes update the map size
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize({ animate: false });
        }
      });
      resizeObserver.observe(container);
      // Clean observer on unmount of component or re-init
      map.once("unload", () => resizeObserver.disconnect());
    } catch (error) {
      console.error("Map initialization error:", error);
      setStatus(`Failed to load map: ${error.message}`);
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
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported by this browser");
      return;
    }

    if (!mapInstanceRef.current) {
      setStatus("Map not ready yet");
      return;
    }

    setStatus("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        try {
          const position = [coords.latitude, coords.longitude];
          setUserLocation(position);

          if (mapInstanceRef.current) {
            L.marker(position)
              .addTo(mapInstanceRef.current)
              .bindPopup("You are here")
              .openPopup();
            mapInstanceRef.current.setView(position, 13);
          }
          setStatus("Located your position");
        } catch (error) {
          console.error("Error processing location:", error);
          setStatus("Error processing your location");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to get your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setStatus(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
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
      setStatus("Searching...");
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(
          searchQuery + " Sabah Malaysia"
        )}`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "JumBah-Tourist-App/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14);
          L.marker([lat, lng])
            .addTo(mapInstanceRef.current)
            .bindPopup(data[0].display_name)
            .openPopup();
          setStatus(`Found: ${data[0].display_name}`);
        }
      } else {
        setStatus("Place not found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setStatus("Search failed. Try searching from the attractions list.");
    }
  };

  // Initialize map on component mount
  useEffect(() => {
    const initMap = async () => {
      try {
        await initializeMap();
      } catch (error) {
        console.error("Failed to initialize map:", error);
        setStatus("Failed to initialize map. Please refresh the page.");
      }
    };

    initMap();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
        <div className="panel-header">
          <h1>Sabah Attractions Map</h1>
          <p>Powered by Leaflet & OpenStreetMap</p>
        </div>

        <div className={`status-box ${mapLoaded ? "loaded" : "loading"}`}>
          {status}
        </div>

        {/* Search Controls */}
        <div className="search-controls">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attractions..."
            onKeyPress={(e) => e.key === "Enter" && searchPlace()}
          />
          <div className="search-buttons">
            <button
              onClick={searchPlace}
              disabled={!mapLoaded}
              className="search-button"
            >
              Search
            </button>
            <button
              onClick={locateUser}
              disabled={!mapLoaded}
              className="locate-button"
            >
              My Location
            </button>
          </div>
        </div>

        {/* Selected Attraction Info */}
        {selectedAttraction && (
          <div className="selected-attraction">
            <h3>{selectedAttraction.name}</h3>
            <p>{selectedAttraction.description}</p>
            <p className="coords">
              <strong>Coordinates:</strong> {selectedAttraction.lat.toFixed(4)},{" "}
              {selectedAttraction.lng.toFixed(4)}
            </p>
          </div>
        )}

        {/* Attractions List */}
        <div className="attractions-list">
          <h3>Popular Attractions ({sabahAttractions.length})</h3>
          {sabahAttractions.map((attraction, index) => (
            <button
              key={index}
              onClick={() => centerOnAttraction(attraction)}
              disabled={!mapLoaded}
              className={`attraction-btn ${
                selectedAttraction?.name === attraction.name ? "selected" : ""
              }`}
            >
              <strong>{attraction.name}</strong>
              <div className="description">
                {attraction.description.substring(0, 60)}...
              </div>
            </button>
          ))}
        </div>

        <div className="view-controls">
          <button
            onClick={resetMapView}
            disabled={!mapLoaded}
            className="reset-button"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="map-container">
        {!mapLoaded && (
          <div className="loading-overlay">
            <div className="loading-icon">🌐</div>
            <div className="loading-text">Loading Leaflet Map...</div>
            <div className="loading-status">{status}</div>
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
