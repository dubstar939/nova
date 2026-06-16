import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, GripVertical } from "lucide-react";
import { Button } from "./ui/button";

interface WidgetDefinition {
  id: string;
  title: string;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
}

interface AppLockerProps {
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  availableWidgets: WidgetDefinition[];
  activeWidgetIds: string[];
  onWidgetsChange: (widgetIds: string[]) => void;
}

export const ALL_WIDGETS: WidgetDefinition[] = [
  {
    id: "time",
    title: "Time",
    defaultPosition: { x: 50, y: 50 },
    defaultSize: { width: 350, height: 250 },
    minSize: { width: 300, height: 200 },
  },
  {
    id: "weather",
    title: "Weather",
    defaultPosition: { x: 450, y: 50 },
    defaultSize: { width: 350, height: 250 },
    minSize: { width: 300, height: 200 },
  },
  {
    id: "youtube",
    title: "YouTube",
    defaultPosition: { x: 850, y: 50 },
    defaultSize: { width: 400, height: 300 },
    minSize: { width: 350, height: 250 },
  },
  {
    id: "todo",
    title: "Todo List",
    defaultPosition: { x: 50, y: 350 },
    defaultSize: { width: 350, height: 350 },
    minSize: { width: 300, height: 250 },
  },
  {
    id: "projects",
    title: "Projects",
    defaultPosition: { x: 450, y: 350 },
    defaultSize: { width: 400, height: 350 },
    minSize: { width: 350, height: 250 },
  },
  {
    id: "announcements",
    title: "Announcements",
    defaultPosition: { x: 900, y: 350 },
    defaultSize: { width: 350, height: 300 },
    minSize: { width: 300, height: 200 },
  },
  {
    id: "news",
    title: "News",
    defaultPosition: { x: 50, y: 750 },
    defaultSize: { width: 400, height: 350 },
    minSize: { width: 350, height: 250 },
  },
  {
    id: "calllog",
    title: "Call Log",
    defaultPosition: { x: 500, y: 750 },
    defaultSize: { width: 350, height: 300 },
    minSize: { width: 300, height: 200 },
  },
  {
    id: "radio",
    title: "Radio",
    defaultPosition: { x: 900, y: 700 },
    defaultSize: { width: 350, height: 300 },
    minSize: { width: 300, height: 200 },
  },
  {
    id: "calculator",
    title: "Calculator",
    defaultPosition: { x: 1300, y: 50 },
    defaultSize: { width: 300, height: 400 },
    minSize: { width: 250, height: 350 },
  },
];

export default function AppLocker({
  darkMode,
  isOpen,
  onClose,
  availableWidgets,
  activeWidgetIds,
  onWidgetsChange,
}: AppLockerProps) {
  const [localActiveIds, setLocalActiveIds] = useState<string[]>(activeWidgetIds);

  const handleToggleWidget = (widgetId: string) => {
    setLocalActiveIds((prev) => {
      if (prev.includes(widgetId)) {
        return prev.filter((id) => id !== widgetId);
      } else {
        return [...prev, widgetId];
      }
    });
  };

  const handleSave = () => {
    onWidgetsChange(localActiveIds);
    onClose();
  };

  const handleCancel = () => {
    setLocalActiveIds(activeWidgetIds);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[80vh] overflow-auto rounded-2xl shadow-2xl z-50 ${
              darkMode
                ? "bg-slate-900 border border-cyan-500/30"
                : "bg-white border border-blue-200"
            }`}
          >
            {/* Header */}
            <div
              className={`sticky top-0 flex items-center justify-between px-6 py-4 border-b ${
                darkMode
                  ? "bg-slate-900/95 border-cyan-500/20"
                  : "bg-white/95 border-blue-100"
              }`}
            >
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-slate-800"
                }`}
              >
                Manage Dashboard Widgets
              </h2>
              <button
                onClick={handleCancel}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-slate-800 text-slate-400"
                    : "hover:bg-slate-100 text-slate-500"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p
                className={`mb-4 text-sm ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Toggle widgets to show or hide them on your dashboard.
              </p>

              <div className="space-y-2">
                {availableWidgets.map((widget) => {
                  const isActive = localActiveIds.includes(widget.id);
                  return (
                    <motion.div
                      key={widget.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? darkMode
                            ? "bg-cyan-500/10 border-cyan-500/50"
                            : "bg-blue-50 border-blue-300"
                          : darkMode
                          ? "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                          : "bg-slate-50 border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => handleToggleWidget(widget.id)}
                    >
                      <div className="flex items-center gap-3">
                        <GripVertical
                          className={`w-4 h-4 ${
                            darkMode ? "text-cyan-400" : "text-blue-500"
                          }`}
                        />
                        <span
                          className={`font-medium ${
                            darkMode ? "text-white" : "text-slate-800"
                          }`}
                        >
                          {widget.title}
                        </span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
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
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div
              className={`sticky bottom-0 flex items-center justify-end gap-3 px-6 py-4 border-t ${
                darkMode
                  ? "bg-slate-900/95 border-cyan-500/20"
                  : "bg-white/95 border-blue-100"
              }`}
            >
              <Button
                onClick={handleCancel}
                className={`px-6 ${
                  darkMode
                    ? "bg-slate-800 hover:bg-slate-700 text-white"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                }`}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className={`px-6 ${
                  darkMode
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Save Changes
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
