import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, CheckCircle, Zap, Hourglass, Coffee, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EnemArea } from "../types";

interface TimerProps {
  onSessionComplete: (area: EnemArea, topic: string) => void;
  dailySessionsCompleted: number;
  setDailySessionsCompleted: React.Dispatch<React.SetStateAction<number>>;
  totalStudyTime: number;
  setTotalStudyTime: React.Dispatch<React.SetStateAction<number>>;
}

export default function Timer({
  onSessionComplete,
  dailySessionsCompleted,
  setDailySessionsCompleted,
  totalStudyTime,
  setTotalStudyTime
}: TimerProps) {
  // Session lengths (in seconds)
  const STUDY_TIME_REAL = 90 * 60; // 5400 seconds
  const BREAK_TIME_REAL = 5 * 60;  // 300 seconds

  const STUDY_TIME_TEST = 10; // 10 seconds for testing
  const BREAK_TIME_TEST = 3;  // 3 seconds for testing

  const [isTestMode, setIsTestMode] = useState(false);
  const [mode, setMode] = useState<"STUDY" | "BREAK">("STUDY");
  const [timeLeft, setTimeLeft] = useState(isTestMode ? STUDY_TIME_TEST : STUDY_TIME_REAL);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedArea, setSelectedArea] = useState<EnemArea>(EnemArea.MATEMATICA);
  const [studyTopic, setStudyTopic] = useState("");
  const [showActivityAlert, setShowActivityAlert] = useState(false);

  // Sound generator using Web Audio API (highly reliable, no external dependencies)
  const playAlertSound = (type: "success" | "info") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === "success") {
        // Double cheery beep
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.type = "sine";
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
          osc2.type = "sine";
          gain2.gain.setValueAtTime(0.1, ctx.currentTime);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.3);
        }, 180);
      } else {
        // Calm break beep
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.type = "triangle";
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("AudioContext not allowed or not supported in this iframe:", e);
    }
  };

  // Keep timeLeft in sync when switching test mode
  useEffect(() => {
    const targetTime = mode === "STUDY" 
      ? (isTestMode ? STUDY_TIME_TEST : STUDY_TIME_REAL) 
      : (isTestMode ? BREAK_TIME_TEST : BREAK_TIME_REAL);
    setTimeLeft(targetTime);
    setIsRunning(false);
  }, [isTestMode, mode]);

  useEffect(() => {
    let timerId: any = null;
    if (isRunning && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === "STUDY") {
          // Increment total study time in minutes
          setTotalStudyTime((prev) => prev + (isTestMode ? 9 : 1) / 60);
        }
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      if (mode === "STUDY") {
        // Study session complete
        playAlertSound("success");
        setDailySessionsCompleted((prev) => Math.min(prev + 1, 5));
        setShowActivityAlert(true);
        // Switch to Break
        setMode("BREAK");
      } else {
        // Break complete
        playAlertSound("info");
        setMode("STUDY");
      }
      setIsRunning(false);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, timeLeft, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    const total = mode === "STUDY"
      ? (isTestMode ? STUDY_TIME_TEST : STUDY_TIME_REAL)
      : (isTestMode ? BREAK_TIME_TEST : BREAK_TIME_REAL);
    return ((total - timeLeft) / total) * 100;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    const targetTime = mode === "STUDY" 
      ? (isTestMode ? STUDY_TIME_TEST : STUDY_TIME_REAL) 
      : (isTestMode ? BREAK_TIME_TEST : BREAK_TIME_REAL);
    setTimeLeft(targetTime);
  };

  const handleTriggerActivity = () => {
    onSessionComplete(selectedArea, studyTopic || "Estudo Geral");
    setShowActivityAlert(false);
    setStudyTopic("");
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center" id="study-timer-container">
      {/* Visual Timer Circle */}
      <div className="relative flex-shrink-0 w-60 h-60 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            className="stroke-slate-100 fill-none"
            strokeWidth="6"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            className={`fill-none ${mode === "STUDY" ? "stroke-sky-500" : "stroke-emerald-500"}`}
            strokeWidth="6"
            strokeDasharray="276.46"
            animate={{ strokeDashoffset: 276.46 - (276.46 * getProgressPercentage()) / 100 }}
            transition={{ duration: 0.3, ease: "linear" }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            {mode === "STUDY" ? "SESSÃO DE FOCO" : "INTERVALO"}
          </span>
          <span className="text-4xl font-extrabold text-slate-800 font-mono my-1 tracking-tight">
            {formatTime(timeLeft)}
          </span>
          <span className="text-xs text-slate-500">
            {mode === "STUDY" ? "90 minutos" : "5 minutos"}
          </span>
        </div>
      </div>

      {/* Timer Controls and Session Info */}
      <div className="flex-grow flex flex-col justify-between w-full">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              {mode === "STUDY" ? (
                <Hourglass className="w-5 h-5 text-sky-500 animate-pulse" />
              ) : (
                <Coffee className="w-5 h-5 text-emerald-500" />
              )}
              Cronômetro de Estudos ENEM
            </h2>
            <div className="flex items-center gap-3">
              {/* Quick Test Mode Switcher */}
              <label className="flex items-center gap-1.5 cursor-pointer text-[10px] bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 select-none">
                <input
                  type="checkbox"
                  className="w-3 h-3 text-sky-600 rounded focus:ring-sky-500 border-slate-300"
                  checked={isTestMode}
                  onChange={(e) => setIsTestMode(e.target.checked)}
                />
                <span className="font-semibold text-slate-600 flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-amber-500 fill-amber-500" /> Teste (10s)
                </span>
              </label>
            </div>
          </div>

          {/* Mode Selector Tabs (Manual Toggle for Study and Break/Descanso) */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4 self-start max-w-xs">
            <button
              onClick={() => {
                if (!isRunning) setMode("STUDY");
              }}
              disabled={isRunning}
              className={`flex-1 text-[11px] font-black px-4 py-2 rounded-lg transition-all ${
                mode === "STUDY"
                  ? "bg-white text-sky-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 disabled:opacity-50"
              }`}
            >
              Foco (90 min)
            </button>
            <button
              onClick={() => {
                if (!isRunning) setMode("BREAK");
              }}
              disabled={isRunning}
              className={`flex-1 text-[11px] font-black px-4 py-2 rounded-lg transition-all ${
                mode === "BREAK"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 disabled:opacity-50"
              }`}
            >
              Descanso (5 min)
            </button>
          </div>

          {mode === "STUDY" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Área de Estudo Atual
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value as EnemArea)}
                  disabled={isRunning}
                >
                  {Object.values(EnemArea).map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Tópico / Conteúdo (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Funções Afins, Modernismo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  value={studyTopic}
                  onChange={(e) => setStudyTopic(e.target.value)}
                  disabled={isRunning}
                />
              </div>
            </div>
          )}

          {mode === "BREAK" && (
            <div className="bg-emerald-50 text-emerald-800 text-xs rounded-xl p-4 mb-5 border border-emerald-100 flex items-start gap-3">
              <Coffee className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Hora do Descanso!</p>
                <p className="text-emerald-700 mt-0.5 leading-relaxed">
                  Aproveite estes 5 minutos para esticar as pernas, beber água e dar uma pausa nos olhos. Descanso também faz parte da aprovação!
                </p>
              </div>
            </div>
          )}

          {/* Daily 5 Sessions Status Tracker */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500">Sessões Diárias Completadas (Meta: 5)</span>
              <span className="text-xs font-extrabold text-sky-600">{dailySessionsCompleted}/5</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((index) => {
                const isCompleted = index <= dailySessionsCompleted;
                const isActive = index === dailySessionsCompleted + 1 && mode === "STUDY" && isRunning;
                return (
                  <div
                    key={index}
                    className="flex-1 relative h-2.5 rounded-full overflow-hidden bg-slate-100 border border-slate-200/50"
                  >
                    <motion.div
                      className={`absolute inset-y-0 left-0 rounded-full ${
                        isCompleted ? "bg-sky-500" : isActive ? "bg-sky-300" : "bg-transparent"
                      }`}
                      initial={{ width: isCompleted ? "100%" : "0%" }}
                      animate={{ width: isCompleted ? "100%" : isActive ? "50%" : "0%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1 px-0.5 text-[10px] text-slate-400 font-mono">
              <span>Sessão 1</span>
              <span>Sessão 2</span>
              <span>Sessão 3</span>
              <span>Sessão 4</span>
              <span>Sessão 5</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={handleStartPause}
            className={`flex-grow flex items-center justify-center gap-2 font-bold text-sm py-2.5 px-4 rounded-xl transition-all shadow-sm ${
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : mode === "STUDY"
                ? "bg-sky-600 hover:bg-sky-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" /> Começar {mode === "STUDY" ? "Foco" : "Descanso"}
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl transition-all border border-slate-200 flex items-center justify-center"
            title="Reiniciar tempo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Activity trigger popup notification */}
      <AnimatePresence>
        {showActivityAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 text-center">
              <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Sessão Completada!</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Parabéns por completar mais 90 minutos de foco estratégico! Para fixar o aprendizado na memória de longo prazo, faça a atividade de revisão ativa.
              </p>
              
              <div className="bg-slate-50 rounded-xl p-3 my-4 border border-slate-150 text-left">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Área Selecionada</span>
                  <span className="text-sky-600">Revisão ENEM</span>
                </div>
                <p className="text-xs font-bold text-slate-700 mt-1">{selectedArea}</p>
                {studyTopic && (
                  <p className="text-xs text-slate-500 mt-0.5">Tópico: {studyTopic}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowActivityAlert(false)}
                  className="flex-1 text-slate-500 hover:bg-slate-100 text-xs font-semibold py-2 px-4 rounded-xl transition-all border border-slate-200"
                >
                  Revisar Mais Tarde
                </button>
                <button
                  onClick={handleTriggerActivity}
                  className="flex-grow bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-4 h-4 fill-white" /> Fazer Atividade Já!
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
