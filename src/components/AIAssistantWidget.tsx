import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Send, ExternalLink, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface AIAssistantWidgetProps {
  darkMode: boolean;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIAssistantWidget({ darkMode }: AIAssistantWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant. I can help you with weather, time, maps, news, or general questions. Try asking me something!",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Contextual responses based on keywords
    if (lowerMessage.includes("weather")) {
      return "I can't access real-time weather data directly, but you can check the Weather widget on your dashboard or visit weather.com for detailed forecasts.";
    }
    if (lowerMessage.includes("time") || lowerMessage.includes("date")) {
      return `The current time is ${new Date().toLocaleTimeString()}. You can also check the Time & Calendar widget on your dashboard!`;
    }
    if (lowerMessage.includes("map") || lowerMessage.includes("location") || lowerMessage.includes("where")) {
      return "I can help you find locations! Use the Maps widget to search for places, or click 'Open Full Map' to access OpenStreetMap with full search capabilities.";
    }
    if (lowerMessage.includes("news") || lowerMessage.includes("headline")) {
      return "Check out the News widget at the top of your dashboard for the latest headlines. It updates automatically with breaking news from various sources.";
    }
    if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
      return "I'm here to assist you! I can provide quick info about time, suggest where to find weather/maps/news, and answer general questions. For complex tasks, click 'Open AI Agent' to access advanced AI capabilities.";
    }
    if (lowerMessage.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?";
    }
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("hey")) {
      return "Hello! How can I assist you today? Feel free to ask me anything!";
    }
    
    // Default response with suggestion to use full AI agent
    return "That's an interesting question! For more detailed assistance, I recommend clicking 'Open AI Agent' to access HuggingFace Chat with advanced AI capabilities. They can help with coding, analysis, creative writing, and much more!";
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(userMessage.text),
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl border ${
        darkMode
          ? "bg-slate-900/90 border-cyan-500/20"
          : "bg-white/90 border-blue-200"
      } backdrop-blur-sm h-full flex flex-col`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`text-sm font-semibold flex items-center gap-2 ${
            darkMode ? "text-white" : "text-slate-800"
          }`}
        >
          <Bot className="w-4 h-4" />
          AI Assistant
        </h3>
        <a
          href="https://huggingface.co/chat/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
            darkMode
              ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
              : "bg-blue-500/20 text-blue-600 hover:bg-blue-500/30"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          Open AI Agent
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto mb-3 space-y-2 min-h-[150px] ${
        darkMode ? "bg-slate-800/50" : "bg-slate-50"
      } rounded-lg p-3`}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  message.isUser
                    ? darkMode
                      ? "bg-cyan-500 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                    ? "bg-slate-700 text-slate-100"
                    : "bg-white text-slate-800 border border-slate-200"
                }`}
              >
                <p className="text-xs leading-relaxed">{message.text}</p>
                <p
                  className={`text-[9px] mt-1 ${
                    message.isUser
                      ? "text-cyan-100"
                      : darkMode
                      ? "text-slate-400"
                      : "text-slate-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div
              className={`rounded-lg px-3 py-2 ${
                darkMode ? "bg-slate-700" : "bg-white border border-slate-200"
              }`}
            >
              <div className="flex gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    darkMode ? "bg-cyan-400" : "bg-blue-400"
                  } animate-bounce`}
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    darkMode ? "bg-cyan-400" : "bg-blue-400"
                  } animate-bounce`}
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    darkMode ? "bg-cyan-400" : "bg-blue-400"
                  } animate-bounce`}
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything..."
          className={`flex-1 h-8 text-xs rounded-lg border ${
            darkMode
              ? "bg-slate-800 border-cyan-500/30 text-white placeholder-slate-400 focus:border-cyan-400"
              : "bg-white border-blue-200 text-slate-800 placeholder-slate-400 focus:border-blue-400"
          } outline-none`}
        />
        <Button
          type="submit"
          className={`h-8 px-3 rounded-lg ${
            darkMode
              ? "bg-cyan-500 hover:bg-cyan-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={!inputValue.trim() || isTyping}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>

      {/* Quick Suggestions */}
      <div className="mt-2 flex flex-wrap gap-1">
        {["Weather?", "Time?", "Maps?", "Help"].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setInputValue(suggestion)}
            className={`px-2 py-0.5 text-[9px] rounded-md transition-colors ${
              darkMode
                ? "bg-slate-800 text-slate-400 hover:text-cyan-400"
                : "bg-slate-100 text-slate-600 hover:text-blue-600"
            }`}
          >
            <MessageSquare className="w-2 h-2 inline mr-0.5" />
            {suggestion}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
