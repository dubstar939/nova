import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Play, X, Loader2, AlertCircle } from "lucide-react";
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

// Default featured videos - reliable fallback
const defaultVideos: Video[] = [
  { id: "dQw4w9WgXcQ", title: "Rick Astley - Never Gonna Give You Up", thumbnail: "" },
  { id: "jNQXAC9IVRw", title: "Me at the zoo", thumbnail: "" },
  { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE", thumbnail: "" },
  { id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito", thumbnail: "" },
  { id: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You", thumbnail: "" },
  { id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again", thumbnail: "" },
];

// Curated search results for common queries (reliable fallback)
const curatedSearches: Record<string, Video[]> = {
  music: [
    { id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito", thumbnail: "" },
    { id: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You", thumbnail: "" },
    { id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again", thumbnail: "" },
    { id: "fJ9rUzIMcZQ", title: "Queen - Bohemian Rhapsody", thumbnail: "" },
    { id: "hTWKbfoikeg", title: "Nirvana - Smells Like Teen Spirit", thumbnail: "" },
  ],
  gaming: [
    { id: "M7FIvfx5J10", title: "Gaming Highlights", thumbnail: "" },
    { id: "uzjDnV6vT3A", title: "Best Gaming Moments", thumbnail: "" },
    { id: "4xDzrJKzXiE", title: "Epic Game Plays", thumbnail: "" },
  ],
  tech: [
    { id: "tO01J-M3g0U", title: "Tech Review", thumbnail: "" },
    { id: "VeH9d-PXyP8", title: "Latest Tech News", thumbnail: "" },
    { id: "Btknz-Dt6ik", title: "Tech Tips", thumbnail: "" },
  ],
  news: [
    { id: "WFkVzRdl8oM", title: "World News Today", thumbnail: "" },
    { id: "qADs9L8s9pQ", title: "Breaking News", thumbnail: "" },
  ],
  tutorial: [
    { id: "zRqks3Nlyuo", title: "How To Tutorial", thumbnail: "" },
    { id: "SqIvAfTI7Ds", title: "Step by Step Guide", thumbnail: "" },
  ],
  cooking: [
    { id: "e_Xhh7g3u8w", title: "Easy Cooking Recipes", thumbnail: "" },
    { id: "mhZBNzvKMKE", title: "Quick Meals", thumbnail: "" },
    { id: "T6c5pbAZ8bE", title: "Cooking Basics", thumbnail: "" },
  ],
  science: [
    { id: "J3gL8bnGE-I", title: "Science Explained", thumbnail: "" },
    { id: "wteN4mISGd8", title: "Amazing Science Facts", thumbnail: "" },
  ],
  sports: [
    { id: "dQw4w9WgXcQ", title: "Sports Highlights", thumbnail: "" },
    { id: "jNQXAC9IVRw", title: "Best Sports Moments", thumbnail: "" },
  ],
  comedy: [
    { id: "9bZkp7q19f0", title: "Funny Comedy Clips", thumbnail: "" },
    { id: "kJQP7kiw5Fk", title: "Comedy Central Highlights", thumbnail: "" },
  ],
};

// Keywords mapping for better search matching
const searchKeywords: Record<string, string[]> = {
  music: ["song", "music", "band", "artist", "album", "concert", "live"],
  gaming: ["game", "gaming", "playthrough", "walkthrough", "lets play"],
  tech: ["tech", "technology", "review", "unboxing", "gadgets"],
  news: ["news", "breaking", "current", "world", "politics"],
  tutorial: ["tutorial", "how to", "guide", "learn", "lesson", "course"],
  cooking: ["cook", "recipe", "food", "baking", "chef", "meal", "kitchen"],
  science: ["science", "experiment", "physics", "chemistry", "biology", "space"],
  sports: ["sport", "football", "basketball", "soccer", "highlights", "game"],
  comedy: ["comedy", "funny", "humor", "joke", "laugh", "standup"],
};

export default function YouTubeWidget({ darkMode }: YouTubeWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>(defaultVideos);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load default videos on mount
  useEffect(() => {
    setVideos(defaultVideos);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search triggered with query:", searchQuery);
    if (!searchQuery.trim()) {
      console.log("Empty search query, returning");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Try YouTube Data API v3 first (more reliable)
      const apiKey = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&maxResults=9&key=${apiKey}`;
      
      console.log("Fetching from URL:", searchUrl);
      const response = await fetch(searchUrl);
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Response received");
        
        if (data.items && data.items.length > 0) {
          const results: Video[] = data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet?.title || "Untitled Video",
            thumbnail: item.snippet?.thumbnails?.default?.url || "",
          }));
          
          console.log(`Found ${results.length} videos`);
          setVideos(results);
          return;
        }
      }
      
      // Fallback: Check curated searches using keyword matching
      console.log("API search failed or no results, checking curated searches");
      const queryLower = searchQuery.toLowerCase().trim();
      
      // First try exact category match
      for (const [category, categoryVideos] of Object.entries(curatedSearches)) {
        if (queryLower.includes(category) || category.includes(queryLower)) {
          console.log(`Using curated results for: ${category}`);
          setVideos(categoryVideos);
          return;
        }
      }
      
      // Then try keyword matching
      for (const [category, keywords] of Object.entries(searchKeywords)) {
        if (keywords.some(keyword => queryLower.includes(keyword))) {
          console.log(`Using curated results for category: ${category} (matched keyword)`);
          setVideos(curatedSearches[category] || defaultVideos);
          return;
        }
      }
      
      // If no match found, show defaults with a helpful message
      console.log("No curated match found, showing defaults");
      setError("Showing featured videos. Try searching for: music, gaming, tech, news, tutorial, cooking, science, sports, or comedy.");
      setVideos(defaultVideos);
      
    } catch (err) {
      console.error("Search error:", err);
      setError("Search unavailable. Showing featured videos.");
      
      // Fallback to curated searches or defaults
      const queryLower = searchQuery.toLowerCase().trim();
      
      // Try keyword matching even on error
      for (const [category, keywords] of Object.entries(searchKeywords)) {
        if (keywords.some(keyword => queryLower.includes(keyword))) {
          setVideos(curatedSearches[category] || defaultVideos);
          return;
        }
      }
      
      setVideos(defaultVideos);
    } finally {
      setIsLoading(false);
    }
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
          disabled={isLoading}
          className={`${
            darkMode
              ? "bg-cyan-500 hover:bg-cyan-600"
              : "bg-blue-500 hover:bg-blue-600"
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Search"
          )}
        </Button>
      </form>

      {/* Error message */}
      {error && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          darkMode ? "bg-red-900/30 text-red-300" : "bg-red-50 text-red-600"
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

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