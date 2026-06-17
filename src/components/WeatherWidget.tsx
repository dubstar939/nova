import { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Wind, Thermometer, Plus, X } from "lucide-react";

interface WeatherWidgetProps {
  darkMode: boolean;
}

interface WeatherData {
  city: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
  zipCode?: string;
  isCustom?: boolean;
}

const defaultWeatherData: WeatherData[] = [
  { city: "New York", temp: 72, condition: "Partly Cloudy", humidity: 65, wind: 12 },
  { city: "Los Angeles", temp: 85, condition: "Sunny", humidity: 45, wind: 8 },
  { city: "Chicago", temp: 68, condition: "Cloudy", humidity: 70, wind: 15 },
  { city: "Houston", temp: 92, condition: "Sunny", humidity: 55, wind: 6 },
  { city: "Phoenix", temp: 105, condition: "Sunny", humidity: 20, wind: 5 },
];

// Simulated zip code to city mapping (in a real app, you'd use an API)
const zipCodeToCity: Record<string, string> = {
  "10001": "New York",
  "90001": "Los Angeles",
  "60601": "Chicago",
  "77001": "Houston",
  "85001": "Phoenix",
  "94102": "San Francisco",
  "98101": "Seattle",
  "33101": "Miami",
  "02101": "Boston",
  "75201": "Dallas",
};

export default function WeatherWidget({ darkMode }: WeatherWidgetProps) {
  const [weatherData, setWeatherData] = useState<WeatherData[]>(defaultWeatherData);
  const [selectedCity, setSelectedCity] = useState(0);
  const [showZipInput, setShowZipInput] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [error, setError] = useState("");

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

  const generateWeatherForZip = (zip: string): WeatherData | null => {
    const city = zipCodeToCity[zip];
    if (!city) {
      // Generate random weather for unknown zip codes
      const conditions = ["Sunny", "Cloudy", "Partly Cloudy", "Rainy"];
      const randomTemp = Math.floor(Math.random() * 50) + 50;
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const randomHumidity = Math.floor(Math.random() * 50) + 30;
      const randomWind = Math.floor(Math.random() * 20) + 3;
      
      return {
        city: `ZIP ${zip}`,
        temp: randomTemp,
        condition: randomCondition,
        humidity: randomHumidity,
        wind: randomWind,
        zipCode: zip,
        isCustom: true,
      };
    }
    
    // Find existing city data or create new
    const existingCity = defaultWeatherData.find(w => w.city === city);
    if (existingCity) {
      return {
        ...existingCity,
        zipCode: zip,
        isCustom: true,
      };
    }
    
    return {
      city: city,
      temp: 75,
      condition: "Sunny",
      humidity: 50,
      wind: 10,
      zipCode: zip,
      isCustom: true,
    };
  };

  const handleAddZipCode = () => {
    if (!zipCode.trim() || zipCode.length < 5) {
      setError("Please enter a valid 5-digit zip code");
      return;
    }

    const newWeather = generateWeatherForZip(zipCode.trim());
    if (!newWeather) {
      setError("Unable to fetch weather for this zip code");
      return;
    }

    // Check if already exists
    const exists = weatherData.some(w => w.zipCode === zipCode.trim());
    if (exists) {
      setError("This zip code is already added");
      return;
    }

    setWeatherData([...weatherData, newWeather]);
    setSelectedCity(weatherData.length);
    setZipCode("");
    setShowZipInput(false);
    setError("");
  };

  const handleRemoveCustomLocation = (index: number) => {
    const newWeatherData = weatherData.filter((_, i) => i !== index);
    setWeatherData(newWeatherData);
    if (selectedCity >= newWeatherData.length) {
      setSelectedCity(newWeatherData.length - 1);
    } else if (selectedCity > index) {
      setSelectedCity(selectedCity - 1);
    }
  };

  const weather = weatherData[selectedCity];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-2 mb-4">
        {weatherData.map((w, index) => (
          <div key={w.zipCode || w.city} className="flex items-center gap-1">
            <button
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
            {w.isCustom && (
              <button
                onClick={() => handleRemoveCustomLocation(index)}
                className={`p-0.5 rounded-full transition-all ${
                  darkMode ? "hover:bg-red-900 text-red-400" : "hover:bg-red-100 text-red-500"
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setShowZipInput(!showZipInput)}
          className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1 ${
            darkMode
              ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Plus className="w-3 h-3" />
          Add Location
        </button>
      </div>

      {showZipInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 flex gap-2"
        >
          <input
            type="text"
            value={zipCode}
            onChange={(e) => {
              setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5));
              setError("");
            }}
            placeholder="Enter zip code"
            maxLength={5}
            className={`flex-1 px-3 py-1 rounded-lg text-sm border ${
              darkMode
                ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
            } focus:outline-none focus:ring-2 ${
              darkMode ? "focus:ring-cyan-500" : "focus:ring-blue-500"
            }`}
          />
          <button
            onClick={handleAddZipCode}
            className={`px-4 py-1 rounded-lg text-sm font-medium transition-all ${
              darkMode
                ? "bg-cyan-500 text-white hover:bg-cyan-600"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowZipInput(false);
              setZipCode("");
              setError("");
            }}
            className={`px-4 py-1 rounded-lg text-sm transition-all ${
              darkMode
                ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            Cancel
          </button>
        </motion.div>
      )}

      {error && (
        <div className={`mb-4 px-3 py-2 rounded-lg text-sm ${
          darkMode ? "bg-red-900/50 text-red-400" : "bg-red-100 text-red-600"
        }`}>
          {error}
        </div>
      )}

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