import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneIncoming, PhoneOutgoing, Trash2, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CallLogWidgetProps {
  darkMode: boolean;
}

interface CallLog {
  id: number;
  name: string;
  phone: string;
  type: "incoming" | "outgoing";
  time: string;
  notes: string;
}

export default function CallLogWidget({ darkMode }: CallLogWidgetProps) {
  const [calls, setCalls] = useState<CallLog[]>([
    { id: 1, name: "John Smith", phone: "555-0101", type: "incoming", time: "10:30 AM", notes: "Discuss project timeline" },
    { id: 2, name: "Sarah Johnson", phone: "555-0102", type: "outgoing", time: "11:45 AM", notes: "Follow up on proposal" },
  ]);
  const [newCall, setNewCall] = useState({
    name: "",
    phone: "",
    type: "incoming" as "incoming" | "outgoing",
    notes: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  const addCall = () => {
    if (!newCall.name.trim() || !newCall.phone.trim()) return;
    setCalls([
      ...calls,
      {
        id: Date.now(),
        ...newCall,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setNewCall({ name: "", phone: "", type: "incoming", notes: "" });
    setIsAdding(false);
  };

  const deleteCall = (id: number) => {
    setCalls(calls.filter((call) => call.id !== id));
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
          Call Log
        </h3>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 rounded-lg text-sm ${
            darkMode
              ? "bg-cyan-500 hover:bg-cyan-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {isAdding ? "Cancel" : "Add Call"}
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={newCall.name}
                onChange={(e) => setNewCall({ ...newCall, name: e.target.value })}
                placeholder="Contact Name"
                className={`${
                  darkMode
                    ? "bg-slate-800 border-cyan-500/30 text-white"
                    : "bg-slate-50 border-blue-200 text-slate-800"
                }`}
              />
              <Input
                value={newCall.phone}
                onChange={(e) => setNewCall({ ...newCall, phone: e.target.value })}
                placeholder="Phone Number"
                className={`${
                  darkMode
                    ? "bg-slate-800 border-cyan-500/30 text-white"
                    : "bg-slate-50 border-blue-200 text-slate-800"
                }`}
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={newCall.type}
                onChange={(e) => setNewCall({ ...newCall, type: e.target.value as "incoming" | "outgoing" })}
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  darkMode
                    ? "bg-slate-800 border-cyan-500/30 text-white"
                    : "bg-slate-50 border-blue-200 text-slate-800"
                }`}
              >
                <option value="incoming">Incoming Call</option>
                <option value="outgoing">Outgoing Call</option>
              </select>
              <Button
                onClick={addCall}
                className={`px-6 ${
                  darkMode
                    ? "bg-cyan-500 hover:bg-cyan-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                Save
              </Button>
            </div>
            
            <Input
              value={newCall.notes}
              onChange={(e) => setNewCall({ ...newCall, notes: e.target.value })}
              placeholder="Notes (optional)"
              className={`${
                darkMode
                  ? "bg-slate-800 border-cyan-500/30 text-white"
                  : "bg-slate-50 border-blue-200 text-slate-800"
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {calls.map((call) => (
          <motion.div
            key={call.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              darkMode ? "bg-slate-800" : "bg-slate-50"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                call.type === "incoming"
                  ? darkMode
                    ? "bg-green-500/20"
                    : "bg-green-100"
                  : darkMode
                  ? "bg-blue-500/20"
                  : "bg-blue-100"
              }`}
            >
              {call.type === "incoming" ? (
                <PhoneIncoming
                  className={`w-5 h-5 ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                />
              ) : (
                <PhoneOutgoing
                  className={`w-5 h-5 ${
                    darkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`font-medium truncate ${
                    darkMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  {call.name}
                </span>
                <span
                  className={`text-xs ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {call.phone}
                </span>
              </div>
              {call.notes && (
                <p
                  className={`text-xs truncate ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {call.notes}
                </p>
              )}
            </div>
            <div
              className={`flex items-center gap-1 text-xs ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              <Clock className="w-3 h-3" />
              {call.time}
            </div>
            <Button
              onClick={() => deleteCall(call.id)}
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
      </div>
    </motion.div>
  );
}