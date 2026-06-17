import { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Wind, Thermometer, Search } from "lucide-react";

interface WeatherWidgetProps {
  darkMode: boolean;
}

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
}

const defaultWeatherData: WeatherData[] = [
  { city: "New York", temp: 72, condition: "Partly Cloudy", humidity: 65, wind: 12 },
  { city: "Los Angeles", temp: 85, condition: "Sunny", humidity: 45, wind: 8 },
  { city: "Chicago", temp: 68, condition: "Cloudy", humidity: 70, wind: 15 },
  { city: "Houston", temp: 92, condition: "Sunny", humidity: 55, wind: 6 },
  { city: "Phoenix", temp: 105, condition: "Sunny", humidity: 20, wind: 5 },
];

export default function WeatherWidget({ darkMode }: WeatherWidgetProps) {
  const [selectedCity, setSelectedCity] = useState(0);
  const [zipcode, setZipcode] = useState("");
  const [customWeather, setCustomWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeatherByZipcode = async (zip: string) => {
    if (!/^\d{5}$/.test(zip)) {
      setError("Please enter a valid 5-digit zipcode");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Using Open-Meteo API (free, no API key required)
      // First, get coordinates from zipcode using a geocoding service
      const geoResponse = await fetch(
        `https://api.zippopotam.us/us/${zip}`
      );

      if (!geoResponse.ok) {
        throw new Error("Zipcode not found");
      }

      const geoData = await geoResponse.json();
      const place = geoData.places[0];
      const lat = place.latitude;
      const lon = place.longitude;
      const cityName = place["place name"];

      // Fetch weather data from Open-Meteo
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&relative_humidity_2m=true`
      );

      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const weatherData = await weatherResponse.json();
      const current = weatherData.current_weather;
      
      // Convert Celsius to Fahrenheit
      const tempF = Math.round((current.temperature * 9) / 5 + 32);
      
      // Determine condition based on weather code
      const condition = getConditionFromCode(current.weathercode);

      setCustomWeather({
        city: `${cityName}, ${zip}`,
        temp: tempF,
        condition: condition,
        humidity: weatherData.current?.relative_humidity_2m || 50,
        wind: Math.round(current.windspeed * 0.621371), // Convert km/h to mph
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch weather");
      setCustomWeather(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getConditionFromCode = (code: number): string => {
    if (code === 0) return "Clear";
    if (code >= 1 && code <= 3) return "Partly Cloudy";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 67) return "Rainy";
    if (code >= 71 && code <= 77) return "Snowy";
    if (code >= 80 && code <= 82) return "Rainy";
    if (code >= 85 && code <= 86) return "Snowy";
    if (code >= 95) return "Thunderstorm";
    return "Sunny";
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className={`w-12 h-12 ${darkMode ? "text-amber-400" : "text-amber-500"}`} />;
      case "cloudy":
      case "partly cloudy":
        return (
          <div className="relative">
            <Sun className={`w-10 h-10 ${darkMode ? "text-amber-400" : "text-amber-500"}`} />
            <Cloud className={`w-8 h-8 absolute -right-2 -bottom-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`} />
          </div>
        );
      case "foggy":
        return <Cloud className={`w-12 h-12 ${darkMode ? "text-slate-400" : "text-slate-500"}`} />;
      case "rainy":
        return <CloudRain className={`w-12 h-12 ${darkMode ? "text-blue-400" : "text-blue-500"}`} />;
      case "snowy":
        return <Cloud className={`w-12 h-12 ${darkMode ? "text-sky-400" : "text-sky-500"}`} />;
      case "thunderstorm":
        return <CloudRain className={`w-12 h-12 ${darkMode ? "text-purple-400" : "text-purple-500"}`} />;
      default:
        return <Sun className={`w-12 h-12 ${darkMode ? "text-amber-400" : "text-amber-500"}`} />;
    }
  };

  const weather = customWeather || defaultWeatherData[selectedCity];

  const handleZipcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (zipcode.trim()) {
      fetchWeatherByZipcode(zipcode.trim());
    }
  };

  const clearCustomWeather = () => {
    setCustomWeather(null);
    setZipcode("");
    setError("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Zipcode Input Section */}
      <div className="mb-4">
        <form onSubmit={handleZipcodeSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              placeholder="Enter your zipcode"
              maxLength={5}
              className={`w-full px-4 py-2 pr-10 rounded-lg border transition-all ${
                darkMode
                  ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500"
                  : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-blue-500"
              } focus:outline-none focus:ring-2 ${
                darkMode ? "focus:ring-cyan-500/20" : "focus:ring-blue-500/20"
              }`}
            />
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`} />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              darkMode
                ? "bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-slate-700"
                : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-slate-300"
            } disabled:cursor-not-allowed`}
          >
            {isLoading ? "..." : "Get"}
          </button>
        </form>
        {error && (
          <p className={`mt-1 text-sm ${darkMode ? "text-red-400" : "text-red-500"}`}>
            {error}
          </p>
        )}
        {customWeather && (
          <button
            onClick={clearCustomWeather}
            className={`mt-2 text-xs underline ${
              darkMode ? "text-slate-400 hover:text-slate-300" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Back to default cities
          </button>
        )}
      </div>

      {/* Default City Buttons (only show when no custom weather) */}
      {!customWeather && (
        <div className="flex flex-wrap gap-2 mb-4">
          {defaultWeatherData.map((w, index) => (
            <button
              key={w.city}
              onClick={() => setSelectedCity(index)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                selectedCity === index
                  ? darkMode
                    ? "bg-cyan-500 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {w.city}
            </button>
          ))}
        </div>
      )}

      <motion.div
        key={customWeather ? `custom-${customWeather.city}` : selectedCity}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
              {weather.city}
            </h3>
            <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
              {weather.condition}
            </p>
          </div>
          {getWeatherIcon(weather.condition)}
        </div>

        <div className={`text-5xl font-bold mb-4 ${darkMode ? "text-white" : "text-slate-800"}`}>
          {weather.temp}°F
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className={`flex items-center gap-2 p-3 rounded-lg ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
            <Thermometer className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-blue-500"}`} />
            <div>
              <div className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Humidity</div>
              <div className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>{weather.humidity}%</div>
            </div>
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-lg ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
            <Wind className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-blue-500"}`} />
            <div>
              <div className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Wind</div>
              <div className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>{weather.wind} mph</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}