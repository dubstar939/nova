import { motion, AnimatePresence } from "framer-motion";
import { X, GripVertical, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useCallback } from "react";

export interface WidgetDefinition {
  id: string;
  title: string;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
}

export const ALL_WIDGETS: WidgetDefinition[] = [
  {
    id: "time",
    title: "Time & Calendar",
    defaultPosition: { x: 50, y: 50 },
    defaultSize: { width: 350, height: 400 },
    minSize: { width: 300, height: 300 },
  },
  {
    id: "weather",
    title: "Weather",
    defaultPosition: { x: 420, y: 50 },
    defaultSize: { width: 350, height: 400 },
    minSize: { width: 300, height: 300 },
  },
  {
    id: "youtube",
    title: "YouTube",
    defaultPosition: { x: 790, y: 50 },
    defaultSize: { width: 400, height: 350 },
    minSize: { width: 300, height: 250 },
  },
  {
    id: "todo",
    title: "To-Do List",
    defaultPosition: { x: 50, y: 470 },
    defaultSize: { width: 350, height: 350 },
    minSize: { width: 300, height: 250 },
  },
  {
    id: "projects",
    title: "Projects",
    defaultPosition: { x: 420, y: 470 },
    defaultSize: { width: 400, height: 350 },
    minSize: { width: 300, height: 250 },
  },
  {
    id: "announcements",
    title: "Announcements",
    defaultPosition: { x: 840, y: 470 },
    defaultSize: { width: 350, height: 350 },
    minSize: { width: 300, height: 250 },
  },
  {
    id: "news",
    title: "News",
    defaultPosition: { x: 50, y: 840 },
    defaultSize: { width: 350, height: 300 },
    minSize: { width: 300, height: 200 },
  },
  {
    id: "calllog",
    title: "Call Log",
    defaultPosition: { x: 420, y: 840 },
    defaultSize: { width: 350, height: 300 },
    minSize: { width: 300, height: 200 },
  },
  {
    id: "radio",
    title: "Radio",
    defaultPosition: { x: 790, y: 840 },
    defaultSize: { width: 350, height: 300 },
    minSize: { width: 300, height: 200 },
  },
  {
    id: "calculator",
    title: "Calculator",
    defaultPosition: { x: 50, y: 1160 },
    defaultSize: { width: 300, height: 400 },
    minSize: { width: 280, height: 350 },
  },
];

interface AppLockerProps {
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  availableWidgets: WidgetDefinition[];
  activeWidgetIds: string[];
  onWidgetsChange: (newWidgetIds: string[]) => void;
}

export default function AppLocker({
  darkMode,
  isOpen,
  onClose,
  availableWidgets,
  activeWidgetIds,
  onWidgetsChange,
}: AppLockerProps) {
  const handleToggleWidget = useCallback(
    (widgetId: string) => {
      if (activeWidgetIds.includes(widgetId)) {
        // Don't allow removing the last widget
        if (activeWidgetIds.length > 1) {
          onWidgetsChange(activeWidgetIds.filter((id) => id !== widgetId));
        }
      } else {
        onWidgetsChange([...activeWidgetIds, widgetId]);
      }
    },
    [activeWidgetIds, onWidgetsChange]
  );

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, widgetId: string) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      target.setAttribute("data-dragging-id", widgetId);
    },
    []
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="applocker-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl ${
              darkMode
                ? "bg-slate-900 border border-cyan-500/30"
                : "bg-white border border-blue-200"
            } shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                darkMode
                  ? "bg-slate-800/50 border-cyan-500/20"
                  : "bg-slate-50/50 border-blue-100"
              }`}
            >
              <h2
                id="applocker-title"
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-slate-800"
                }`}
              >
                Manage Dashboard Widgets
              </h2>
              <Button
                onClick={onClose}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "hover:bg-slate-700 text-slate-400"
                    : "hover:bg-slate-200 text-slate-600"
                }`}
                aria-label="Close widget manager"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableWidgets.map((widget) => {
                  const isActive = activeWidgetIds.includes(widget.id);
                  return (
                    <motion.div
                      key={widget.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isActive
                          ? darkMode
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-blue-500 bg-blue-50"
                          : darkMode
                          ? "border-slate-700 bg-slate-800 hover:border-slate-600"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                      onClick={() => handleToggleWidget(widget.id)}
                      onMouseDown={(e) => handleDragStart(e, widget.id)}
                      onTouchStart={(e) => handleDragStart(e, widget.id)}
                      role="checkbox"
                      aria-checked={isActive}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleToggleWidget(widget.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center mt-0.5 ${
                            isActive
                              ? darkMode
                                ? "bg-cyan-500"
                                : "bg-blue-500"
                              : darkMode
                              ? "bg-slate-700"
                              : "bg-slate-300"
                          }`}
                        >
                          {isActive && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-slate-800"
                            }`}
                          >
                            {widget.title}
                          </h3>
                          <p
                            className={`text-xs mt-1 ${
                              darkMode ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {widget.defaultSize.width} ×{" "}
                            {widget.defaultSize.height}px
                          </p>
                        </div>
                        <GripVertical
                          className={`w-4 h-4 ${
                            darkMode ? "text-slate-600" : "text-slate-400"
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Info */}
              <div
                className={`mt-6 p-4 rounded-lg ${
                  darkMode ? "bg-slate-800" : "bg-slate-100"
                }`}
              >
                <p
                  className={`text-sm ${
                    darkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  <strong>Tip:</strong> Click on a widget to toggle its visibility
                  on the dashboard. Drag widgets to rearrange them once they're
                  added.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`flex justify-end px-6 py-4 border-t ${
                darkMode
                  ? "bg-slate-800/50 border-cyan-500/20"
                  : "bg-slate-50/50 border-blue-100"
              }`}
            >
              <Button
                onClick={onClose}
                className={`px-6 py-2 rounded-lg font-medium ${
                  darkMode
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Done
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
