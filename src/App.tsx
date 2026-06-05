import { useState, useEffect, useCallback, useMemo } from "react";
import Header from "./components/Header";
import TimeWidget from "./components/TimeWidget";
import WeatherWidget from "./components/WeatherWidget";
import TodoWidget from "./components/TodoWidget";
import NewsWidget from "./components/NewsWidget";
import CalculatorWidget from "./components/CalculatorWidget";
import RadioWidget from "./components/RadioWidget";
import ProjectWidget from "./components/ProjectWidget";
import AnnouncementWidget from "./components/AnnouncementWidget";
import CallLogWidget from "./components/CallLogWidget";
import YouTubeWidget from "./components/YouTubeWidget";
import ParticleBackground from "./components/ParticleBackground";
import WidgetContainer from "./components/WidgetContainer";

interface WidgetState {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minSize: { width: number; height: number };
}

const defaultWidgets: WidgetState[] = [
  {
    id: "time",
    title: "Time & Calendar",
    position: { x: 20, y: 100 },
    size: { width: 600, height: 350 },
    minSize: { width: 400, height: 300 },
  },
  {
    id: "weather",
    title: "Weather",
    position: { x: 640, y: 100 },
    size: { width: 400, height: 250 },
    minSize: { width: 300, height: 200 },
  },
  {
    id: "todo",
    title: "To-Do List",
    position: { x: 20, y: 470 },
    size: { width: 400, height: 350 },
    minSize: { width: 300, height: 250 },
  },
  {
    id: "news",
    title: "News Ticker",
    position: { x: 440, y: 470 },
    size: { width: 350, height: 250 },
    minSize: { width: 280, height: 200 },
  },
  {
    id: "calllog",
    title: "Call Log",
    position: { x: 810, y: 370 },
    size: { width: 380, height: 350 },
    minSize: { width: 320, height: 280 },
  },
  {
    id: "calculator",
    title: "Calculator",
    position: { x: 810, y: 740 },
    size: { width: 280, height: 400 },
    minSize: { width: 250, height: 350 },
  },
  {
    id: "radio",
    title: "Internet Radio",
    position: { x: 20, y: 840 },
    size: { width: 400, height: 280 },
    minSize: { width: 350, height: 250 },
  },
  {
    id: "projects",
    title: "Projects",
    position: { x: 440, y: 740 },
    size: { width: 350, height: 380 },
    minSize: { width: 300, height: 300 },
  },
  {
    id: "youtube",
    title: "YouTube",
    position: { x: 1110, y: 100 },
    size: { width: 380, height: 400 },
    minSize: { width: 320, height: 300 },
  },
  {
    id: "announcements",
    title: "Announcements",
    position: { x: 1110, y: 520 },
    size: { width: 380, height: 300 },
    minSize: { width: 300, height: 250 },
  },
];

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [widgets, setWidgets] = useState<WidgetState[]>(defaultWidgets);
  const [isClient, setIsClient] = useState(false);

  // Load persisted data once on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedMode = localStorage.getItem("darkMode");
      const savedLayout = localStorage.getItem("widgetLayout");
      if (savedMode !== null) setDarkMode(JSON.parse(savedMode));
      if (savedLayout) setWidgets(JSON.parse(savedLayout));
    } catch (e) {
      console.error("Failed to load from localStorage", e);
    }
  }, []);

  // Persist dark mode changes
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode, isClient]);

  // Persist layout changes
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem("widgetLayout", JSON.stringify(widgets));
  }, [widgets, isClient]);

  const handlePositionChange = useCallback(
    (id: string, position: { x: number; y: number }) => {
      setWidgets((prev) =>
        prev.map((w) => (w.id === id ? { ...w, position } : w))
      );
    },
    []
  );

  const handleSizeChange = useCallback(
    (id: string, size: { width: number; height: number }) => {
      setWidgets((prev) =>
        prev.map((w) => (w.id === id ? { ...w, size } : w))
      );
    },
    []
  );

  // Memoize widget renderer to prevent unnecessary re-renders
  const renderWidget = useCallback((widgetId: string, darkMode: boolean) => {
    switch (widgetId) {
      case "time":
        return <TimeWidget darkMode={darkMode} />;
      case "weather":
        return <WeatherWidget darkMode={darkMode} />;
      case "todo":
        return <TodoWidget darkMode={darkMode} />;
      case "news":
        return <NewsWidget darkMode={darkMode} />;
      case "calllog":
        return <CallLogWidget darkMode={darkMode} />;
      case "calculator":
        return <CalculatorWidget darkMode={darkMode} />;
      case "radio":
        return <RadioWidget darkMode={darkMode} />;
      case "projects":
        return <ProjectWidget darkMode={darkMode} />;
      case "youtube":
        return <YouTubeWidget darkMode={darkMode} />;
      case "announcements":
        return <AnnouncementWidget darkMode={darkMode} />;
      default:
        return null;
    }
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-slate-950" : "bg-slate-100"
      } transition-colors duration-500`}
    >
      <ParticleBackground darkMode={darkMode} />
      <div className="relative z-10">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />

        <main className="relative w-full" style={{ height: "1200px" }}>
          {widgets.map((widget) => (
            <WidgetContainer
              key={widget.id}
              id={widget.id}
              title={widget.title}
              darkMode={darkMode}
              initialPosition={widget.position}
              initialSize={widget.size}
              minSize={widget.minSize}
              onPositionChange={handlePositionChange}
              onSizeChange={handleSizeChange}
            >
              {renderWidget(widget.id, darkMode)}
            </WidgetContainer>
          ))}
        </main>
      </div>
    </div>
  );
}

export default App;