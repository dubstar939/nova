import { useState, useEffect, useCallback } from "react";
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
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useLocalStorage } from "./hooks/useLocalStorage";

// Constants for widget layout configuration
const WIDGET_LAYOUT = {
  CONTAINER_HEIGHT: 1200,
  DEFAULT_WIDGETS: [
    {
      id: "time",
      title: "Time & Calendar",
      position: { x: 20, y: 100 },
      size: { width: 500, height: 320 },
      minSize: { width: 400, height: 300 },
    },
    {
      id: "weather",
      title: "Weather",
      position: { x: 540, y: 100 },
      size: { width: 380, height: 240 },
      minSize: { width: 300, height: 200 },
    },
    {
      id: "youtube",
      title: "YouTube",
      position: { x: 940, y: 100 },
      size: { width: 360, height: 360 },
      minSize: { width: 320, height: 300 },
    },
    {
      id: "todo",
      title: "To-Do List",
      position: { x: 20, y: 440 },
      size: { width: 380, height: 340 },
      minSize: { width: 300, height: 250 },
    },
    {
      id: "projects",
      title: "Projects",
      position: { x: 420, y: 440 },
      size: { width: 360, height: 340 },
      minSize: { width: 300, height: 300 },
    },
    {
      id: "announcements",
      title: "Announcements",
      position: { x: 800, y: 480 },
      size: { width: 360, height: 300 },
      minSize: { width: 300, height: 250 },
    },
    {
      id: "news",
      title: "News Ticker",
      position: { x: 1180, y: 100 },
      size: { width: 340, height: 280 },
      minSize: { width: 280, height: 200 },
    },
    {
      id: "calllog",
      title: "Call Log",
      position: { x: 1180, y: 400 },
      size: { width: 340, height: 320 },
      minSize: { width: 320, height: 280 },
    },
    {
      id: "radio",
      title: "Internet Radio",
      position: { x: 20, y: 800 },
      size: { width: 380, height: 280 },
      minSize: { width: 350, height: 250 },
    },
    {
      id: "calculator",
      title: "Calculator",
      position: { x: 420, y: 800 },
      size: { width: 280, height: 380 },
      minSize: { width: 250, height: 350 },
    },
  ] as WidgetState[],
};

interface WidgetState {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minSize: { width: number; height: number };
}

function App() {
  const [isClient, setIsClient] = useState(false);
  
  // Use custom hook for persistent dark mode and widget layout
  const [darkMode, setDarkMode] = useLocalStorage<boolean>("darkMode", true);
  const [widgets, setWidgets] = useLocalStorage<WidgetState[]>("widgetLayout", WIDGET_LAYOUT.DEFAULT_WIDGETS);

  // Initialize client-side only features
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (!isClient) return;
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode, isClient]);

  const handleResetLayout = useCallback(() => {
    setWidgets(WIDGET_LAYOUT.DEFAULT_WIDGETS);
  }, [setWidgets]);

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
    <ErrorBoundary>
      <div
        className={`min-h-screen ${
          darkMode ? "bg-slate-950" : "bg-slate-100"
        } transition-colors duration-500`}
      >
        <ParticleBackground darkMode={darkMode} />
        <div className="relative z-10">
          <Header darkMode={darkMode} setDarkMode={setDarkMode} onResetLayout={handleResetLayout} />

          <main 
            className="relative w-full" 
            style={{ height: `${WIDGET_LAYOUT.CONTAINER_HEIGHT}px` }}
            role="main"
            aria-label="Dashboard widgets"
          >
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
    </ErrorBoundary>
  );
}

export default App;