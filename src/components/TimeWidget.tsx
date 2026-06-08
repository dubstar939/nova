import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimeWidgetProps {
  darkMode: boolean;
}

const timezones = [
  { name: "Eastern", offset: -5, abbr: "ET" },
  { name: "Central", offset: -6, abbr: "CT" },
  { name: "Mountain", offset: -7, abbr: "MT" },
  { name: "Pacific", offset: -8, abbr: "PT" },
  { name: "Alaska", offset: -9, abbr: "AKT" },
];

export default function TimeWidget({ darkMode }: TimeWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getTimeInTimezone = (offset: number) => {
    const utc = currentTime.getTime() + currentTime.getTimezoneOffset() * 60000;
    return new Date(utc + offset * 3600000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentMonth);
  const days = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <div className="text-center mb-4">
          <div
            className={`text-4xl font-mono font-bold ${
              darkMode ? "text-white" : "text-slate-800"
            }`}
          >
            {formatTime(getTimeInTimezone(timezones[selectedTimezone].offset))}
          </div>
          <div
            className={`text-sm mt-1 ${
              darkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {formatDate(currentTime)}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {timezones.map((tz, index) => (
            <button
              key={tz.name}
              onClick={() => setSelectedTimezone(index)}
              className={`px-3 py-1 rounded-full text-xs transition-all ${
                selectedTimezone === index
                  ? darkMode
                    ? "bg-cyan-500 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tz.abbr}
            </button>
          ))}
        </div>

        <div className="text-center">
          <div className={`text-lg font-semibold ${darkMode ? "text-cyan-400" : "text-blue-500"}`}>
            {timezones[selectedTimezone].name} Time
          </div>
        </div>
      </div>

      <div className={`mt-4 p-3 rounded-lg ${darkMode ? "bg-slate-800" : "bg-slate-100"}`}>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={prevMonth}
            className={`p-1 rounded ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"}`}
          >
            <ChevronLeft className={`w-4 h-4 ${darkMode ? "text-white" : "text-slate-800"}`} />
          </button>
          <span className={`font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={nextMonth}
            className={`p-1 rounded ${darkMode ? "hover:bg-slate-700" : "hover:bg-slate-200"}`}
          >
            <ChevronRight className={`w-4 h-4 ${darkMode ? "text-white" : "text-slate-800"}`} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={i}
              className={`p-1 ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              {day}
            </div>
          ))}
          {days.map((day, i) => (
            <div
              key={i}
              className={`p-1 rounded ${
                isToday(day)
                  ? darkMode
                    ? "bg-cyan-500 text-white"
                    : "bg-blue-500 text-white"
                  : darkMode
                  ? "text-slate-300"
                  : "text-slate-700"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}