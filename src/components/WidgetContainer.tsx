import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { GripVertical, X } from "lucide-react";

// Constants for widget configuration
const WIDGET_CONFIG = {
  DEFAULT_CONTAINER_HEIGHT: 1200,
  MIN_WIDGET_WIDTH: 300,
  MIN_WIDGET_HEIGHT: 200,
  KEYBOARD_STEP: 10,
};

// Check for reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined' 
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
  : false;

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
  onRemove?: (id: string) => void;
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
  minSize = { width: WIDGET_CONFIG.MIN_WIDGET_WIDTH, height: WIDGET_CONFIG.MIN_WIDGET_HEIGHT },
  id,
  onPositionChange,
  onSizeChange,
  onRemove,
}: WidgetContainerProps) {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [size, setSize] = useState<Size>(
    initialSize || { width: minSize.width, height: minSize.height }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Use refs to track if we should sync from parent (to avoid loops)
  const syncedPositionRef = useRef(initialPosition);
  const syncedSizeRef = useRef(initialSize);
  
  // Memoize container bounds to prevent recalculation on every render
  const containerBounds = useMemo(() => ({
    maxX: typeof window !== 'undefined' ? window.innerWidth - minSize.width : 1000,
    maxY: WIDGET_CONFIG.DEFAULT_CONTAINER_HEIGHT - minSize.height,
  }), [minSize.width, minSize.height]);

  // Sync with parent state changes - only update if values actually differ significantly
  useEffect(() => {
    const posDiff = Math.abs(initialPosition.x - syncedPositionRef.current.x) + 
                    Math.abs(initialPosition.y - syncedPositionRef.current.y);
    if (posDiff > 0.1) {
      syncedPositionRef.current = initialPosition;
      setPosition(initialPosition);
    }
  }, [initialPosition.x, initialPosition.y]);

  useEffect(() => {
    if (!initialSize) return;
    
    const sizeDiff = (
      Math.abs(initialSize.width - (syncedSizeRef.current?.width || 0)) + 
      Math.abs(initialSize.height - (syncedSizeRef.current?.height || 0))
    );
    if (sizeDiff > 0.1) {
      syncedSizeRef.current = initialSize;
      setSize(initialSize);
    }
  }, [initialSize?.width, initialSize?.height]);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX ?? 0;
    const clientY = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY ?? 0;
    
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
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging) {
        const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX ?? 0;
        const clientY = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY ?? 0;
        
        const newPosition = {
          x: Math.max(0, Math.min(clientX - dragOffset.x, containerBounds.maxX)),
          y: Math.max(0, Math.min(clientY - dragOffset.y, containerBounds.maxY)),
        };
        setPosition(newPosition);
        onPositionChange?.(id, newPosition);
      }

      if (isResizing && containerRef.current) {
        const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX ?? 0;
        const clientY = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY ?? 0;
        
        const rect = containerRef.current.getBoundingClientRect();
        const newWidth = Math.max(minSize.width, clientX - rect.left);
        const newHeight = Math.max(minSize.height, clientY - rect.top);
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
      document.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseup", handleMouseUp, { passive: true });
      // Add touch event listeners for mobile support with passive:false for preventDefault
      document.addEventListener("touchmove", handleMouseMove, { passive: false });
      document.addEventListener("touchend", handleMouseUp, { passive: true });
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      // Clean up touch event listeners
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, minSize, id, onPositionChange, onSizeChange, containerBounds]);

  // Keyboard navigation for widgets
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused) return;
      
      let newX = position.x;
      let newY = position.y;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newY = Math.max(0, position.y - WIDGET_CONFIG.KEYBOARD_STEP);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newY = Math.min(position.y + WIDGET_CONFIG.KEYBOARD_STEP, containerBounds.maxY);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newX = Math.max(0, position.x - WIDGET_CONFIG.KEYBOARD_STEP);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newX = Math.min(position.x + WIDGET_CONFIG.KEYBOARD_STEP, containerBounds.maxX);
          break;
        default:
          return;
      }
      
      setPosition({ x: newX, y: newY });
      onPositionChange?.(id, { x: newX, y: newY });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, position, id, onPositionChange, containerBounds]);

  return (
    <motion.div
      ref={containerRef}
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : undefined}
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: isDragging || isResizing ? 50 : 10,
        touchAction: isDragging || isResizing ? 'none' : 'auto',
      }}
      className={`${isDragging ? "cursor-grabbing" : ""} ${isFocused ? "ring-2 ring-cyan-400" : ""}`}
      role="region"
      aria-label={`${title} widget`}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
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
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              className={`p-1 rounded-lg transition-colors ${
                darkMode
                  ? "hover:bg-red-900/50 text-slate-400 hover:text-red-400"
                  : "hover:bg-red-100 text-slate-500 hover:text-red-600"
              }`}
              aria-label={`Remove ${title} widget`}
              title="Remove widget"
            >
              <X className="w-4 h-4" />
            </button>
          )}
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