import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface QuickLinksWidgetProps {
  darkMode: boolean;
}

interface QuickLink {
  id: number;
  name: string;
  url: string;
}

export default function QuickLinksWidget({ darkMode }: QuickLinksWidgetProps) {
  const [links, setLinks] = useState<QuickLink[]>([
    { id: 1, name: "GitHub", url: "https://github.com" },
    { id: 2, name: "Documentation", url: "https://docs.example.com" },
    { id: 3, name: "Dashboard", url: "https://dashboard.example.com" },
  ]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const addLink = () => {
    if (!newName.trim() || !newUrl.trim()) return;
    setLinks([...links, { id: Date.now(), name: newName, url: newUrl }]);
    setNewName("");
    setNewUrl("");
    setIsAdding(false);
  };

  const removeLink = (id: number) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl border ${
        darkMode
          ? "bg-slate-900/90 border-cyan-500/20"
          : "bg-white/90 border-blue-200"
      } backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
          Quick Links
        </h3>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className={`p-2 rounded-lg ${
            darkMode
              ? "bg-slate-800 hover:bg-slate-700 text-cyan-400"
              : "bg-slate-100 hover:bg-slate-200 text-blue-500"
          }`}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isAdding && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 space-y-2"
        >
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Link name"
            className={`${
              darkMode
                ? "bg-slate-800 border-cyan-500/30 text-white"
                : "bg-slate-50 border-blue-200 text-slate-800"
            }`}
          />
          <div className="flex gap-2">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className={`flex-1 ${
                darkMode
                  ? "bg-slate-800 border-cyan-500/30 text-white"
                  : "bg-slate-50 border-blue-200 text-slate-800"
              }`}
            />
            <Button
              onClick={addLink}
              className={`${
                darkMode
                  ? "bg-cyan-500 hover:bg-cyan-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              Add
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {links.map((link) => (
          <motion.div
            key={link.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-2 p-3 rounded-lg group ${
              darkMode ? "bg-slate-800" : "bg-slate-50"
            }`}
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 flex items-center gap-2 ${
                darkMode ? "text-white hover:text-cyan-400" : "text-slate-800 hover:text-blue-500"
              }`}
            >
              {link.name}
              <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
            <Button
              onClick={() => removeLink(link.id)}
              className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                darkMode
                  ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                  : "bg-red-50 hover:bg-red-100 text-red-500"
              }`}
            >
              <X className="w-3 h-3" />
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}