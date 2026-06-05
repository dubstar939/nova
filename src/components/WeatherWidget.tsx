import { useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Wind, Thermometer } from "lucide-react";

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

const weatherData: WeatherData[] = [
  { city: "New York", temp: 72, condition: "Partly Cloudy", humidity: 65, wind: 12 },
  { city: "Los Angeles", temp: 85, condition: "Sunny", humidity: 45, wind: 8 },
  { city: "Chicago", temp: 68, condition: "Cloudy", humidity: 70, wind: 15 },
  { city: "Houston", temp: 92, condition: "Sunny", humidity: 55, wind: 6 },
  { city: "Phoenix", temp: 105, condition: "Sunny", humidity: 20, wind: 5 },
];

export default function WeatherWidget({ darkMode }: WeatherWidgetProps) {
  const [selectedCity, setSelectedCity] = useState(0);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return <Sun className={`w-12 h-12 ${darkMode ? "text-amber-400" : "text-amber-500"}`} />;
      case "cloudy":
        return <Cloud className={`w-12 h-12 ${darkMode ? "text-slate-400" : "text-slate-500"}`} />;
      case "partly cloudy":
        return (
          <div className="relative">
            <Sun className={`w-10 h-10 ${darkMode ? "text-amber-400" : "text-amber-500"}`} />
            <Cloud className={`w-8 h-8 absolute -right-2 -bottom-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`} />
          </div>
        );
      case "rainy":
        return <CloudRain className={`w-12 h-12 ${darkMode ? "text-blue-400" : "text-blue-500"}`} />;
      default:
        return <Sun className={`w-12 h-12 ${darkMode ? "text-amber-400" : "text-amber-500"}`} />;
    }
  };

  const weather = weatherData[selectedCity];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-2 mb-4">
        {weatherData.map((w, index) => (
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

      <motion.div
        key={selectedCity}
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