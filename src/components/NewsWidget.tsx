import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Newspaper, ChevronLeft, ChevronRight } from "lucide-react";

interface NewsWidgetProps {
  darkMode: boolean;
}

interface NewsItem {
  title: string;
  url: string;
}

const newsHeadlines: NewsItem[] = [
  {
    title: "Tech Giants Report Record Quarterly Earnings Amid AI Boom",
    url: "https://news.google.com/search?q=tech+earnings",
  },
  {
    title: "Federal Reserve Signals Potential Rate Cuts in Coming Months",
    url: "https://news.google.com/search?q=federal+reserve",
  },
  {
    title: "Climate Summit Reaches Historic Agreement on Carbon Emissions",
    url: "https://news.google.com/search?q=climate+summit",
  },
  {
    title: "Space Agency Announces New Mars Mission Timeline",
    url: "https://news.google.com/search?q=mars+mission",
  },
  {
    title: "Healthcare Industry Sees Major AI Integration Push",
    url: "https://news.google.com/search?q=healthcare+AI",
  },
  {
    title: "Electric Vehicle Sales Surge to Record Levels Worldwide",
    url: "https://news.google.com/search?q=electric+vehicles",
  },
];

export default function NewsWidget({ darkMode }: NewsWidgetProps) {
  const [currentHeadline, setCurrentHeadline] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % newsHeadlines.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrev = () => {
    setCurrentHeadline((prev) => (prev - 1 + newsHeadlines.length) % newsHeadlines.length);
  };

  const goToNext = () => {
    setCurrentHeadline((prev) => (prev + 1) % newsHeadlines.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full h-8 ${
        darkMode
          ? "bg-slate-900/90 border-b border-cyan-500/20"
          : "bg-white/90 border-b border-blue-200"
      } backdrop-blur-sm flex items-center px-3 gap-2`}
    >
      {/* Label */}
      <div
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${
          darkMode ? "bg-cyan-500/10" : "bg-blue-50"
        }`}
      >
        <Newspaper className={`w-3 h-3 ${darkMode ? "text-cyan-400" : "text-blue-500"}`} />
        <span className={`text-[10px] font-semibold ${darkMode ? "text-cyan-400" : "text-blue-600"}`}>
          Breaking News
        </span>
      </div>

      {/* Divider */}
      <div className={`w-px h-4 ${darkMode ? "bg-slate-700" : "bg-slate-300"}`} />

      {/* Headline */}
      <div className="flex-1 overflow-hidden">
        <motion.a
          key={currentHeadline}
          href={newsHeadlines[currentHeadline].url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex items-center gap-1.5 text-xs ${
            darkMode ? "text-slate-200 hover:text-cyan-400" : "text-slate-700 hover:text-blue-600"
          } transition-colors`}
        >
          <span className="truncate max-w-[calc(100vw-400px)]">
            {newsHeadlines[currentHeadline].title}
          </span>
          <ExternalLink className="w-2.5 h-2.5 flex-shrink-0 opacity-50" />
        </motion.a>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        <button
          onClick={goToPrev}
          className={`p-0.5 rounded hover:bg-opacity-20 ${
            darkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-200 text-slate-600"
          }`}
        >
          <ChevronLeft className="w-3 h-3" />
        </button>
        <button
          onClick={goToNext}
          className={`p-0.5 rounded hover:bg-opacity-20 ${
            darkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-200 text-slate-600"
          }`}
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
