import { useState } from "react";
import { motion } from "framer-motion";

interface CalculatorWidgetProps {
  darkMode: boolean;
}

export default function CalculatorWidget({ darkMode }: CalculatorWidgetProps) {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");

  const handleNumber = (num: string) => {
    setDisplay((prev) => (prev === "0" ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setEquation(display + " " + op + " ");
    setDisplay("0");
  };

  const handleEquals = () => {
    try {
      const fullEquation = equation + display;
      const sanitized = fullEquation
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-");
      
      // Validate expression contains only safe characters (strict whitelist)
      if (!/^[\d+\-*/().\s]+$/.test(sanitized)) {
        setDisplay("Error");
        setEquation("");
        return;
      }
      
      // Additional safety: limit expression length to prevent complex attacks
      if (sanitized.length > 100) {
        setDisplay("Error");
        setEquation("");
        return;
      }
      
      // Safe evaluation using Function constructor with strict validation
      // The regex above ensures only mathematical operators and numbers are allowed
      const safeEval = new Function('return (' + sanitized + ')');
      const result = safeEval();
      
      // Validate result is a finite number
      if (!isFinite(result) || isNaN(result)) {
        setDisplay("Error");
      } else {
        setDisplay(String(parseFloat(result.toFixed(10))));
      }
      setEquation("");
    } catch {
      setDisplay("Error");
      setEquation("");
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
  };

  const handlePercent = () => {
    setDisplay((prev) => String(parseFloat(prev) / 100));
  };

  const handleToggleSign = () => {
    setDisplay((prev) => String(parseFloat(prev) * -1));
  };

  const handleDecimal = () => {
    if (!display.includes(".")) {
      setDisplay((prev) => prev + ".");
    }
  };

  const buttons = [
    [
      { label: "C", action: handleClear, type: "func" },
      { label: "±", action: handleToggleSign, type: "func" },
      { label: "%", action: handlePercent, type: "func" },
      { label: "÷", action: () => handleOperator("÷"), type: "op" },
    ],
    [
      { label: "7", action: () => handleNumber("7"), type: "num" },
      { label: "8", action: () => handleNumber("8"), type: "num" },
      { label: "9", action: () => handleNumber("9"), type: "num" },
      { label: "×", action: () => handleOperator("×"), type: "op" },
    ],
    [
      { label: "4", action: () => handleNumber("4"), type: "num" },
      { label: "5", action: () => handleNumber("5"), type: "num" },
      { label: "6", action: () => handleNumber("6"), type: "num" },
      { label: "−", action: () => handleOperator("−"), type: "op" },
    ],
    [
      { label: "1", action: () => handleNumber("1"), type: "num" },
      { label: "2", action: () => handleNumber("2"), type: "num" },
      { label: "3", action: () => handleNumber("3"), type: "num" },
      { label: "+", action: () => handleOperator("+"), type: "op" },
    ],
    [
      { label: "0", action: () => handleNumber("0"), type: "num", span: true },
      { label: ".", action: handleDecimal, type: "num" },
      { label: "=", action: handleEquals, type: "eq" },
    ],
  ];

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
      <h3
        className={`text-lg font-semibold mb-4 ${
          darkMode ? "text-white" : "text-slate-800"
        }`}
      >
        Calculator
      </h3>

      <div
        className={`p-4 rounded-lg mb-4 ${
          darkMode ? "bg-slate-800" : "bg-slate-100"
        }`}
      >
        <div
          className={`text-right text-sm h-6 ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {equation}
        </div>
        <div
          className={`text-right text-3xl font-mono font-bold ${
            darkMode ? "text-white" : "text-slate-800"
          }`}
        >
          {display}
        </div>
      </div>

      <div className="grid gap-2">
        {buttons.map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-2">
            {row.map((btn) => (
              <motion.button
                key={btn.label}
                whileTap={{ scale: 0.95 }}
                onClick={btn.action}
                className={`py-3 rounded-lg font-semibold text-lg transition-all ${
                  btn.span ? "col-span-2" : ""
                } ${
                  btn.type === "op"
                    ? darkMode
                      ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                      : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                    : btn.type === "func"
                    ? darkMode
                      ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    : btn.type === "eq"
                    ? darkMode
                      ? "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                      : "bg-purple-100 text-purple-600 hover:bg-purple-200"
                    : darkMode
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-white text-slate-800 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {btn.label}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}