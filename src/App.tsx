import React, { useState, useEffect } from "react";

const modules = [
  { name: "ETL", hint: "Kafka / NiFi / Link", icon: "🔄" },
  { name: "K8s", hint: "Kubernetes Orchestration", icon: "🐳" },
  { name: "Compute", hint: "Trino / Spark / Impala", icon: "💻" },
  { name: "Lakehouse", hint: "Iceberg / Parquet / MINIO", icon: "🏠" },
  { name: "Security", hint: "Ranger / OpenSearch", icon: "🔐" },
  { name: "Monitor", hint: "Prometheus / Grafana", icon: "📈" },
  { name: "BI", hint: "Superset / Clickhouse", icon: "📊" },
  { name: "Output", hint: "API / Clients", icon: "📦" }
];

const levels = [
  { name: "Level 1: Базовый поток", required: ["ETL", "Compute", "Output"], broken: false },
  { name: "Level 2: С зависимостями", required: ["ETL", "K8s", "Compute", "BI", "Output"], broken: false },
  { name: "Level 3: Полная архитектура ANG", required: ["ETL", "K8s", "Compute", "Lakehouse", "Security", "Monitor", "BI", "Output"], broken: false },
  { name: "Level 4: Почини пайплайн!", required: ["ETL", "K8s", "Compute", "Lakehouse", "Security", "Monitor", "BI", "Output"], broken: true }
];

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}export default function App() {
    const [grid, setGrid] = useState(Array(5).fill(null).map(() => Array(5).fill(null)));
    const [selectedModule, setSelectedModule] = useState(null);
    const [flowing, setFlowing] = useState(false);
    const [highlighted, setHighlighted] = useState([]);
    const [message, setMessage] = useState("");
    const [flowLog, setFlowLog] = useState([]);
    const [progress, setProgress] = useState(0);
    const [levelIndex, setLevelIndex] = useState(0);
    const [showVictory, setShowVictory] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const [errorCell, setErrorCell] = useState(null);
    const [shuffledModules, setShuffledModules] = useState([]);
  
    const currentLevel = levels[levelIndex];
  
    useEffect(() => {
      setShuffledModules(shuffle([...modules]));
      if (currentLevel.broken) {
        const broken = shuffle([...currentLevel.required]);
        const newGrid = Array(5).fill(null).map(() => Array(5).fill(null));
        broken.forEach((mod, i) => {
          const r = Math.floor(i / 5);
          const c = i % 5;
          newGrid[r][c] = mod;
        });
        setGrid(newGrid);
      }
    }, [levelIndex]);
  
    const handlePlaceModule = (rowIdx, colIdx) => {
      if (!selectedModule || flowing) return;
      const newGrid = grid.map((row, rIdx) =>
        row.map((cell, cIdx) => {
          if (rIdx === rowIdx && cIdx === colIdx) return selectedModule.name;
          return cell;
        })
      );
      setGrid(newGrid);
    };  const getFlatGrid = () => {
        const flat = [];
        grid.forEach((row, rIdx) =>
          row.forEach((cell, cIdx) => {
            if (cell) flat.push({ cell: cell.trim(), rIdx, cIdx });
          })
        );
        return flat;
      };
    
      const startFlow = () => {
        setMessage("");
        setFlowLog([]);
        setProgress(0);
        setShowVictory(false);
        setHighlighted([]);
        setCurrentStep(-1);
        setErrorCell(null);
    
        const flat = getFlatGrid();
        const sorted = [];
    
        for (const type of currentLevel.required) {
          const found = flat.find(item => item.cell === type);
          if (found) {
            sorted.push(found);
          } else {
            setMessage("❌ Отсутствует модуль: " + type);
            return;
          }
        }
    
        const namesInGrid = flat.map(f => f.cell).filter(cell => currentLevel.required.includes(cell));
        if (namesInGrid.join() !== currentLevel.required.join()) {
          setMessage("❌ Поток нарушен: неправильный порядок модулей.");
          const wrongIndex = namesInGrid.findIndex((cell, i) => cell !== currentLevel.required[i]);
          const wrongCell = flat.find(f => f.cell === namesInGrid[wrongIndex]);
          if (wrongCell) setErrorCell(wrongCell);
          return;
        }
    
        setFlowing(true);
        let i = 0;
        const interval = setInterval(() => {
          if (i >= sorted.length) {
            clearInterval(interval);
            setFlowing(false);
            setMessage("🎉 ANG поток завершён!");
            setShowVictory(true);
            if (levelIndex < levels.length - 1) {
              setTimeout(() => setLevelIndex(levelIndex + 1), 2500);
            }
            return;
          }
          const current = sorted[i];
          setCurrentStep(i);
          setHighlighted(prev => [...prev, current]);
          setFlowLog(prev => [...prev, current.cell + ` [${current.rIdx},${current.cIdx}]`]);
          setProgress(Math.round(((i + 1) / sorted.length) * 100));
          i++;
        }, 600);
      };
    
      const isHighlighted = (rIdx, cIdx) =>
        highlighted.some(pos => pos.rIdx === rIdx && pos.cIdx === cIdx);
    
      const isCurrent = (rIdx, cIdx) =>
        highlighted[currentStep] &&
        highlighted[currentStep].rIdx === rIdx &&
        highlighted[currentStep].cIdx === cIdx;
    
      const getHint = (name) => {
        const mod = modules.find(m => m.name === name);
        return mod ? mod.hint : "";
      };
    
      const getIcon = (name) => {
        const mod = modules.find(m => m.name === name);
        return mod ? mod.icon : "";
      };  return (
        <div className="p-4 flex flex-col gap-4 relative bg-[#121212] text-white min-h-screen">
          <img src="/ang-logo.png" alt="ANG Logo" className="absolute top-2 right-4 h-10" />
          <h1 className="text-3xl font-bold text-center text-blue-400">ANG Platform: Architect Edition</h1>
          <h2 className="text-lg font-semibold text-blue-300 text-center">{currentLevel.name}</h2>
    
          <div className="flex gap-4">
            <div className="w-52 border border-gray-700 p-2 rounded bg-[#1e1e1e]">
              <h2 className="font-semibold mb-2 text-blue-300">🧰 Модули ANG</h2>
              {shuffledModules.map((mod) => (
                <button
                  key={mod.name}
                  onClick={() => setSelectedModule(mod)}
                  className={
                    "w-full mb-1 px-2 py-1 border rounded text-sm flex items-center gap-2 " +
                    (selectedModule?.name === mod.name
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-white border-gray-600")
                  }
                  title={mod.hint}
                >
                  <span>{mod.icon}</span> {mod.name}
                </button>
              ))}
            </div>
    
            <div className="grid grid-cols-5 gap-1">
              {grid.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isNow = isCurrent(rIdx, cIdx);
                  const isGlow = isHighlighted(rIdx, cIdx);
                  const isError = errorCell && errorCell.rIdx === rIdx && errorCell.cIdx === cIdx;
    
                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handlePlaceModule(rIdx, cIdx)}
                      title={getHint(cell)}
                      className={
                        "w-20 h-20 border rounded flex flex-col items-center justify-center text-xs text-center transition-all " +
                        (isError
                          ? "bg-red-600 text-white animate-ping"
                          : isNow
                          ? "bg-green-400 text-black animate-pulse"
                          : isGlow
                          ? "bg-green-200 text-black"
                          : "bg-gray-900 hover:bg-gray-800 cursor-pointer text-white border-gray-600")
                      }
                    >
                      <div className="text-lg">{getIcon(cell)}</div>
                      {cell || ""}
                    </div>
                  );
                })
              )}
            </div>
          </div>
    
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setGrid(Array(5).fill(null).map(() => Array(5).fill(null)));
                setHighlighted([]);
                setMessage("");
                setFlowLog([]);
                setProgress(0);
                setShowVictory(false);
                setCurrentStep(-1);
                setErrorCell(null);
                setSelectedModule(null);
                setShuffledModules(shuffle([...modules]));
              }}
              className="px-4 py-2 border rounded bg-gray-700 hover:bg-gray-600 text-white"
            >
              🔄 Сброс
            </button>
            <button
              onClick={startFlow}
              disabled={flowing}
              className="px-4 py-2 border rounded bg-blue-500 text-white hover:bg-blue-600"
            >
              ▶️ Запустить поток
            </button>
          </div>
    
          {message && <div className="mt-4 text-green-400 text-lg text-center">{message}</div>}
    
          {flowLog.length > 0 && !currentLevel.broken && (
            <div className="mt-4 p-3 bg-gray-50 bg-opacity-10 border rounded text-sm">
              <div className="font-semibold mb-1 text-blue-300">🧪 Debug: Последовательность потока</div>
              <ul className="list-disc pl-5">
                {flowLog.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
              <div className="mt-2">
                <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: progress + "%" }}></div>
                </div>
                <div className="text-right text-xs mt-1">{progress}% пройдено</div>
              </div>
            </div>
          )}
    
          {showVictory && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 p-6 rounded-lg border border-green-400 shadow-xl animate-pulse z-50">
              <h2 className="text-2xl font-bold text-green-400 text-center">🎉 Победа!</h2>
              <p className="text-center mt-2">ANG поток завершён!</p>
            </div>
          )}
        </div>
      );
    }

