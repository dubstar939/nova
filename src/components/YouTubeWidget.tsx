import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Play, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface YouTubeWidgetProps {
  darkMode: boolean;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
}

export default function YouTubeWidget({ darkMode }: YouTubeWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos] = useState<Video[]>([
    { id: "dQw4w9WgXcQ", title: "Music Video 1", thumbnail: "" },
    { id: "jNQXAC9IVRw", title: "Me at the zoo", thumbnail: "" },
    { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE", thumbnail: "" },
  ]);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`, "_blank");
  };

  const playVideo = (video: Video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
  };

  const closePlayer = () => {
    setIsPlaying(false);
    setCurrentVideo(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${
        darkMode
          ? "bg-slate-900/90 border-cyan-500/20"
          : "bg-white/90 border-blue-200"
      } backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-slate-800"
          }`}
        >
          YouTube
        </h3>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search YouTube..."
            className={`w-full pl-10 ${
              darkMode
                ? "bg-slate-800 border-cyan-500/30 text-white placeholder-slate-400"
                : "bg-slate-50 border-blue-200 text-slate-800 placeholder-slate-400"
            }`}
          />
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
              darkMode ? "text-cyan-400" : "text-blue-500"
            }`}
          />
        </div>
        <Button
          type="submit"
          className={`${
            darkMode
              ? "bg-cyan-500 hover:bg-cyan-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Search
        </Button>
      </form>

      {isPlaying && currentVideo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-4 rounded-lg overflow-hidden"
        >
          <button
            onClick={closePlayer}
            className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/50 hover:bg-black/70"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="aspect-video bg-slate-800">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {videos.map((video) => (
          <motion.button
            key={video.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => playVideo(video)}
            className={`relative aspect-video rounded-lg overflow-hidden ${
              darkMode ? "bg-slate-800" : "bg-slate-200"
            }`}
          >
            <div
              className={`absolute inset-0 flex items-center justify-center ${
                darkMode ? "bg-slate-700/50" : "bg-slate-300/50"
              }`}
            >
              <Play
                className={`w-8 h-8 ${
                  darkMode ? "text-cyan-400" : "text-blue-500"
                }`}
              />
            </div>
            <img
              src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}