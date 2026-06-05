import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeadline((prev) => (prev + 1) % newsHeadlines.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
      <h3
        className={`text-lg font-semibold mb-4 ${
          darkMode ? "text-white" : "text-slate-800"
        }`}
      >
        News Ticker
      </h3>

      <div className="overflow-hidden">
        <motion.div
          key={currentHeadline}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`p-4 rounded-lg ${
            darkMode ? "bg-slate-800" : "bg-slate-50"
          }`}
        >
          <a
            href={newsHeadlines[currentHeadline].url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-start gap-2 group ${
              darkMode ? "text-white" : "text-slate-800"
            } hover:underline`}
          >
            <p className="text-sm flex-1">
              {newsHeadlines[currentHeadline].title}
            </p>
            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 flex-shrink-0 mt-0.5" />
          </a>
          <p
            className={`text-xs mt-2 ${
              darkMode ? "text-cyan-400" : "text-blue-500"
            }`}
          >
            {newsHeadlines[currentHeadline].source}
          </p>
        </motion.div>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {newsHeadlines.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentHeadline(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentHeadline === index
                ? darkMode
                  ? "bg-cyan-500"
                  : "bg-blue-500"
                : darkMode
                ? "bg-slate-700"
                : "bg-slate-300"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}