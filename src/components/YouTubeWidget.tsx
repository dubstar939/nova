import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Play, X, Loader2 } from "lucide-react";
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

// Default featured videos
const defaultVideos: Video[] = [
  { id: "dQw4w9WgXcQ", title: "Rick Astley - Never Gonna Give You Up", thumbnail: "" },
  { id: "jNQXAC9IVRw", title: "Me at the zoo", thumbnail: "" },
  { id: "9bZkp7q19f0", title: "PSY - GANGNAM STYLE", thumbnail: "" },
];

// Alternative video sources for search fallback
const fallbackVideos: Record<string, Video[]> = {
  music: [
    { id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito", thumbnail: "" },
    { id: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You", thumbnail: "" },
    { id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again", thumbnail: "" },
  ],
  gaming: [
    { id: "M7FIvfx5J10", title: "Gaming Highlights", thumbnail: "" },
    { id: "hTWKbfoikeg", title: "Nirvana - Smells Like Teen Spirit", thumbnail: "" },
    { id: "fJ9rUzIMcZQ", title: "Queen - Bohemian Rhapsody", thumbnail: "" },
  ],
  tech: [
    { id: "tO01J-M3g0U", title: "Tech Review", thumbnail: "" },
    { id: "y6120QOlsfU", title: "Darude - Sandstorm", thumbnail: "" },
    { id: "ZZ5LpwO-An4", title: "HEYYEYAAEYAAAEYAEYAA", thumbnail: "" },
  ],
};

export default function YouTubeWidget({ darkMode }: YouTubeWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<Video[]>(defaultVideos);
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search triggered with query:", searchQuery);
    if (!searchQuery.trim()) {
      console.log("Empty search query, returning");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use YouTube's InnerTube API directly
      const apiKey = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
      const searchUrl = `https://www.youtube.com/youtubei/v1/search?key=${apiKey}`;
      
      const requestBody = {
        context: {
          client: {
            hl: "en",
            gl: "US",
            clientName: "WEB",
            clientVersion: "2.20260611.01.00"
          }
        },
        query: searchQuery
      };
      
      console.log("Fetching from URL:", searchUrl);
      const response = await fetch(searchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Response received");
        
        // Parse the InnerTube response
        const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
        let results: Video[] = [];
        
        if (contents && Array.isArray(contents)) {
          for (const section of contents) {
            const itemSection = section.itemSectionRenderer?.contents;
            if (itemSection && Array.isArray(itemSection)) {
              for (const item of itemSection) {
                const videoRenderer = item.videoRenderer;
                if (videoRenderer) {
                  const videoId = videoRenderer.videoId;
                  const title = videoRenderer.title?.runs?.[0]?.text || "";
                  if (videoId) {
                    results.push({
                      id: videoId,
                      title: title,
                      thumbnail: ""
                    });
                  }
                }
              }
            }
          }
        }
        
        console.log(`Found ${results.length} videos`);
        
        if (results.length > 0) {
          setVideos(results.slice(0, 9));
        } else {
          // Check if query matches any fallback category
          const queryLower = searchQuery.toLowerCase();
          let fallbackResults: Video[] = [];
          
          for (const [category, videos] of Object.entries(fallbackVideos)) {
            if (queryLower.includes(category)) {
              fallbackResults = videos;
              break;
            }
          }
          
          if (fallbackResults.length > 0) {
            console.log("Using category fallback videos");
            setVideos(fallbackResults);
          } else {
            console.log("No results found, using default videos");
            setVideos(defaultVideos);
          }
        }
      } else {
        console.log("Response not ok, checking fallback");
        // Check if query matches any fallback category
        const queryLower = searchQuery.toLowerCase();
        for (const [category, videos] of Object.entries(fallbackVideos)) {
          if (queryLower.includes(category)) {
            setVideos(videos);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      // Check if query matches any fallback category even on error
      const queryLower = searchQuery.toLowerCase();
      for (const [category, videos] of Object.entries(fallbackVideos)) {
        if (queryLower.includes(category)) {
          setVideos(videos);
          break;
        }
      }
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