import { motion } from "framer-motion";
import { Sun, Moon, Search, Plus, X, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  onResetLayout?: () => void;
}

interface QuickLink {
  id: number;
  name: string;
  url: string;
}

export default function Header({ darkMode, setDarkMode, onResetLayout }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchEngine, setSearchEngine] = useState<"google" | "duckduckgo" | "bing">("google");
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const urls = {
      google: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`,
      bing: `https://www.bing.com/search?q=${encodeURIComponent(searchQuery)}`,
    };

    window.open(urls[searchEngine], "_blank");
    setSearchQuery("");
  };

  const addQuickLink = () => {
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;
    setQuickLinks([...quickLinks, { id: Date.now(), name: newLinkName, url: newLinkUrl }]);
    setNewLinkName("");
    setNewLinkUrl("");
    setIsAddingLink(false);
  };

  const removeQuickLink = (id: number) => {
    setQuickLinks(quickLinks.filter(link => link.id !== id));
  };

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl border-b ${
        darkMode
          ? "bg-slate-950/80 border-cyan-500/20"
          : "bg-white/80 border-blue-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div
                className={`w-10 h-10 ${
                  darkMode ? "bg-cyan-500" : "bg-blue-500"
                } rotate-45`}
              />
              <div
                className={`absolute inset-0 w-10 h-10 ${
                  darkMode ? "bg-cyan-400" : "bg-blue-400"
                } rotate-45 scale-75`}
              />
            </div>
            <h1
              className={`text-2xl font-bold tracking-wider ${
                darkMode
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
                  : "text-blue-600"
              }`}
            >
              939PRO STUDIOS
            </h1>

            <div className="flex items-center gap-2 ml-4">
              {quickLinks.map((link) => (
                <motion.div
                  key={link.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="group relative"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      darkMode
                        ? "bg-slate-800 text-cyan-400 hover:bg-slate-700"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    {link.name}
                  </a>
                  <button
                    onClick={() => removeQuickLink(link.id)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </motion.div>
              ))}
              
              {isAddingLink ? (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    placeholder="Name"
                    className={`w-24 h-8 text-xs ${
                      darkMode
                        ? "bg-slate-800 border-cyan-500/30 text-white"
                        : "bg-white border-blue-200 text-slate-800"
                    }`}
                  />
                  <Input
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className={`w-32 h-8 text-xs ${
                      darkMode
                        ? "bg-slate-800 border-cyan-500/30 text-white"
                        : "bg-white border-blue-200 text-slate-800"
                    }`}
                  />
                  <Button
                    onClick={addQuickLink}
                    size="sm"
                    className={`h-8 ${darkMode ? "bg-cyan-500" : "bg-blue-500"}`}
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => setIsAddingLink(false)}
                    size="sm"
                    variant="ghost"
                    className="h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ) : (
                <Button
                  onClick={() => setIsAddingLink(true)}
                  className={`p-2 rounded-lg ${
                    darkMode
                      ? "bg-slate-800 hover:bg-slate-700 text-cyan-400"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-500"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>

          <motion.form
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onSubmit={handleSearch}
            className="flex-1 max-w-md"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the web..."
                  className={`w-full px-4 py-2 pl-10 rounded-lg border ${
                    darkMode
                      ? "bg-slate-800 border-cyan-500/30 text-white placeholder-slate-400 focus:border-cyan-400"
                      : "bg-white border-blue-200 text-slate-800 placeholder-slate-400 focus:border-blue-400"
                  } outline-none transition-all`}
                />
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                    darkMode ? "text-cyan-400" : "text-blue-400"
                  }`}
                />
              </div>
              <select
                value={searchEngine}
                onChange={(e) => setSearchEngine(e.target.value as typeof searchEngine)}
                className={`px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-slate-800 border-cyan-500/30 text-white"
                    : "bg-white border-blue-200 text-slate-800"
                } outline-none cursor-pointer`}
              >
                <option value="google">Google</option>
                <option value="duckduckgo">DuckDuckGo</option>
                <option value="bing">Bing</option>
              </select>
            </div>
          </motion.form>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-3"
          >
            {onResetLayout && (
              <Button
                onClick={onResetLayout}
                className={`relative overflow-hidden ${
                  darkMode
                    ? "bg-slate-800 hover:bg-slate-700 border border-cyan-500/30"
                    : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                }`}
                title="Reset widget layout to default"
              >
                <RotateCcw className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-blue-500"}`} />
              </Button>
            )}
            <Button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative overflow-hidden ${
                darkMode
                  ? "bg-slate-800 hover:bg-slate-700 border border-cyan-500/30"
                  : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              <motion.div
                animate={{ rotate: darkMode ? 0 : 180 }}
                transition={{ duration: 0.5 }}
              >
                {darkMode ? (
                  <Moon className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  );
}