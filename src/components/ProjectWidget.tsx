import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, FileText, Image, File, Check, MessageSquare, Link as LinkIcon, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface ProjectWidgetProps {
  darkMode: boolean;
}

interface FileAttachment {
  id: string;
  name: string;
  type: "document" | "image" | "other";
  url?: string;
  linked?: boolean;
}

interface TimelineNote {
  id: string;
  content: string;
  timestamp: number;
}

interface Project {
  id: number;
  name: string;
  color: string;
  progress: number;
  files: FileAttachment[];
  timeline: TimelineNote[];
}

export default function ProjectWidget({ darkMode }: ProjectWidgetProps) {
  const defaultProjects: Project[] = [
    { id: 1, name: "Website Redesign", color: "#06b6d4", progress: 75, files: [
      { id: "1", name: "requirements.pdf", type: "document" },
      { id: "2", name: "mockups.png", type: "image" },
    ], timeline: [] },
    { id: 2, name: "Mobile App", color: "#8b5cf6", progress: 45, files: [], timeline: [] },
    { id: 3, name: "API Integration", color: "#f59e0b", progress: 90, files: [
      { id: "3", name: "api-docs.md", type: "document" },
    ], timeline: [] },
  ];
  
  const [projects, setProjects] = useLocalStorage<Project[]>("projects", defaultProjects);
  const [newProject, setNewProject] = useState({ name: "", color: "#06b6d4" });
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "files">("timeline");
  const [noteInput, setNoteInput] = useState("");
  const [fileUrlInput, setFileUrlInput] = useState("");
  const [showLinkModal, setShowLinkModal] = useState(false);

  const addProject = () => {
    if (!newProject.name.trim()) return;
    setProjects([
      ...projects,
      {
        id: Date.now(),
        name: newProject.name,
        color: newProject.color,
        progress: 0,
        files: [],
        timeline: [],
      },
    ]);
    setNewProject({ name: "", color: "#06b6d4" });
    setIsAdding(false);
  };

  const deleteProject = (id: number) => {
    setProjects(projects.filter((p) => p.id !== id));
    if (selectedProject?.id === id) setSelectedProject(null);
  };

  const addNoteToTimeline = (projectId: number) => {
    if (!noteInput.trim()) return;
    
    const newNote: TimelineNote = {
      id: Date.now().toString(),
      content: noteInput,
      timestamp: Date.now(),
    };

    setProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, timeline: [...p.timeline, newNote] }
        : p
    ));
    
    if (selectedProject?.id === projectId) {
      setSelectedProject({
        ...selectedProject,
        timeline: [...selectedProject.timeline, newNote]
      });
    }
    
    setNoteInput("");
  };

  const addFileToProject = (projectId: number, fileName: string, fileUrl?: string, isLinked?: boolean) => {
    if (!fileName) return;
    
    const extension = fileName.split(".").pop()?.toLowerCase();
    let fileType: "document" | "image" | "other" = "other";
    if (["pdf", "doc", "docx", "txt", "md"].includes(extension || "")) fileType = "document";
    if (["png", "jpg", "jpeg", "gif", "svg"].includes(extension || "")) fileType = "image";

    const newFile: FileAttachment = {
      id: Date.now().toString(),
      name: fileName,
      type: fileType,
      url: fileUrl,
      linked: isLinked,
    };

    setProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, files: [...p.files, newFile] }
        : p
    ));
    
    if (selectedProject?.id === projectId) {
      setSelectedProject({
        ...selectedProject,
        files: [...selectedProject.files, newFile]
      });
    }
  };

  const handleAddFileClick = () => {
    setShowLinkModal(true);
  };

  const handleManualFileSubmit = () => {
    if (!selectedProject) return;
    const fileName = prompt("Enter file name:");
    if (!fileName) return;
    addFileToProject(selectedProject.id, fileName);
    setShowLinkModal(false);
  };

  const handleLinkFileSubmit = () => {
    if (!selectedProject || !fileUrlInput.trim()) return;
    
    const urlFileName = fileUrlInput.split("/").pop() || "linked-file";
    addFileToProject(selectedProject.id, urlFileName, fileUrlInput, true);
    setFileUrlInput("");
    setShowLinkModal(false);
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedProject || !e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    addFileToProject(selectedProject.id, file.name);
    setShowLinkModal(false);
  };

  const removeFileFromProject = (projectId: number, fileId: string) => {
    setProjects(projects.map(p =>
      p.id === projectId
        ? { ...p, files: p.files.filter(f => f.id !== fileId) }
        : p
    ));
    
    if (selectedProject?.id === projectId) {
      setSelectedProject({
        ...selectedProject,
        files: selectedProject.files.filter(f => f.id !== fileId)
      });
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="w-4 h-4" />;
      case "image":
        return <Image className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
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
        <h3
          className={`text-lg font-semibold ${
            darkMode ? "text-white" : "text-slate-800"
          }`}
        >
          Projects
        </h3>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded-lg text-sm ${
            darkMode
              ? "bg-cyan-500 hover:bg-cyan-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {isAdding ? "Cancel" : "New Project"}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 flex gap-2"
          >
            <Input
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="Project name"
              className={`flex-1 ${
                darkMode
                  ? "bg-slate-800 border-cyan-500/30 text-white"
                  : "bg-slate-50 border-blue-200 text-slate-800"
              }`}
            />
            <input
              type="color"
              value={newProject.color}
              onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Button
              onClick={addProject}
              className={`${
                darkMode
                  ? "bg-cyan-500 hover:bg-cyan-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              <Check className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mb-4 p-4 rounded-lg ${
            darkMode ? "bg-slate-800" : "bg-slate-100"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4
              className={`font-semibold ${
                darkMode ? "text-white" : "text-slate-800"
              }`}
            >
              {selectedProject.name}
            </h4>
            <Button
              onClick={() => setSelectedProject(null)}
              className={`p-1 rounded ${
                darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-200 hover:bg-slate-300"
              }`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex gap-2 mb-3">
            <Button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === "timeline"
                  ? darkMode
                    ? "bg-cyan-500 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              Timeline
            </Button>
            <Button
              onClick={() => setActiveTab("files")}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === "files"
                  ? darkMode
                    ? "bg-cyan-500 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              Files
            </Button>
          </div>

          {activeTab === "timeline" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: darkMode ? "#334155" : "#e2e8f0" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${selectedProject.progress}%`,
                      backgroundColor: selectedProject.color,
                    }}
                  />
                </div>
                <span
                  className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  {selectedProject.progress}%
                </span>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex gap-2">
                  <Input
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="Add a note to the timeline..."
                    className={`flex-1 ${
                      darkMode
                        ? "bg-slate-700 border-cyan-500/30 text-white"
                        : "bg-slate-50 border-blue-200 text-slate-800"
                    }`}
                    onKeyDown={(e) => e.key === "Enter" && addNoteToTimeline(selectedProject.id)}
                  />
                  <Button
                    onClick={() => addNoteToTimeline(selectedProject.id)}
                    className={`${
                      darkMode
                        ? "bg-cyan-500 hover:bg-cyan-600"
                        : "bg-blue-500 hover:bg-blue-600"
                    } text-white`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </div>
                
                {selectedProject.timeline.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                    {selectedProject.timeline.map((note) => (
                      <div
                        key={note.id}
                        className={`p-3 rounded-lg ${
                          darkMode ? "bg-slate-700" : "bg-slate-200"
                        }`}
                      >
                        <p className={`text-sm ${darkMode ? "text-white" : "text-slate-800"}`}>
                          {note.content}
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                          {new Date(note.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-2">
              {selectedProject.files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-2 p-2 rounded ${
                    darkMode ? "bg-slate-700" : "bg-slate-200"
                  }`}
                >
                  <span className={darkMode ? "text-cyan-400" : "text-blue-500"}>
                    {getFileIcon(file.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm block truncate ${
                        darkMode ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {file.name}
                    </span>
                    {file.linked && file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs ${darkMode ? "text-cyan-400" : "text-blue-500"} hover:underline`}
                      >
                        <LinkIcon className="w-3 h-3 inline mr-1" />
                        Open Link
                      </a>
                    )}
                  </div>
                  <Button
                    onClick={() => removeFileFromProject(selectedProject.id, file.id)}
                    className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              <Button
                onClick={() => handleAddFileClick()}
                className={`w-full py-2 rounded text-sm ${
                  darkMode
                    ? "bg-slate-700 hover:bg-slate-600 text-cyan-400"
                    : "bg-slate-200 hover:bg-slate-300 text-blue-500"
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add File
              </Button>
            </div>
          )}
          
          {showLinkModal && selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowLinkModal(false)}
            >
              <div
                className={`p-6 rounded-lg w-full max-w-md ${
                  darkMode ? "bg-slate-800" : "bg-white"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <h4 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-slate-800"}`}>
                  Add File to {selectedProject.name}
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <button
                      onClick={handleManualFileSubmit}
                      className={`w-full p-3 rounded-lg flex items-center gap-3 ${
                        darkMode
                          ? "bg-slate-700 hover:bg-slate-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Enter file name manually</span>
                    </button>
                  </div>
                  
                  <div>
                    <label className={`block text-sm mb-2 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      Or upload a file
                    </label>
                    <label
                      className={`w-full p-3 rounded-lg flex items-center gap-3 cursor-pointer ${
                        darkMode
                          ? "bg-slate-700 hover:bg-slate-600 text-white"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                      }`}
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload from computer</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleUploadFile}
                      />
                    </label>
                  </div>
                  
                  <div>
                    <label className={`block text-sm mb-2 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                      Or link to a URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={fileUrlInput}
                        onChange={(e) => setFileUrlInput(e.target.value)}
                        placeholder="https://example.com/file.pdf"
                        className={`flex-1 ${
                          darkMode
                            ? "bg-slate-700 border-cyan-500/30 text-white"
                            : "bg-slate-50 border-blue-200 text-slate-800"
                        }`}
                      />
                      <Button
                        onClick={handleLinkFileSubmit}
                        disabled={!fileUrlInput.trim()}
                        className={`${
                          darkMode
                            ? "bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600"
                            : "bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300"
                        } text-white`}
                      >
                        <LinkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => setShowLinkModal(false)}
                  className={`mt-4 w-full ${
                    darkMode
                      ? "bg-slate-700 hover:bg-slate-600 text-white"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                  }`}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
              darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-50 hover:bg-slate-100"
            }`}
            onClick={() => setSelectedProject(project)}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <span
              className={`flex-1 ${darkMode ? "text-white" : "text-slate-800"}`}
            >
              {project.name}
            </span>
            <div className="flex items-center gap-2">
              <div
                className="w-16 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: darkMode ? "#334155" : "#e2e8f0" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                />
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(project.id);
                }}
                className={`p-1 rounded ${
                  darkMode
                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    : "bg-red-50 hover:bg-red-100 text-red-500"
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}