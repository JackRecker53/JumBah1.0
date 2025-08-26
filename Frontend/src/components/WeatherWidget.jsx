import { useEffect, useState } from "react";
import "../styles/WeatherWidget.css";

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!API_KEY) {
        setError("Missing API key");
        return;
      }
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Kota+Kinabalu&units=metric&appid=${API_KEY}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }
        const data = await response.json();
        setWeather({
          temp: data.main.temp,
          condition: data.weather[0].description,
        });
      } catch (err) {
        setError(err.message);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="weatherWidget">
      <h3>Current Weather</h3>
      {error && <p className="error">{error}</p>}
      {!error && !weather && <p>Loading...</p>}
      {weather && (
        <>
          <p className="temp">{Math.round(weather.temp)}°C</p>
          <p className="condition">{weather.condition}</p>
        </>
      )}
      <p className="seasonNote">
        Ideal visiting season: March to May and September.
      </p>
    </div>
  );
};

export default WeatherWidget;
