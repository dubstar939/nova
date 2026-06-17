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
import AppLocker, { ALL_WIDGETS } from "./components/AppLocker";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { useLocalStorage } from "./hooks/useLocalStorage";

// Constants for widget layout configuration
const WIDGET_LAYOUT = {
  CONTAINER_HEIGHT: 1200,
  CONTAINER_WIDTH: typeof window !== 'undefined' ? window.innerWidth : 1200,
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
  GRID_COLUMNS: 3,
  GRID_GAP: 20,
  HEADER_OFFSET: 80,
};

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
      position: { ...widgetDef.defaultPosition },
      size: { ...widgetDef.defaultSize },
      minSize: { ...widgetDef.minSize },
    };
  });
};

// Calculate auto-arranged positions for widgets
const calculateAutoArrange = (widgets: WidgetState[], containerWidth: number): WidgetState[] => {
  const columns = WIDGET_LAYOUT.GRID_COLUMNS;
  const gap = WIDGET_LAYOUT.GRID_GAP;
  const headerOffset = WIDGET_LAYOUT.HEADER_OFFSET;
  
  // Calculate column width based on available space
  const availableWidth = containerWidth - (gap * (columns + 1));
  const columnWidth = availableWidth / columns;
  
  return widgets.map((widget, index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    
    // Use widget's current size or default to standard dimensions
    const width = Math.min(widget.size.width || 350, columnWidth - gap);
    const height = widget.size.height || 350;
    
    return {
      ...widget,
      position: {
        x: gap + col * (columnWidth),
        y: headerOffset + gap + row * (height + gap),
      },
      size: { width, height },
    };
  });
};

// Main app content component that uses theme context
function AppContent() {
  const [isClient, setIsClient] = useState(false);
  
  // Use custom hook for persistent widget layout (theme is handled by context)
  const [activeWidgetIds, setActiveWidgetIds] = useLocalStorage<string[]>("activeWidgetIds", WIDGET_LAYOUT.DEFAULT_WIDGET_IDS);
  const [widgets, setWidgets] = useLocalStorage<WidgetState[]>("widgetLayout", createDefaultWidgets(WIDGET_LAYOUT.DEFAULT_WIDGET_IDS));
  const [isAppLockerOpen, setIsAppLockerOpen] = useState(false);
  const { darkMode } = useTheme();

  // Initialize client-side only features
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync widgets when active widget IDs change - preserve existing positions/sizes when possible
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
          position: { ...widgetDef.defaultPosition },
          size: { ...widgetDef.defaultSize },
          minSize: { ...widgetDef.minSize },
        };
      });
      return newWidgets;
    });
  }, [activeWidgetIds, setWidgets]);

  // Auto-arrange widgets in a grid layout
  const handleSnapBack = useCallback(() => {
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    setWidgets((prevWidgets) => {
      const arrangedWidgets = calculateAutoArrange(prevWidgets, containerWidth);
      // Update positions for all widgets
      return arrangedWidgets;
    });
  }, [setWidgets]);

  const handleResetLayout = useCallback(() => {
    setActiveWidgetIds([...WIDGET_LAYOUT.DEFAULT_WIDGET_IDS]);
    const defaultWidgets = createDefaultWidgets([...WIDGET_LAYOUT.DEFAULT_WIDGET_IDS]);
    // Auto-arrange after resetting
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    setWidgets(calculateAutoArrange(defaultWidgets, containerWidth));
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

  // Memoize available widgets for picker - ensure no duplicates
  const availableWidgets = useMemo(() => {
    // Filter out any IDs that don't exist in registry and remove duplicates
    const uniqueIds = [...new Set(availableWidgetIds.filter(id => WIDGET_REGISTRY[id]))];
    return uniqueIds
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
          onResetLayout={handleResetLayout}
          onOpenAppLocker={handleToggleAppLocker}
          onSnapBack={handleSnapBack}
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
              onRemove={() => handleRemoveWidget(widget.id)}
            >
              {renderWidget(widget.id)}
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