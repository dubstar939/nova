import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";

interface RadioWidgetProps {
  darkMode: boolean;
}

interface Station {
  name: string;
  genre: string;
  frequency: string;
  url: string;
}

export default function RadioWidget({ darkMode }: RadioWidgetProps) {
  const [stations] = useState<Station[]>([
    { name: "Jazz FM", genre: "Jazz", frequency: "101.5", url: "https://stream.zeno.fm/f3bVV7qVF6ZUV" },
    { name: "Classical Radio", genre: "Classical", frequency: "92.3", url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_three" },
    { name: "Lo-Fi Beats", genre: "Lo-Fi", frequency: "Online", url: "https://stream.zeno.fm/0r5xa8g1v4zuv" },
    { name: "Rock Station", genre: "Rock", frequency: "105.7", url: "https://stream.zeno.fm/rq4xV7qVF6ZUV" },
    { name: "Electronic Wave", genre: "Electronic", frequency: "98.1", url: "https://stream.zeno.fm/vf3bV7qVF6ZUV" },
  ]);
  const [selectedStation, setSelectedStation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>(
    Array(20).fill(5)
  );
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

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

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

      <div className="flex flex-wrap gap-2">
        {stations.map((station, index) => (
          <Button
            key={station.name}
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