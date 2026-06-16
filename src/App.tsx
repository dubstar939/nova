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
import AppLocker, { ALL_WIDGETS } from "./components/AppLocker";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { useLocalStorage } from "./hooks/useLocalStorage";

interface WidgetState {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minSize: { width: number; height: number };
}

// Helper function to create default widget state from IDs
const createDefaultWidgets = (widgetIds: string[]): WidgetState[] => {
  return widgetIds.map((id) => {
    const widgetDef = ALL_WIDGETS.find((w) => w.id === id);
    if (!widgetDef) {
      throw new Error(`Unknown widget ID: ${id}`);
    }
    return {
      id: widgetDef.id,
      title: widgetDef.title,
      position: widgetDef.defaultPosition,
      size: widgetDef.defaultSize,
      minSize: widgetDef.minSize,
    };
  });
};

// Constants for widget layout configuration
const WIDGET_LAYOUT = {
  CONTAINER_HEIGHT: 1200,
  DEFAULT_WIDGET_IDS: [
    "time",
    "weather",
    "youtube",
    "todo",
    "projects",
    "announcements",
    "news",
    "calllog",
    "radio",
    "calculator",
  ],
};

// Main app content component that uses theme context
function AppContent() {
  const [isClient, setIsClient] = useState(false);
  
  // Use custom hook for persistent widget layout (theme is handled by context)
  const [activeWidgetIds, setActiveWidgetIds] = useLocalStorage<string[]>(
    "activeWidgetIds",
    WIDGET_LAYOUT.DEFAULT_WIDGET_IDS
  );
  const [widgets, setWidgets] = useLocalStorage<WidgetState[]>(
    "widgetLayout",
    createDefaultWidgets(WIDGET_LAYOUT.DEFAULT_WIDGET_IDS)
  );
  const [isAppLockerOpen, setIsAppLockerOpen] = useState(false);
  const { darkMode } = useTheme();

  // Initialize client-side only features
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync widgets when active widget IDs change
  useEffect(() => {
    setWidgets((prevWidgets) => {
      const newWidgets = activeWidgetIds.map((id) => {
        const existing = prevWidgets.find((w) => w.id === id);
        if (existing) return existing;
        
        const widgetDef = ALL_WIDGETS.find((w) => w.id === id);
        if (!widgetDef) {
          throw new Error(`Unknown widget ID: ${id}`);
        }
        return {
          id: widgetDef.id,
          title: widgetDef.title,
          position: widgetDef.defaultPosition,
          size: widgetDef.defaultSize,
          minSize: widgetDef.minSize,
        };
      });
      return newWidgets;
    });
  }, [activeWidgetIds]);

  const handleResetLayout = useCallback(() => {
    setActiveWidgetIds([...WIDGET_LAYOUT.DEFAULT_WIDGET_IDS]);
    setWidgets(createDefaultWidgets([...WIDGET_LAYOUT.DEFAULT_WIDGET_IDS]));
  }, [setActiveWidgetIds, setWidgets]);

  const handleToggleAppLocker = useCallback(() => {
    setIsAppLockerOpen((prev) => !prev);
  }, []);

  const handleWidgetsChange = useCallback((newWidgetIds: string[]) => {
    setActiveWidgetIds(newWidgetIds);
  }, [setActiveWidgetIds]);

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
  const renderWidget = useCallback((widgetId: string) => {
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
  }, [darkMode]);

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
        <Header 
          darkMode={darkMode} 
          onResetLayout={handleResetLayout}
          onOpenAppLocker={handleToggleAppLocker}
        />

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
              {renderWidget(widget.id)}
            </WidgetContainer>
          ))}
        </main>
      </div>

      {/* App Locker Modal */}
      <AppLocker
        darkMode={darkMode}
        isOpen={isAppLockerOpen}
        onClose={() => setIsAppLockerOpen(false)}
        availableWidgets={ALL_WIDGETS}
        activeWidgetIds={activeWidgetIds}
        onWidgetsChange={handleWidgetsChange}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;