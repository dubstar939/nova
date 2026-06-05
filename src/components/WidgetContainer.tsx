import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Move } from "lucide-react";

interface WidgetContainerProps {
  children: React.ReactNode;
  title: string;
  darkMode: boolean;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  id: string;
  onPositionChange?: (id: string, position: { x: number; y: number }) => void;
  onSizeChange?: (id: string, size: { width: number; height: number }) => void;
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

export default function WidgetContainer({
  children,
  title,
  darkMode,
  initialPosition = { x: 0, y: 0 },
  initialSize,
  minSize = { width: 300, height: 200 },
  id,
  onPositionChange,
  onSizeChange,
}: WidgetContainerProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(
    initialSize || { width: minSize.width, height: minSize.height }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".resize-handle")) return;
    
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        };
        setPosition(newPosition);
        onPositionChange?.(id, newPosition);
      }

      if (isResizing && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = Math.max(minSize.width, e.clientX - rect.left);
        const newHeight = Math.max(minSize.height, e.clientY - rect.top);
        const newSize = { width: newWidth, height: newHeight };
        setSize(newSize);
        onSizeChange?.(id, newSize);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, minSize, id, onPositionChange, onSizeChange]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isDragging || isResizing ? 50 : 10,
      }}
      className={`${isDragging ? "cursor-grabbing" : ""}`}
    >
      <div
        className={`w-full h-full rounded-2xl border overflow-hidden flex flex-col ${
          darkMode
            ? "bg-slate-900/95 border-cyan-500/30"
            : "bg-white/95 border-blue-200"
        } backdrop-blur-sm shadow-xl ${
          isDragging || isResizing
            ? "ring-2 ring-cyan-400"
            : ""
        }`}
      >
        <div
          onMouseDown={handleMouseDown}
          className={`flex items-center justify-between px-4 py-3 cursor-grab select-none ${
            darkMode
              ? "bg-slate-800/50 border-b border-cyan-500/20"
              : "bg-slate-50/50 border-b border-blue-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <Move
              className={`w-4 h-4 ${
                darkMode ? "text-cyan-400" : "text-blue-500"
              }`}
            />
            <h3
              className={`font-semibold ${
                darkMode ? "text-white" : "text-slate-800"
              }`}
            >
              {title}
            </h3>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">{children}</div>

        <div
          onMouseDown={handleResizeMouseDown}
          className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
        >
          <svg
            className={`w-6 h-6 ${
              darkMode ? "text-cyan-500/50" : "text-blue-300"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 3h6v6M9 9l12-12M3 21l18-18" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}