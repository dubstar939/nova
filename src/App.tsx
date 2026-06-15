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
import { useLocalStorage } from "./hooks/useLocalStorage";

interface WidgetConfig {
  id: string;
  title: string;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
  component: React.ComponentType<{ darkMode: boolean }>;
}

interface WidgetState {
  id: string;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minSize: { width: number; height: number };
}

// Centralized widget registry for better maintainability
const WIDGET_REGISTRY: Record<string, Omit<WidgetConfig, 'id'>> = {
  time: {
    title: "Time & Calendar",
    defaultPosition: { x: 20, y: 100 },
    defaultSize: { width: 500, height: 320 },
    minSize: { width: 400, height: 300 },
    component: TimeWidget,
  },
  weather: {
    title: "Weather",
    defaultPosition: { x: 540, y: 100 },
    defaultSize: { width: 380, height: 240 },
    minSize: { width: 300, height: 200 },
    component: WeatherWidget,
  },
  youtube: {
    title: "YouTube",
    defaultPosition: { x: 940, y: 100 },
    defaultSize: { width: 360, height: 360 },
    minSize: { width: 320, height: 300 },
    component: YouTubeWidget,
  },
  todo: {
    title: "To-Do List",
    defaultPosition: { x: 20, y: 440 },
    defaultSize: { width: 380, height: 340 },
    minSize: { width: 300, height: 250 },
    component: TodoWidget,
  },
  projects: {
    title: "Projects",
    defaultPosition: { x: 420, y: 440 },
    defaultSize: { width: 360, height: 340 },
    minSize: { width: 300, height: 300 },
    component: ProjectWidget,
  },
  announcements: {
    title: "Announcements",
    defaultPosition: { x: 800, y: 480 },
    defaultSize: { width: 360, height: 300 },
    minSize: { width: 300, height: 250 },
    component: AnnouncementWidget,
  },
  news: {
    title: "News Ticker",
    defaultPosition: { x: 1180, y: 100 },
    defaultSize: { width: 340, height: 280 },
    minSize: { width: 280, height: 200 },
    component: NewsWidget,
  },
  calllog: {
    title: "Call Log",
    defaultPosition: { x: 1180, y: 400 },
    defaultSize: { width: 340, height: 320 },
    minSize: { width: 320, height: 280 },
    component: CallLogWidget,
  },
  radio: {
    title: "Internet Radio",
    defaultPosition: { x: 20, y: 800 },
    defaultSize: { width: 380, height: 280 },
    minSize: { width: 350, height: 250 },
    component: RadioWidget,
  },
  calculator: {
    title: "Calculator",
    defaultPosition: { x: 420, y: 800 },
    defaultSize: { width: 280, height: 380 },
    minSize: { width: 250, height: 350 },
    component: CalculatorWidget,
  },
};

const defaultWidgets: WidgetState[] = Object.entries(WIDGET_REGISTRY).map(([id, config]) => ({
  id,
  title: config.title,
  position: config.defaultPosition,
  size: config.defaultSize,
  minSize: config.minSize,
}));

function App() {
  const [isClient, setIsClient] = useState(false);
  
  // Use custom hook for persistent dark mode and widget layout
  const [darkMode, setDarkMode] = useLocalStorage<boolean>("darkMode", true);
  const [widgets, setWidgets] = useLocalStorage<WidgetState[]>("widgetLayout", defaultWidgets);
  const [availableWidgetIds, setAvailableWidgetIds] = useLocalStorage<string[]>(
    "availableWidgets",
    Object.keys(WIDGET_REGISTRY)
  );
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);

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
    setWidgets(defaultWidgets);
    setAvailableWidgetIds(Object.keys(WIDGET_REGISTRY));
  }, [setWidgets, setAvailableWidgetIds]);

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

  // Add widget to dashboard
  const handleAddWidget = useCallback((widgetId: string) => {
    const config = WIDGET_REGISTRY[widgetId];
    if (!config || widgets.some(w => w.id === widgetId)) return;
    
    setWidgets((prev) => [
      ...prev,
      {
        id: widgetId,
        title: config.title,
        position: config.defaultPosition,
        size: config.defaultSize,
        minSize: config.minSize,
      },
    ]);
    setAvailableWidgetIds((prev) => prev.filter(id => id !== widgetId));
  }, [widgets, setWidgets, setAvailableWidgetIds]);

  // Remove widget from dashboard
  const handleRemoveWidget = useCallback((widgetId: string) => {
    setWidgets((prev) => prev.filter(w => w.id !== widgetId));
    setAvailableWidgetIds((prev) => [...prev, widgetId].sort());
  }, [setWidgets, setAvailableWidgetIds]);

  // Memoize widget renderer to prevent unnecessary re-renders
  const renderWidget = useCallback((widgetId: string, darkMode: boolean) => {
    const config = WIDGET_REGISTRY[widgetId];
    if (!config) return null;
    const WidgetComponent = config.component;
    return <WidgetComponent darkMode={darkMode} />;
  }, []);

  // Memoize available widgets for picker
  const availableWidgets = useMemo(() => {
    return availableWidgetIds
      .map(id => ({ id, ...WIDGET_REGISTRY[id] }))
      .filter(w => w.title !== undefined);
  }, [availableWidgetIds]);

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
          setDarkMode={setDarkMode} 
          onResetLayout={handleResetLayout}
          onManageWidgets={() => setShowWidgetPicker(true)}
        />

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
              onRemove={() => handleRemoveWidget(widget.id)}
            >
              {renderWidget(widget.id, darkMode)}
            </WidgetContainer>
          ))}
        </main>

        {/* Widget Picker Modal */}
        {showWidgetPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
              className={`w-full max-w-md mx-4 rounded-2xl border p-6 ${
                darkMode
                  ? "bg-slate-900 border-cyan-500/30"
                  : "bg-white border-blue-200"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2
                  className={`text-xl font-bold ${
                    darkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  Manage Widgets
                </h2>
                <button
                  onClick={() => setShowWidgetPicker(false)}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? "hover:bg-slate-800 text-slate-400"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableWidgets.length === 0 ? (
                  <p className={`text-center py-4 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    All widgets are already on the dashboard!
                  </p>
                ) : (
                  availableWidgets.map((widget) => (
                    <div
                      key={widget.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? "bg-slate-800" : "bg-slate-50"
                      }`}
                    >
                      <div>
                        <h3
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-slate-800"
                          }`}
                        >
                          {widget.title}
                        </h3>
                        <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {widget.defaultSize.width} x {widget.defaultSize.height}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddWidget(widget.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          darkMode
                            ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        Add
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => setShowWidgetPicker(false)}
                className={`w-full mt-4 py-3 rounded-lg font-semibold ${
                  darkMode
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;