import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Send, Sparkles } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface AIAssistantWidgetProps {
  darkMode: boolean;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIAssistantWidget({ darkMode }: AIAssistantWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response (in production, this would call an actual AI API)
    setTimeout(() => {
      const responses = [
        "That's an interesting question! Let me think about that...",
        "I'd be happy to help you with that task.",
        "Great idea! Here's what I suggest...",
        "Based on my analysis, I recommend the following approach...",
        "Thanks for sharing that! Here are my thoughts...",
      ];
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const openAIAgent = () => {
    // Open a popular open-source AI assistant
    window.open("https://chat.openai.com", "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border h-full flex flex-col ${
        darkMode
          ? "bg-slate-900/90 border-cyan-500/20"
          : "bg-white/90 border-blue-200"
      } backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className={`w-5 h-5 ${darkMode ? "text-cyan-400" : "text-blue-500"}`} />
          <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
            AI Assistant
          </h3>
        </div>
        <Button
          onClick={openAIAgent}
          size="sm"
          className={`text-xs ${
            darkMode
              ? "bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30"
              : "bg-slate-100 hover:bg-slate-200 text-blue-600 border border-blue-200"
          }`}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          Full Agent
        </Button>
      </div>

      <div
        className={`flex-1 overflow-y-auto mb-4 space-y-3 p-3 rounded-lg ${
          darkMode ? "bg-slate-800/50" : "bg-slate-50"
        }`}
        style={{ minHeight: "200px" }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg text-sm ${
                message.role === "user"
                  ? darkMode
                    ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                    : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                  : darkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-white text-slate-700 shadow-sm"
              }`}
            >
              <p>{message.content}</p>
              <span className={`text-xs mt-1 block ${
                darkMode ? "text-slate-500" : "text-slate-400"
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-lg ${
              darkMode ? "bg-slate-700" : "bg-white shadow-sm"
            }`}>
              <div className="flex gap-1">
                <span className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? "bg-cyan-400" : "bg-blue-500"
                }`} style={{ animationDelay: "0ms" }} />
                <span className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? "bg-cyan-400" : "bg-blue-500"
                }`} style={{ animationDelay: "150ms" }} />
                <span className={`w-2 h-2 rounded-full animate-bounce ${
                  darkMode ? "bg-cyan-400" : "bg-blue-500"
                }`} style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything..."
          className={`flex-1 ${
            darkMode
              ? "bg-slate-800 border-cyan-500/30 text-white placeholder-slate-400"
              : "bg-white border-blue-200 text-slate-800 placeholder-slate-400"
          }`}
        />
        <Button
          type="submit"
          disabled={isTyping || !inputValue.trim()}
          className={`${
            darkMode
              ? "bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700"
              : "bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300"
          }`}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>

      <p className={`text-xs mt-2 text-center ${
        darkMode ? "text-slate-500" : "text-slate-400"
      }`}>
        Click "Full Agent" for advanced AI features
      </p>
    </motion.div>
  );
}
