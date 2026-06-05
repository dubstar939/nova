import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";

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
  const containerBounds = { maxX: typeof window !== 'undefined' ? window.innerWidth - minSize.width : 1000, maxY: 1200 - minSize.height };

  // Sync with parent state changes
  useEffect(() => {
    if (initialPosition.x !== position.x || initialPosition.y !== position.y) {
      setPosition(initialPosition);
    }
  }, [initialPosition.x, initialPosition.y]);

  useEffect(() => {
    if (initialSize?.width !== size.width || initialSize?.height !== size.height) {
      setSize(initialSize || { width: minSize.width, height: minSize.height });
    }
  }, [initialSize?.width, initialSize?.height]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;
    
    if (target.closest(".resize-handle")) return;
    
    setIsDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }
  }, []);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ('stopPropagation' in e) {
      e.stopPropagation();
    }
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newPosition = {
          x: Math.max(0, Math.min(e.clientX - dragOffset.x, containerBounds.maxX)),
          y: Math.max(0, Math.min(e.clientY - dragOffset.y, containerBounds.maxY)),
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
  }, [isDragging, isResizing, dragOffset, minSize, id, onPositionChange, onSizeChange, containerBounds]);

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
        touchAction: isDragging || isResizing ? 'none' : 'auto',
      }}
      className={`${isDragging ? "cursor-grabbing" : ""}`}
      role="region"
      aria-label={`${title} widget`}
    >
      <div
        className={`w-full h-full rounded-2xl border overflow-hidden flex flex-col ${
          darkMode
            ? "bg-slate-900/95 border-cyan-500/30"
            : "bg-white/95 border-blue-200"
        } backdrop-blur-sm shadow-xl ${
          isDragging || isResizing
            ? "ring-2 ring-cyan-400 shadow-2xl"
            : ""
        }`}
      >
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className={`flex items-center justify-between px-4 py-3 cursor-grab select-none ${
            darkMode
              ? "bg-slate-800/50 border-b border-cyan-500/20"
              : "bg-slate-50/50 border-b border-blue-100"
          }`}
          role="toolbar"
          aria-label={`Drag ${title} widget`}
        >
          <div className="flex items-center gap-2">
            <GripVertical
              className={`w-4 h-4 ${
                darkMode ? "text-cyan-400" : "text-blue-500"
              }`}
              aria-hidden="true"
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
          onTouchStart={handleResizeMouseDown}
          className="resize-handle absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-end justify-end p-1"
          role="slider"
          aria-label={`Resize ${title} widget`}
          aria-valuenow={size.width}
          aria-valuemin={minSize.width}
        >
          <svg
            className={`w-5 h-5 ${
              darkMode ? "text-cyan-500/50" : "text-blue-300"
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M15 3h6v6M9 9l12-12M3 21l18-18" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}