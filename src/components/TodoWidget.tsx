import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Check, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface TodoWidgetProps {
  darkMode: boolean;
}

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  reminder?: string;
}

export default function TodoWidget({ darkMode }: TodoWidgetProps) {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Review project proposal", completed: false, priority: "high", reminder: "10:00 AM" },
    { id: 2, text: "Team standup meeting", completed: true, priority: "medium" },
    { id: 3, text: "Update documentation", completed: false, priority: "low" },
  ]);
  const [newTodo, setNewTodo] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");
  const [newReminder, setNewReminder] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: newTodo,
        completed: false,
        priority: newPriority,
        reminder: newReminder || undefined,
      },
    ]);
    setNewTodo("");
    setNewPriority("medium");
    setNewReminder("");
    setIsAdding(false);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return darkMode ? "border-red-500" : "border-red-400";
      case "medium":
        return darkMode ? "border-amber-500" : "border-amber-400";
      case "low":
        return darkMode ? "border-green-500" : "border-green-400";
      default:
        return darkMode ? "border-slate-500" : "border-slate-400";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
          To-Do List
        </h3>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded-lg text-sm ${
            darkMode
              ? "bg-cyan-500 hover:bg-cyan-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {isAdding ? "Cancel" : "Add Task"}
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
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Task description"
              className={`${
                darkMode
                  ? "bg-slate-800 border-cyan-500/30 text-white"
                  : "bg-slate-50 border-blue-200 text-slate-800"
              }`}
            />
            <div className="flex gap-2">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-slate-800 border-cyan-500/30 text-white"
                    : "bg-slate-50 border-blue-200 text-slate-800"
                }`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <Input
                value={newReminder}
                onChange={(e) => setNewReminder(e.target.value)}
                placeholder="Reminder (optional)"
                className={`flex-1 ${
                  darkMode
                    ? "bg-slate-800 border-cyan-500/30 text-white"
                    : "bg-slate-50 border-blue-200 text-slate-800"
                }`}
              />
              <Button
                onClick={addTodo}
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
      </AnimatePresence>

      <div className="flex-1 space-y-2 overflow-y-auto">
        <AnimatePresence>
          {(todos || []).map((todo) => (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${getPriorityColor(
                todo.priority
              )} ${darkMode ? "bg-slate-800" : "bg-slate-50"} ${
                todo.completed ? "opacity-50" : ""
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  todo.completed
                    ? darkMode
                      ? "bg-cyan-500 border-cyan-500"
                      : "bg-blue-500 border-blue-500"
                    : darkMode
                    ? "border-slate-600"
                    : "border-slate-300"
                }`}
              >
                {todo.completed && <Check className="w-4 h-4 text-white" />}
              </button>
              <div className="flex-1">
                <span
                  className={`${
                    todo.completed ? "line-through" : ""
                  } ${darkMode ? "text-white" : "text-slate-800"}`}
                >
                  {todo.text}
                </span>
                {todo.reminder && (
                  <div className={`flex items-center gap-1 text-xs mt-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
                    <Clock className="w-3 h-3" />
                    {todo.reminder}
                  </div>
                )}
              </div>
              <Button
                onClick={() => deleteTodo(todo.id)}
                className={`p-1 rounded ${
                  darkMode
                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400"
                    : "bg-red-50 hover:bg-red-100 text-red-500"
                }`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}