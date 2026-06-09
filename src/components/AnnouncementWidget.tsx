import { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Megaphone } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AnnouncementWidgetProps {
  darkMode: boolean;
}

interface Announcement {
  id: number;
  message: string;
  author: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
}

export default function AnnouncementWidget({ darkMode }: AnnouncementWidgetProps) {
  const [announcements, setAnnouncements] = useLocalStorage<Announcement[]>("announcements", []);
  const [newMessage, setNewMessage] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [isAdding, setIsAdding] = useState(false);

  const addAnnouncement = () => {
    if (!newMessage.trim()) return;
    setAnnouncements([
      {
        id: Date.now(),
        message: newMessage,
        author: newAuthor || "Anonymous",
        timestamp: "Just now",
        priority: newPriority,
      },
      ...announcements,
    ]);
    setNewMessage("");
    setNewAuthor("");
    setNewPriority("medium");
    setIsAdding(false);
  };

  const deleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return darkMode ? "bg-red-500" : "bg-red-400";
      case "medium":
        return darkMode ? "bg-amber-500" : "bg-amber-400";
      case "low":
        return darkMode ? "bg-green-500" : "bg-green-400";
      default:
        return darkMode ? "bg-slate-500" : "bg-slate-400";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Megaphone className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-blue-500"}`} />
          <h3 className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
            Announcements
          </h3>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-3 py-1 rounded-lg text-sm ${
            darkMode
              ? "bg-cyan-500 hover:bg-cyan-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {isAdding ? "Cancel" : "New"}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Announcement message..."
              className={`${
                darkMode
                  ? "bg-slate-800 border-cyan-500/30 text-white"
                  : "bg-slate-50 border-blue-200 text-slate-800"
              }`}
            />
            <div className="flex gap-2">
              <Input
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                placeholder="Author"
                className={`flex-1 ${
                  darkMode
                    ? "bg-slate-800 border-cyan-500/30 text-white"
                    : "bg-slate-50 border-blue-200 text-slate-800"
                }`}
              />
              <select
                value={newPriority}
                onChange={(e) =>
                  setNewPriority(e.target.value as "low" | "medium" | "high")
                }
                className={`px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-slate-800 border-cyan-500/30 text-white"
                    : "bg-slate-50 border-blue-200 text-slate-800"
                }`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <Button
                onClick={addAnnouncement}
                className={`${
                  darkMode
                    ? "bg-cyan-500 hover:bg-cyan-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                Post
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 space-y-2 overflow-y-auto">
        <AnimatePresence>
          {announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`relative p-3 rounded-lg ${
                darkMode ? "bg-slate-800" : "bg-slate-50"
              }`}
            >
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${getPriorityColor(
                  announcement.priority
                )}`}
              />
              <div className="pl-2">
                <p
                  className={`text-sm ${
                    darkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  {announcement.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-xs ${
                      darkMode ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {announcement.author} • {announcement.timestamp}
                  </span>
                  <Button
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className={`p-1 rounded ${
                      darkMode
                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                        : "bg-red-50 hover:bg-red-100 text-red-500"
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}