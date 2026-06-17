import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface RadioWidgetProps {
  darkMode: boolean;
}

interface Station {
  id: string;
  name: string;
  genre: string;
  frequency: string;
  url: string;
}

export default function RadioWidget({ darkMode }: RadioWidgetProps) {
  const [stations] = useState<Station[]>([
    { name: "Jazz FM", genre: "Jazz", frequency: "102.2", url: "https://stream.zeno.fm/f3bVV7qVF6ZUV" },
    { name: "Classical Radio", genre: "Classical", frequency: "Online", url: "https://media-ssl.musicradio.com/ClassicFM" },
    { name: "Lo-Fi Beats", genre: "Lo-Fi", frequency: "Online", url: "https://stream.zeno.fm/0r5xa8g1v4zuv" },
    { name: "Rock Station", genre: "Rock", frequency: "95.5", url: "https://stream.zeno.fm/rq4xV7qVF6ZUV" },
    { name: "Electronic Wave", genre: "Electronic", frequency: "98.1", url: "https://stream.zeno.fm/vf3bV7qVF6ZUV" },
    { name: "BBC News", genre: "News", frequency: "Online", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
    { name: "ESPN Radio", genre: "Sports", frequency: "Online", url: "https://stream.zeno.fm/sportsradio" },
    { name: "Chillhop", genre: "Chill hop", frequency: "Online", url: "https://stream.zeno.fm/chillhop" },
    { name: "Dubstep FM", genre: "Dubstep", frequency: "Online", url: "https://stream.zeno.fm/dubstep" },
  ]);
  const [selectedStation, setSelectedStation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(
    Array(20).fill(5)
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; genre: string; url: string; frequency: string }>({
    name: "",
    genre: "",
    url: "",
    frequency: ""
  });
  
  const animationRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume / 100;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = stations[selectedStation].url;
      if (isPlaying) {
        audioRef.current.load();
        audioRef.current.play().catch((err) => {
          console.error("Error playing station:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [selectedStation, stations]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error("Error playing station:", err);
        setIsPlaying(false);
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Visualizer animation
  useEffect(() => {
    if (isPlaying && !isMuted) {
      const animate = () => {
        setVisualizerBars(
          Array(20)
            .fill(0)
            .map(() => Math.random() * 30 + 10)
        );
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setVisualizerBars(Array(20).fill(5));
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current || !stations[selectedStation]) return;
    
    const currentStation = stations[selectedStation];
    
    if (isPlaying) {
      audioRef.current.pause();
      // State will be updated by the 'pause' event listener
    } else {
      // Set the source if not already set or if station changed
      if (audioRef.current.src !== currentStation.url) {
        audioRef.current.src = currentStation.url;
      }
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      
      try {
        await audioRef.current.play();
        // State will be updated by the 'play' event listener
      } catch (error) {
        console.error("Failed to play stream:", error);
        setIsPlaying(false);
        setVisualizerBars(Array(20).fill(5));
      }
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleAddStation = () => {
    if (!editForm.name || !editForm.url) return;
    
    const newStation: Station = {
      id: Date.now().toString(),
      name: editForm.name,
      genre: editForm.genre || "Unknown",
      url: editForm.url,
      frequency: editForm.frequency || "Online"
    };
    
    const updatedStations = [...stations, newStation];
    setStations(updatedStations);
    saveStations(updatedStations);
    setShowAddForm(false);
    setEditForm({ name: "", genre: "", url: "", frequency: "" });
  };

  const handleDeleteStation = (id: string) => {
    if (stations.length <= 1) {
      alert("You must have at least one station.");
      return;
    }
    
    const updatedStations = stations.filter(s => s.id !== id);
    setStations(updatedStations);
    saveStations(updatedStations);
    
    // Adjust selected index if needed
    if (selectedStation >= updatedStations.length) {
      setSelectedStation(Math.max(0, updatedStations.length - 1));
    }
  };

  const handleEditStation = (station: Station) => {
    setEditingId(station.id);
    setEditForm({
      name: station.name,
      genre: station.genre,
      url: station.url,
      frequency: station.frequency || ""
    });
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm.name || !editForm.url) return;
    
    const updatedStations = stations.map(s => 
      s.id === id 
        ? { ...s, name: editForm.name, genre: editForm.genre, url: editForm.url, frequency: editForm.frequency || "Online" }
        : s
    );
    
    setStations(updatedStations);
    saveStations(updatedStations);
    setEditingId(null);
    setEditForm({ name: "", genre: "", url: "", frequency: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", genre: "", url: "", frequency: "" });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Button
          onClick={togglePlay}
          className={`w-14 h-14 rounded-full flex items-center justify-center ${
            darkMode
              ? "bg-cyan-500 hover:bg-cyan-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-1" />
          )}
        </Button>

        <div className="flex-1">
          <h4 className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
            {stations[selectedStation].name}
          </h4>
          <p className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
            {stations[selectedStation].genre} • {stations[selectedStation].frequency}
          </p>
        </div>

        <button onClick={toggleMute} className="p-2">
          {isMuted ? (
            <VolumeX className={`w-5 h-5 ${darkMode ? "text-slate-400" : "text-slate-500"}`} />
          ) : (
            <Volume2 className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-blue-500"}`} />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className={`flex-1 h-2 rounded-full appearance-none cursor-pointer ${
            darkMode ? "bg-slate-700" : "bg-slate-200"
          }`}
          style={{
            background: darkMode
              ? `linear-gradient(to right, #06b6d4 ${volume}%, #334155 ${volume}%)`
              : `linear-gradient(to right, #3b82f6 ${volume}%, #e2e8f0 ${volume}%)`,
          }}
        />
        <span className={`text-sm w-10 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
          {isMuted ? "0%" : `${volume}%`}
        </span>
      </div>

      <div className="flex items-end justify-center gap-1 h-12 mb-4">
        {visualizerBars.map((height, i) => (
          <motion.div
            key={i}
            animate={{ height }}
            transition={{ duration: 0.1 }}
            className={`w-2 rounded-t ${
              darkMode ? "bg-cyan-500" : "bg-blue-500"
            }`}
          />
        ))}
      </div>

      {/* Station Management Section */}
      <div className={`mb-4 p-3 rounded-lg ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
        <div className="flex items-center justify-between mb-2">
          <h5 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
            Manage Stations
          </h5>
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                darkMode
                  ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              <Plus className="w-3 h-3" /> Add
            </Button>
          )}
        </div>

        {/* Add Station Form */}
        {showAddForm && (
          <div className="space-y-2 mb-3">
            <Input
              placeholder="Station Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className={`text-sm ${darkMode ? "bg-slate-700 text-white border-slate-600" : "bg-white text-slate-800 border-slate-300"}`}
            />
            <Input
              placeholder="Genre (optional)"
              value={editForm.genre}
              onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })}
              className={`text-sm ${darkMode ? "bg-slate-700 text-white border-slate-600" : "bg-white text-slate-800 border-slate-300"}`}
            />
            <Input
              placeholder="Stream URL (required)"
              value={editForm.url}
              onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
              className={`text-sm ${darkMode ? "bg-slate-700 text-white border-slate-600" : "bg-white text-slate-800 border-slate-300"}`}
            />
            <Input
              placeholder="Frequency (optional)"
              value={editForm.frequency}
              onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value })}
              className={`text-sm ${darkMode ? "bg-slate-700 text-white border-slate-600" : "bg-white text-slate-800 border-slate-300"}`}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddStation}
                className={`flex-1 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 ${
                  darkMode
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                <Save className="w-3 h-3" /> Save
              </Button>
              <Button
                onClick={() => {
                  setShowAddForm(false);
                  setEditForm({ name: "", genre: "", url: "", frequency: "" });
                }}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${
                  darkMode
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                <X className="w-3 h-3" /> Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Station List with Edit/Delete */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {stations.map((station, index) => (
            <div
              key={station.id}
              className={`flex items-center justify-between p-2 rounded ${
                selectedStation === index
                  ? darkMode
                    ? "bg-cyan-900/50 border border-cyan-500"
                    : "bg-blue-100 border border-blue-300"
                  : darkMode
                  ? "bg-slate-700/50 border border-slate-600"
                  : "bg-white border border-slate-200"
              }`}
            >
              {editingId === station.id ? (
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className={`text-xs ${darkMode ? "bg-slate-600 text-white border-slate-500" : "bg-white text-slate-800 border-slate-300"}`}
                  />
                  <Input
                    placeholder="URL"
                    value={editForm.url}
                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                    className={`text-xs ${darkMode ? "bg-slate-600 text-white border-slate-500" : "bg-white text-slate-800 border-slate-300"}`}
                  />
                  <div className="flex gap-1 mt-1">
                    <Button
                      onClick={() => handleSaveEdit(station.id)}
                      className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
                        darkMode
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }`}
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
                        darkMode
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setSelectedStation(index)}
                  >
                    <p className={`text-xs font-medium ${darkMode ? "text-white" : "text-slate-800"}`}>
                      {station.name}
                    </p>
                    <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {station.genre} • {station.frequency}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      onClick={() => handleEditStation(station)}
                      className={`px-2 py-0.5 rounded text-xs ${
                        darkMode
                          ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                          : "bg-yellow-500 hover:bg-yellow-600 text-white"
                      }`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteStation(station.id)}
                      className={`px-2 py-0.5 rounded text-xs ${
                        darkMode
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Select Buttons */}
      <div className="flex flex-wrap gap-2">
        {stations.map((station, index) => (
          <Button
            key={station.id}
            onClick={() => setSelectedStation(index)}
            className={`px-3 py-1 rounded-full text-xs ${
              selectedStation === index
                ? darkMode
                  ? "bg-cyan-500 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {station.name}
          </Button>
        ))}
      </div>
    </div>
  );
}