import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, Navigation } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface MapsWidgetProps {
  darkMode: boolean;
}

export default function MapsWidget({ darkMode }: MapsWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapType, setMapType] = useState<"street" | "satellite" | "terrain">("street");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const mapUrl = `https://www.openstreetmap.org/search?query=${encodeURIComponent(searchQuery)}`;
    window.open(mapUrl, "_blank");
    setSearchQuery("");
  };

  const openInMaps = () => {
    const mapUrl = mapType === "street" 
      ? "https://www.openstreetmap.org"
      : mapType === "satellite"
      ? "https://www.openstreetmap.org/#map=5/20/0&layers=S"
      : "https://www.openstreetmap.org/#map=5/20/0&layers=T";
    window.open(mapUrl, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border h-full flex flex-col ${
        darkMode
          ? "bg-slate-900/90 border-cyan-500/20"
          : "bg-white/90 border-blue-200"
      } backdrop-blur-sm`}
    >
      <div className="flex items-center gap-2 mb-4">
        <MapPin className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-blue-500"}`} />
        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
          Maps
        </h3>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              className={`w-full pl-9 ${
                darkMode
                  ? "bg-slate-800 border-cyan-500/30 text-white placeholder-slate-400"
                  : "bg-white border-blue-200 text-slate-800 placeholder-slate-400"
              }`}
            />
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                darkMode ? "text-cyan-400" : "text-blue-400"
              }`}
            />
          </div>
          <Button
            type="submit"
            className={`${darkMode ? "bg-cyan-500 hover:bg-cyan-600" : "bg-blue-500 hover:bg-blue-600"}`}
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>
      </form>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMapType("street")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            mapType === "street"
              ? darkMode
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                : "bg-blue-500/20 text-blue-600 border border-blue-500/50"
              : darkMode
              ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Street
        </button>
        <button
          onClick={() => setMapType("satellite")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            mapType === "satellite"
              ? darkMode
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                : "bg-blue-500/20 text-blue-600 border border-blue-500/50"
              : darkMode
              ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => setMapType("terrain")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
            mapType === "terrain"
              ? darkMode
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50"
                : "bg-blue-500/20 text-blue-600 border border-blue-500/50"
              : darkMode
              ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Terrain
        </button>
      </div>

      <div
        className={`flex-1 rounded-lg overflow-hidden border ${
          darkMode ? "border-cyan-500/20 bg-slate-800" : "border-blue-200 bg-slate-50"
        }`}
      >
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=-180%2C-85%2C180%2C85&layer=mapnik"
          className="w-full h-full border-0"
          title="OpenStreetMap"
          loading="lazy"
        />
      </div>

      <Button
        onClick={openInMaps}
        className={`mt-4 w-full ${
          darkMode
            ? "bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30"
            : "bg-slate-100 hover:bg-slate-200 text-blue-600 border border-blue-200"
        }`}
      >
        Open Full Map
      </Button>
    </motion.div>
  );
}
