import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Maximize2 } from "lucide-react";
import { Input } from "./ui/input";

interface MapsWidgetProps {
  darkMode: boolean;
}

export default function MapsWidget({ darkMode }: MapsWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapType, setMapType] = useState<"street" | "satellite" | "terrain">("street");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Open search in full OpenStreetMap
    window.open(`https://www.openstreetmap.org/search?query=${encodeURIComponent(searchQuery)}`, "_blank");
  };

  const getMapUrl = () => {
    const baseUrl = "https://www.openstreetmap.org/export/embed.html";
    const params = new URLSearchParams({
      bbox: "-10,50,2,60", // Default to UK/Europe view
      layer: mapType === "satellite" ? "mapnik" : mapType === "terrain" ? "cyclemap" : "mapnik",
    });
    return `${baseUrl}?${params.toString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border ${
        darkMode
          ? "bg-slate-900/90 border-cyan-500/20"
          : "bg-white/90 border-blue-200"
      } backdrop-blur-sm h-full flex flex-col`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`text-sm font-semibold flex items-center gap-2 ${
            darkMode ? "text-white" : "text-slate-800"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Maps
        </h3>
        <a
          href="https://www.openstreetmap.org"
          target="_blank"
          rel="noopener noreferrer"
          className={`p-1.5 rounded-lg transition-colors ${
            darkMode ? "hover:bg-slate-800 text-cyan-400" : "hover:bg-blue-50 text-blue-500"
          }`}
          title="Open Full Map"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </a>
      </div>

      <form onSubmit={handleSearch} className="mb-3">
        <div className="relative">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location..."
            className={`w-full h-8 pl-8 pr-3 text-xs rounded-lg border ${
              darkMode
                ? "bg-slate-800 border-cyan-500/30 text-white placeholder-slate-400 focus:border-cyan-400"
                : "bg-white border-blue-200 text-slate-800 placeholder-slate-400 focus:border-blue-400"
            } outline-none`}
          />
          <Search
            className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
              darkMode ? "text-cyan-400" : "text-blue-400"
            }`}
          />
        </div>
      </form>

      <div className="flex gap-1 mb-3">
        {(["street", "satellite", "terrain"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setMapType(type)}
            className={`flex-1 py-1 px-2 text-[10px] rounded-md transition-all capitalize ${
              mapType === type
                ? darkMode
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                : darkMode
                ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className={`flex-1 rounded-lg overflow-hidden ${
        darkMode ? "border border-slate-700" : "border border-slate-200"
      }`}>
        <iframe
          src={getMapUrl()}
          className="w-full h-full min-h-[200px]"
          title="OpenStreetMap"
          loading="lazy"
        />
      </div>

      <div className={`mt-2 text-[10px] text-center ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
        Powered by OpenStreetMap
      </div>
    </motion.div>
  );
}
