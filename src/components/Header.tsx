import { motion } from "framer-motion";
import { Sun, Moon, Search, Plus, X, RotateCcw, LayoutGrid, Grid3X3 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useTheme } from "../contexts/ThemeContext";

interface HeaderProps {
  darkMode: boolean;
  onResetLayout?: () => void;
  onOpenAppLocker?: () => void;
  onSnapBack?: () => void;
}

interface QuickLink {
  id: number;
  name: string;
  url: string;
  isFavorite?: boolean;
}

export default function Header({ darkMode, onResetLayout, onOpenAppLocker, onSnapBack }: HeaderProps) {
  const { toggleDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchEngine, setSearchEngine] = useState<"google" | "duckduckgo" | "bing">("google");
  const [quickLinks, setQuickLinks] = useLocalStorage<QuickLink[]>("quickLinks", []);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkName, setNewLinkName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setQuickLinks((prev) => [...prev, { id: Date.now(), name: newLinkName, url: newLinkUrl }]);
    setNewLinkName("");
    setNewLinkUrl("");
    setIsAddingLink(false);
  };

  const removeQuickLink = (id: number) => {
    setQuickLinks((prev) => prev.filter(link => link.id !== id));
  };

  const toggleFavorite = (id: number) => {
    setQuickLinks(quickLinks.map(link => {
      if (link.id === id) {
        const favoritesCount = quickLinks.filter(l => l.isFavorite).length;
        if (!link.isFavorite && favoritesCount >= MAX_FAVORITES) {
          return link; // Can't add more favorites
        }
        return { ...link, isFavorite: !link.isFavorite };
      }
      return link;
    }));
  };

  const favoriteLinks = quickLinks.filter(link => link.isFavorite);
  const otherLinks = quickLinks.filter(link => !link.isFavorite);

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
              {/* Favorite Links as Buttons */}
              {favoriteLinks.map((link) => (
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      darkMode
                        ? "bg-slate-800 text-cyan-400 hover:bg-slate-700"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    {link.name}
                  </a>
                  <button
                    onClick={() => toggleFavorite(link.id)}
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
                      darkMode ? "bg-amber-500" : "bg-amber-400"
                    }`}
                    title="Remove from favorites"
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                </motion.div>
              ))}
              
              {/* Dropdown for Additional Links */}
              {otherLinks.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      darkMode
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    More Links
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border overflow-hidden z-50 ${
                          darkMode
                            ? "bg-slate-800 border-cyan-500/30"
                            : "bg-white border-blue-200"
                        }`}
                      >
                        <div className="py-2">
                          {otherLinks.map((link) => (
                            <div
                              key={link.id}
                              className={`flex items-center justify-between px-4 py-2 ${
                                darkMode ? "hover:bg-slate-700" : "hover:bg-slate-50"
                              }`}
                            >
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 text-sm ${
                                  darkMode ? "text-slate-300" : "text-slate-600"
                                }`}
                              >
                                <ExternalLink className="w-3 h-3" />
                                {link.name}
                              </a>
                              <button
                                onClick={() => toggleFavorite(link.id)}
                                className={`p-1 rounded ${
                                  darkMode ? "hover:bg-slate-600" : "hover:bg-slate-200"
                                }`}
                                title="Add to favorites"
                              >
                                <svg className={`w-3 h-3 ${darkMode ? "text-slate-400" : "text-slate-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              {/* Add New Link Button */}
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
            {onSnapBack && (
              <Button
                onClick={onSnapBack}
                className={`relative overflow-hidden ${
                  darkMode
                    ? "bg-slate-800 hover:bg-slate-700 border border-cyan-500/30"
                    : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                }`}
                title="Auto-arrange widgets in a grid"
              >
                <Grid3X3 className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-blue-500"}`} />
              </Button>
            )}
            {onOpenAppLocker && (
              <Button
                onClick={onOpenAppLocker}
                className={`relative overflow-hidden ${
                  darkMode
                    ? "bg-slate-800 hover:bg-slate-700 border border-cyan-500/30"
                    : "bg-blue-50 hover:bg-blue-100 border border-blue-200"
                }`}
                title="Manage apps on dashboard"
              >
                <LayoutGrid className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-blue-500"}`} />
              </Button>
            )}
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
              onClick={toggleDarkMode}
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