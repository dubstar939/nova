import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

interface NewsWidgetProps {
  darkMode: boolean;
}

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

const newsHeadlines: NewsItem[] = [
  {
    title: "Tech Giants Report Record Quarterly Earnings Amid AI Boom",
    url: "https://news.google.com/search?q=tech+earnings",
    source: "Tech News",
  },
  {
    title: "Federal Reserve Signals Potential Rate Cuts in Coming Months",
    url: "https://news.google.com/search?q=federal+reserve",
    source: "Financial Times",
  },
  {
    title: "Climate Summit Reaches Historic Agreement on Carbon Emissions",
    url: "https://news.google.com/search?q=climate+summit",
    source: "World News",
  },
  {
    title: "Space Agency Announces New Mars Mission Timeline",
    url: "https://news.google.com/search?q=mars+mission",
    source: "Space News",
  },
  {
    title: "Healthcare Industry Sees Major AI Integration Push",
    url: "https://news.google.com/search?q=healthcare+AI",
    source: "Health News",
  },
  {
    title: "Electric Vehicle Sales Surge to Record Levels Worldwide",
    url: "https://news.google.com/search?q=electric+vehicles",
    source: "Auto News",
  },
];

export default function NewsWidget({ darkMode }: NewsWidgetProps) {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % newsHeadlines.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const goToPrevious = () => {
    setCurrentHeadline((prev) => (prev - 1 + newsHeadlines.length) % newsHeadlines.length);
  };

  const goToNext = () => {
    setCurrentHeadline((prev) => (prev + 1) % newsHeadlines.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`w-full h-10 flex items-center overflow-hidden ${
        darkMode
          ? "bg-slate-900/95 border-b border-cyan-500/20"
          : "bg-white/95 border-b border-blue-200"
      } backdrop-blur-sm`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-3 px-4 flex-shrink-0">
        <span className={`text-xs font-bold uppercase tracking-wider ${
          darkMode ? "text-cyan-400" : "text-blue-600"
        }`}>
          NEWS
        </span>
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.a
            key={currentHeadline}
            href={newsHeadlines[currentHeadline].url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`flex items-center gap-2 text-sm hover:underline ${
              darkMode ? "text-white" : "text-slate-800"
            }`}
          >
            <span className="truncate">{newsHeadlines[currentHeadline].title}</span>
            <ExternalLink className="w-3 h-3 opacity-50 flex-shrink-0" />
          </motion.a>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 px-4 flex-shrink-0">
        <button
          onClick={goToPrevious}
          className={`p-1 rounded hover:bg-opacity-20 ${
            darkMode ? "hover:bg-cyan-400 text-cyan-400" : "hover:bg-blue-500 text-blue-500"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goToNext}
          className={`p-1 rounded hover:bg-opacity-20 ${
            darkMode ? "hover:bg-cyan-400 text-cyan-400" : "hover:bg-blue-500 text-blue-500"
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          {newsHeadlines[currentHeadline].source}
        </span>
      </div>
    </motion.div>
  );
}