import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Award,
  PenTool,
  Clock,
  Sparkles,
  Zap,
  CheckCircle,
  HelpCircle,
  X,
  Send,
  BrainCircuit,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  BookMarked,
  Sliders,
  Check,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Timer from "./components/Timer";
import { EnemArea, StudyNote, Question, SimuladoState, EssayCorrection, StudySessionLog, Badge, MentorFeedback, UserProgress } from "./types";
import { DEFAULT_QUESTIONS, ESSAY_THEMES } from "./data/defaultQuestions";

export default function App() {
  // --- Persistent States (with LocalStorage) ---
  const [notes, setNotes] = useState<StudyNote[]>(() => {
    const saved = localStorage.getItem("enem_study_notes");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { area: EnemArea.LINGUAGENS, content: "", updatedAt: new Date().toISOString() },
      { area: EnemArea.HUMANAS, content: "", updatedAt: new Date().toISOString() },
      { area: EnemArea.NATUREZA, content: "", updatedAt: new Date().toISOString() },
      { area: EnemArea.MATEMATICA, content: "", updatedAt: new Date().toISOString() },
      { area: EnemArea.REDACAO, content: "", updatedAt: new Date().toISOString() },
    ];
  });

  const [activeTab, setActiveTab] = useState<"foco" | "simulados" | "anotacoes" | "redacao" | "progresso">("foco");
  const [selectedAreaForNotes, setSelectedAreaForNotes] = useState<EnemArea>(EnemArea.LINGUAGENS);
  const [noteInput, setNoteInput] = useState("");

  // --- Daily Timer & Session Tracker States ---
  const [dailySessionsCompleted, setDailySessionsCompleted] = useState<number>(() => {
    const saved = localStorage.getItem("enem_daily_sessions");
    return saved ? Math.min(Number(saved), 5) : 0;
  });
  const [totalStudyTime, setTotalStudyTime] = useState<number>(() => {
    const saved = localStorage.getItem("enem_total_study_time");
    return saved ? Number(saved) : 0;
  });

  // --- Active Post-Session Revision Quiz State ---
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<Question[] | null>(null);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [showQuizExplanation, setShowQuizExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizArea, setQuizArea] = useState<EnemArea>(EnemArea.LINGUAGENS);
  const [quizTopic, setQuizTopic] = useState("");

  // --- Saturday Mock Exam (Simulado) State ---
  const [simuladoState, setSimuladoState] = useState<SimuladoState | null>(null);
  const [isGeneratingSimulado, setIsGeneratingSimulado] = useState(false);
  const [simuladoAnswers, setSimuladoAnswers] = useState<Record<number, number>>({});
  const [simuladoArea, setSimuladoArea] = useState<EnemArea>(EnemArea.MATEMATICA);
  const [simuladoHistory, setSimuladoHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("enem_simulado_history");
    return saved ? JSON.parse(saved) : [
      { area: EnemArea.NATUREZA, score: 780, date: "Sábado Passado", totalCorrect: 4 },
      { area: EnemArea.HUMANAS, score: 810, date: "Sábado Retrasado", totalCorrect: 5 }
    ];
  });

  // --- Essay/Redação States ---
  const [selectedTheme, setSelectedTheme] = useState(ESSAY_THEMES[0]);
  const [essayText, setEssayText] = useState("");
  const [isGradingEssay, setIsGradingEssay] = useState(false);
  const [essayCorrection, setEssayCorrection] = useState<EssayCorrection | null>(null);
  const [essayHistory, setEssayHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem("enem_essay_history");
    return saved ? JSON.parse(saved) : [];
  });

  // --- AI Mentor States ---
  const [mentorFeedbacks, setMentorFeedbacks] = useState<Record<string, MentorFeedback>>({});
  const [isLoadingMentor, setIsLoadingMentor] = useState(false);

  // --- Badges & Achievements (Gamification) ---
  const [badges, setBadges] = useState<Badge[]>([
    { id: "first_session", title: "Foco Inicial", description: "Completou a primeira sessão de 90 minutos.", icon: "⏱️", isUnlocked: false },
    { id: "five_sessions", title: "Guerreiro do ENEM", description: "Fechou a meta diária de 5 sessões (450 min).", icon: "🔥", isUnlocked: false },
    { id: "first_notes", title: "Mente Organizada", description: "Adicionou anotações em todas as 5 áreas de estudo.", icon: "📚", isUnlocked: true }, // unlocked as default notes exist
    { id: "first_simulado", title: "Estrategista de Sábado", description: "Finalizou o primeiro Simulado completo.", icon: "📝", isUnlocked: false },
    { id: "perfect_score", title: "Rumo ao 1000", description: "Acertou todas as questões em um simulado ou atividade.", icon: "🎯", isUnlocked: false },
    { id: "iron_essay", title: "Redator de Ferro", description: "Enviou uma redação para correção do corretor inteligente.", icon: "✍️", isUnlocked: false },
  ]);

  // --- Toast/Notification State ---
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  // --- Synchronizers to LocalStorage & Auto Badge Checkers ---
  useEffect(() => {
    localStorage.setItem("enem_study_notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("enem_daily_sessions", dailySessionsCompleted.toString());
    if (dailySessionsCompleted >= 1) {
      unlockBadge("first_session");
    }
    if (dailySessionsCompleted >= 5) {
      unlockBadge("five_sessions");
    }
  }, [dailySessionsCompleted]);

  useEffect(() => {
    localStorage.setItem("enem_total_study_time", totalStudyTime.toString());
  }, [totalStudyTime]);

  useEffect(() => {
    localStorage.setItem("enem_simulado_history", JSON.stringify(simuladoHistory));
  }, [simuladoHistory]);

  useEffect(() => {
    localStorage.setItem("enem_essay_history", JSON.stringify(essayHistory));
  }, [essayHistory]);

  const showToast = (text: string, type: "success" | "info" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const unlockBadge = (id: string) => {
    setBadges((prev) =>
      prev.map((b) => {
        if (b.id === id && !b.isUnlocked) {
          showToast(`🏆 Conquista Desbloqueada: ${b.title}!`, "success");
          return { ...b, isUnlocked: true, unlockedAt: new Date().toLocaleDateString("pt-BR") };
        }
        return b;
      })
    );
  };

  // --- API Handlers (Safe Fallbacks on Missing Keys) ---

  // 1. Generate Session Revision Questions
  const handleSessionComplete = async (area: EnemArea, topic: string) => {
    setIsGeneratingQuiz(true);
    setQuizArea(area);
    setQuizTopic(topic);
    setActiveQuizQuestions(null);
    setCurrentQuizIdx(0);
    setSelectedQuizAnswer(null);
    setShowQuizExplanation(false);
    setQuizScore(0);
    setIsQuizCompleted(false);

    // Ensure we go to Foco Tab to solve the revision quiz
    setActiveTab("foco");

    const notesForArea = notes.find((n) => n.area === area)?.content || "";

    try {
      const response = await fetch("/api/generate-activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, topic, notes: notesForArea })
      });

      if (!response.ok) {
        throw new Error("API Offline ou não configurada");
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setActiveQuizQuestions(data);
        showToast("Atividade personalizada gerada pelo tutor IA!", "success");
      } else {
        throw new Error("Resposta inválida");
      }
    } catch (error) {
      console.warn("Utilizando questões padrão para revisão devido a limites de API:", error);
      // Fallback with static default questions
      const fallback = DEFAULT_QUESTIONS[area] || DEFAULT_QUESTIONS[EnemArea.LINGUAGENS];
      setActiveQuizQuestions(fallback);
      showToast("Carregadas questões de revisão padrão.", "info");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  // 2. Generate Saturday Mock Exam
  const handleStartSimulado = async (area: EnemArea) => {
    setIsGeneratingSimulado(true);
    setSimuladoState(null);
    setSimuladoAnswers({});

    try {
      const response = await fetch("/api/generate-simulado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area })
      });

      if (!response.ok) throw new Error("Fallback para simulador offline");

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setSimuladoState({
          area,
          questions: data,
          currentQuestionIndex: 0,
          userAnswers: {},
          isCompleted: false,
          score: 0,
          date: new Date().toLocaleDateString("pt-BR")
        });
        showToast(`Simulado IA de ${area} gerado com sucesso!`, "success");
      } else {
        throw new Error("Formato inválido");
      }
    } catch (error) {
      console.warn("Fallback de simulado com banco de dados fixo:", error);
      const fallback = DEFAULT_QUESTIONS[area] || DEFAULT_QUESTIONS[EnemArea.MATEMATICA];
      setSimuladoState({
        area,
        questions: fallback,
        currentQuestionIndex: 0,
        userAnswers: {},
        isCompleted: false,
        score: 0,
        date: new Date().toLocaleDateString("pt-BR")
      });
      showToast(`Carregadas questões clássicas de ${area} para o simulado.`, "info");
    } finally {
      setIsGeneratingSimulado(false);
    }
  };

  // 3. AI Mentor Insight Provider
  const handleConsultMentor = async (area: EnemArea) => {
    setIsLoadingMentor(true);
    const content = notes.find((n) => n.area === area)?.content || "";

    if (!content.trim()) {
      showToast("Escreva alguma anotação antes de pedir conselhos ao Mentor!", "error");
      setIsLoadingMentor(false);
      return;
    }

    try {
      const response = await fetch("/api/advisor-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ area, notes: content })
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setMentorFeedbacks((prev) => ({
        ...prev,
        [area]: data
      }));
      showToast("Mentor IA analisou suas anotações com sucesso!", "success");
    } catch (error) {
      console.warn("Fallback offline do Mentor");
      // Fallback
      setMentorFeedbacks((prev) => ({
        ...prev,
        [area]: {
          analysis: `Ótimas anotações sobre ${area}. Recomendo focar na intertextualidade dos conceitos para garantir a correta interpretação baseada nas matrizes curriculares do ENEM.`,
          hotTopics: [
            "Análise de Padrões e Gráficos Clássicos",
            "Modelagem e Conceitos Estruturais da Área",
            "Resolução Rápida por Eliminação de Distratores"
          ],
          mnemonicTip: "Lembre-se: O ENEM cobra competência e habilidade de transposição didática, não decoreba pura!"
        }
      }));
      showToast("Dica estratégica carregada pelo tutor do ENEM.", "info");
    } finally {
      setIsLoadingMentor(false);
    }
  };

  // 4. Grade Essay (Redação)
  const handleGradeEssaySubmit = async () => {
    if (!essayText.trim() || essayText.length < 100) {
      showToast("A redação deve ter no mínimo 100 caracteres para uma avaliação adequada!", "error");
      return;
    }

    setIsGradingEssay(true);
    setEssayCorrection(null);

    try {
      const response = await fetch("/api/grade-essay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: selectedTheme, essayText })
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setEssayCorrection(data);
      
      // Save to history
      const newHistoryItem = {
        theme: selectedTheme,
        score: data.totalScore,
        date: new Date().toLocaleDateString("pt-BR")
      };
      setEssayHistory((prev) => [newHistoryItem, ...prev]);
      
      unlockBadge("iron_essay");
      if (data.totalScore >= 900) {
        unlockBadge("perfect_score");
      }
      showToast("Redação corrigida estritamente de acordo com as diretrizes do ENEM!", "success");
    } catch (error) {
      console.warn("Falha na correção remota. Gerando avaliação pedagógica local simulada.");
      // Standard mockup grader
      const fallbackCorrection: EssayCorrection = {
        totalScore: 760,
        competencyScores: {
          comp1: 160,
          comp1Feedback: "Bom domínio da modalidade escrita formal. Pequenos desvios de concordância ou pontuação secundária.",
          comp2: 120,
          comp2Feedback: "Compreendeu a proposta de redação, mas pode aprofundar mais o repertório sociocultural legítimo.",
          comp3: 160,
          comp3Feedback: "Argumentação consistente que defende bem o posicionamento ao longo do texto.",
          comp4: 160,
          comp4Feedback: "Boa coesão interparágrafos e intraparágrafos. Poucas repetições lexicais.",
          comp5: 160,
          comp5Feedback: "Apresenta proposta de intervenção viável. Garanta o detalhamento do meio/modo de execução para chegar a 200."
        },
        generalFeedback: "Seu texto apresenta uma estrutura excelente de redação estilo ENEM. Para subir a nota em direção aos 1000 pontos, busque diversificar os conectivos e introduzir pensadores externos bem contextualizados logo no primeiro desenvolvimento.",
        improvementPoints: [
          "Insira alusões históricas ou sociológicas produtivas.",
          "Detone o agente e a ação social na proposta de intervenção.",
          "Evite clichês e generalizações vagas na tese."
        ]
      };
      setEssayCorrection(fallbackCorrection);
      setEssayHistory((prev) => [{ theme: selectedTheme, score: 760, date: new Date().toLocaleDateString("pt-BR") }, ...prev]);
      unlockBadge("iron_essay");
      showToast("Correção de redação simuladora concluída.", "info");
    } finally {
      setIsGradingEssay(false);
    }
  };

  // --- Local Note Editors ---
  const handleSaveNote = () => {
    if (!noteInput.trim()) return;
    setNotes((prev) =>
      prev.map((n) => {
        if (n.area === selectedAreaForNotes) {
          return {
            ...n,
            content: noteInput,
            updatedAt: new Date().toISOString()
          };
        }
        return n;
      })
    );
    setNoteInput("");
    showToast(`Anotação de ${selectedAreaForNotes} atualizada!`, "success");
  };

  const handleClearNote = (area: EnemArea) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.area === area) {
          return { ...n, content: "", updatedAt: new Date().toISOString() };
        }
        return n;
      })
    );
    showToast("Anotação limpa com sucesso.", "info");
  };

  // --- Quiz Solving Logic ---
  const handleSelectQuizAnswer = (idx: number) => {
    if (selectedQuizAnswer !== null) return; // Prevent double selecting
    setSelectedQuizAnswer(idx);
    setShowQuizExplanation(true);
    
    const isCorrect = idx === activeQuizQuestions![currentQuizIdx].correctOptionIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (!activeQuizQuestions) return;
    if (currentQuizIdx + 1 < activeQuizQuestions.length) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedQuizAnswer(null);
      setShowQuizExplanation(false);
    } else {
      setIsQuizCompleted(true);
      if (quizScore === activeQuizQuestions.length) {
        unlockBadge("perfect_score");
      }
    }
  };

  // --- Simulado Solving Logic ---
  const handleSelectSimuladoAnswer = (qIdx: number, oIdx: number) => {
    if (!simuladoState || simuladoState.isCompleted) return;
    setSimuladoAnswers((prev) => ({
      ...prev,
      [qIdx]: oIdx
    }));
  };

  const handleNextSimuladoQuestion = () => {
    if (!simuladoState) return;
    if (simuladoState.currentQuestionIndex + 1 < simuladoState.questions.length) {
      setSimuladoState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        };
      });
    }
  };

  const handlePrevSimuladoQuestion = () => {
    if (!simuladoState) return;
    if (simuladoState.currentQuestionIndex > 0) {
      setSimuladoState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex - 1
        };
      });
    }
  };

  const handleFinishSimulado = () => {
    if (!simuladoState) return;
    let correctCount = 0;
    simuladoState.questions.forEach((q, idx) => {
      if (simuladoAnswers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    // Simple TRI simulation score out of 1000
    // Math, Natureza and Humanas have different scaling but we can do a fun proportional estimate
    const minTri = 350;
    const maxTri = 960;
    const triScore = Math.round(minTri + (correctCount / simuladoState.questions.length) * (maxTri - minTri));

    const updatedState: SimuladoState = {
      ...simuladoState,
      isCompleted: true,
      score: triScore,
      userAnswers: simuladoAnswers
    };

    setSimuladoState(updatedState);
    setSimuladoHistory((prev) => [
      {
        area: simuladoState.area,
        score: triScore,
        date: new Date().toLocaleDateString("pt-BR"),
        totalCorrect: correctCount
      },
      ...prev
    ]);

    unlockBadge("first_simulado");
    if (correctCount === simuladoState.questions.length) {
      unlockBadge("perfect_score");
    }

    showToast(`Simulado Concluído! Pontuação estimada TRI: ${triScore}`, "success");
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" id="main-app-shell">
      
      {/* 1. Sleek Navigation Header */}
      <nav className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shadow-sm shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              ENEM Master <span className="text-indigo-600 font-medium">Focus</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase hidden sm:block">
              Ciclos de 90min • Revisões Ativas • Simulados de Sábado
            </p>
          </div>
        </div>

        {/* Top central indicator: Goal */}
        <div className="hidden md:flex flex-col items-center bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full">
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Meta Final</p>
          <p className="text-xs font-extrabold text-indigo-900 flex items-center gap-1">
            🎯 Fechar a Prova do ENEM
          </p>
        </div>

        {/* User / Badge quick indicator */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-700">Estudante de Alto Rendimento</p>
            <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Foco Ativo
            </p>
          </div>
        </div>
      </nav>

      {/* 2. Top notification system (Toast) */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 max-w-sm"
          >
            <div className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 ${
              toastMessage.type === "success" 
                ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                : toastMessage.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-indigo-50 border-indigo-200 text-indigo-900"
            }`}>
              {toastMessage.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />}
              {toastMessage.type === "error" && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
              {toastMessage.type === "info" && <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />}
              <div>
                <p className="text-xs font-bold">{toastMessage.text}</p>
              </div>
              <button onClick={() => setToastMessage(null)} className="ml-auto text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Content Columns */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 sm:p-6 gap-6 max-w-[1600px] w-full mx-auto" id="app-layout-grid">
        
        {/* LEFT COLUMN: Sidebar Navigation & General Stats */}
        <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
          
          {/* Main Navigation Menu */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
              Áreas de Trabalho
            </h2>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setActiveTab("foco")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "foco"
                      ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4" /> Sala de Foco (90m)
                  </span>
                  {dailySessionsCompleted > 0 && (
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded-full">
                      {dailySessionsCompleted}/5
                    </span>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("simulados")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "simulados"
                      ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" /> Simulados de Sábado
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                    Sáb
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("anotacoes")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "anotacoes"
                      ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <BookMarked className="w-4 h-4" /> Anotações por Área
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono">
                    {notes.filter((n) => n.content.trim()).length}/5
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("redacao")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "redacao"
                      ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <PenTool className="w-4 h-4" /> Redação Nota 1000
                  </span>
                  <span className="bg-rose-50 text-rose-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    IA
                  </span>
                </button>
              </li>
              {/* Conquistas e Progresso tab removed */}
            </ul>
          </div>

          {/* Quick Statistics Banner */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl"></div>
            <div>
              <p className="text-[10px] uppercase text-indigo-300 font-extrabold tracking-widest">
                Tempo Total Estudado
              </p>
              <h3 className="text-3xl font-extrabold text-white font-mono mt-1">
                {Math.floor(totalStudyTime)}
                <span className="text-lg font-medium text-indigo-200"> min</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Progresso real recalculado constantemente.
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-[10px] uppercase text-indigo-300 font-extrabold tracking-wider mb-1">
                Média do Simulado (TRI)
              </p>
              <p className="text-xl font-black text-white">
                {simuladoHistory.length > 0
                  ? Math.round(simuladoHistory.reduce((sum, s) => sum + s.score, 0) / simuladoHistory.length)
                  : "N/A"}{" "}
                <span className="text-xs font-normal text-indigo-300">pontos</span>
              </p>
            </div>
          </div>

          {/* Target Reminder Widget */}
          <div className="bg-gradient-to-br from-indigo-50 to-sky-50 rounded-2xl p-4 border border-indigo-100 flex items-start gap-3">
            <BrainCircuit className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-indigo-900">Método de Alto Impacto</p>
              <p className="text-[11px] text-indigo-700/90 leading-relaxed mt-1">
                A teoria clássica defende que sessões profundas de <strong>90 minutos</strong> seguidas por intervalos de 5 são perfeitas para simular a prova de resistência do ENEM.
              </p>
            </div>
          </div>

        </aside>

        {/* MIDDLE / MAIN SECTION: Dynamic Workspace Panels */}
        <main className="flex-1 flex flex-col gap-6" id="app-workspace-canvas">
          
          {/* TAB 1: FOCUS & REVISION QUIZ */}
          {activeTab === "foco" && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              
              {/* Dynamic Timer Control block */}
              <Timer
                onSessionComplete={handleSessionComplete}
                dailySessionsCompleted={dailySessionsCompleted}
                setDailySessionsCompleted={setDailySessionsCompleted}
                totalStudyTime={totalStudyTime}
                setTotalStudyTime={setTotalStudyTime}
              />

              {/* POST-SESSION REVISION CHALLENGE VIEW */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                      Atividades Pós-Sessão: Fixação Inteligente
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Geradas instantaneamente por Inteligência Artificial baseado na sua última área de foco.
                    </p>
                  </div>

                  {/* Manual testing or trigger buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSessionComplete(EnemArea.MATEMATICA, "Funções Afins")}
                      className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all"
                    >
                      Gerar Atividade Teste (Matemática)
                    </button>
                    <button
                      onClick={() => handleSessionComplete(EnemArea.NATUREZA, "Ecologia e Impactos")}
                      className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition-all"
                    >
                      Gerar Atividade Teste (Natureza)
                    </button>
                  </div>
                </div>

                {isGeneratingQuiz && (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4"></div>
                    <p className="text-sm font-bold text-slate-700">O Professor IA está elaborando sua atividade...</p>
                    <p className="text-xs text-slate-400 mt-1">Lendo suas anotações e calibrando os distratores oficiais do ENEM.</p>
                  </div>
                )}

                {!isGeneratingQuiz && !activeQuizQuestions && (
                  <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700">Nenhuma revisão ativa pendente</p>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Termine um ciclo de 90 minutos usando o cronômetro acima ou clique em um dos botões de teste rápido para gerar questões personalizadas com Inteligência Artificial.
                    </p>
                  </div>
                )}

                {!isGeneratingQuiz && activeQuizQuestions && !isQuizCompleted && (
                  <div className="flex flex-col gap-5">
                    {/* Progress tracking inside quiz */}
                    <div className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-xl border border-indigo-100/50">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {quizArea}
                        </span>
                        {quizTopic && (
                          <span className="text-xs font-bold text-slate-600">
                            Tópico: {quizTopic}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-indigo-700">
                        Questão {currentQuizIdx + 1} de {activeQuizQuestions.length}
                      </span>
                    </div>

                    {/* Question Content */}
                    <div className="flex flex-col gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs sm:text-sm text-slate-700 italic leading-relaxed font-serif">
                        {activeQuizQuestions[currentQuizIdx].contextText}
                      </div>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-800 leading-snug">
                        {activeQuizQuestions[currentQuizIdx].questionText}
                      </h3>
                    </div>

                    {/* Options list */}
                    <div className="flex flex-col gap-2">
                      {activeQuizQuestions[currentQuizIdx].options.map((option, idx) => {
                        const letter = ["A", "B", "C", "D", "E"][idx];
                        const isSelected = selectedQuizAnswer === idx;
                        const isCorrect = idx === activeQuizQuestions[currentQuizIdx].correctOptionIndex;
                        const hasAnswered = selectedQuizAnswer !== null;

                        let btnStyle = "bg-white hover:bg-slate-50 border-slate-200 text-slate-700";
                        if (isSelected) {
                          btnStyle = isCorrect
                            ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm"
                            : "bg-rose-50 border-rose-500 text-rose-900 shadow-sm";
                        } else if (hasAnswered && isCorrect) {
                          btnStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectQuizAnswer(idx)}
                            disabled={hasAnswered}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs sm:text-sm flex items-start gap-3 ${btnStyle}`}
                          >
                            <span className={`w-6 h-6 shrink-0 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? isCorrect
                                  ? "bg-emerald-500 text-white"
                                  : "bg-rose-500 text-white"
                                : hasAnswered && isCorrect
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}>
                              {letter}
                            </span>
                            <span className="flex-grow">{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Detailed AI Explanation */}
                    {showQuizExplanation && (
                      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-xs sm:text-sm text-indigo-950 mt-2">
                        <p className="font-extrabold flex items-center gap-1.5 text-indigo-900 mb-1">
                          <BrainCircuit className="w-4 h-4" /> Gabarito Comentado (Resolução):
                        </p>
                        <p className="leading-relaxed">
                          {activeQuizQuestions[currentQuizIdx].explanation}
                        </p>
                        <button
                          onClick={handleNextQuizQuestion}
                          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                        >
                          Próxima Questão <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!isGeneratingQuiz && activeQuizQuestions && isQuizCompleted && (
                  <div className="p-6 text-center bg-indigo-50/50 rounded-xl border border-indigo-150 flex flex-col items-center justify-center">
                    <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-2xl mb-3 shadow-inner">
                      🎉
                    </div>
                    <h3 className="text-base font-extrabold text-indigo-900">Atividade Concluída com Sucesso!</h3>
                    <p className="text-xs text-indigo-700 max-w-sm mt-1">
                      Você acertou <strong>{quizScore} de {activeQuizQuestions.length}</strong> questões propostas. Seus conceitos estão sendo consolidados.
                    </p>

                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => setActiveQuizQuestions(null)}
                        className="bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs py-2 px-4 rounded-xl border border-slate-200 transition-all"
                      >
                        Fechar Janela
                      </button>
                      <button
                        onClick={() => handleSessionComplete(quizArea, quizTopic)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm"
                      >
                        Tentar Novas Questões
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SATURDAY MOCK EXAMS (SIMULADOS) */}
          {activeTab === "simulados" && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col items-center text-center gap-6 animate-fadeIn" id="simulado-aviso-panel">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 animate-bounce">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h2 className="text-xl font-black text-slate-800">
                  Atenção: Hoje é Sábado! Dia de Simulado Geral 📝
                </h2>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  Sábado é o dia oficial reservado para testar seus conhecimentos e treinar sua resistência física e mental sob as condições reais de prova do ENEM.
                </p>
              </div>
              <div className="w-full max-w-lg bg-amber-50 border border-amber-200 rounded-2xl p-5 text-left flex gap-4">
                <Calendar className="w-6 h-6 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">Instruções Práticas para o Simulado</h4>
                  <ul className="text-xs text-amber-805 mt-2 space-y-2 list-disc list-inside font-medium leading-relaxed">
                    <li>Escolha um ambiente totalmente silencioso e livre de interrupções.</li>
                    <li>Deixe o celular desligado ou longe do seu alcance para focar totalmente.</li>
                    <li>Separe garrafa de água e um pequeno lanche para simular o cansaço do exame real.</li>
                    <li>Mantenha um cronômetro rigoroso e treine o preenchimento do gabarito.</li>
                  </ul>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Seu cronograma de estudos foi ajustado automaticamente. Bom desempenho!
              </p>
            </div>
          )}

          {/* TAB 3: NOTES ORGANIZER & MENTOR IA */}
          {activeTab === "anotacoes" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-indigo-600" />
                  Caderno de Anotações Estruturado por Área
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Escreva suas sínteses e resumos de estudo por área de conhecimento. Chame o Mentor IA para sugerir melhorias para a prova.
                </p>
              </div>

              {/* Area buttons tabs */}
              <div className="flex flex-wrap gap-2">
                {Object.values(EnemArea).map((area) => {
                  const isSelected = selectedAreaForNotes === area;
                  const count = notes.find((n) => n.area === area)?.content.trim().length || 0;
                  return (
                    <button
                      key={area}
                      onClick={() => {
                        setSelectedAreaForNotes(area);
                        const current = notes.find((n) => n.area === area)?.content || "";
                        setNoteInput(current);
                      }}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                        isSelected
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                      }`}
                    >
                      <span>{area.split(" ")[0]}</span>
                      {count > 0 && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                          isSelected ? "bg-white text-indigo-800" : "bg-indigo-100 text-indigo-800"
                        }`}>
                          Ativo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Notes Editor Box */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                    Escrevendo para: {selectedAreaForNotes}
                  </span>
                  {notes.find((n) => n.area === selectedAreaForNotes)?.content && (
                    <button
                      onClick={() => handleClearNote(selectedAreaForNotes)}
                      className="text-slate-400 hover:text-rose-600 text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Limpar Anotação
                    </button>
                  )}
                </div>

                <textarea
                  placeholder={`Insira aqui fórmulas, resumos, conceitos-chave, teorias ou dúvidas frequentes de ${selectedAreaForNotes}...`}
                  className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                />

                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleSaveNote}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold py-2 px-5 rounded-xl transition-all shadow-sm flex items-center gap-1"
                  >
                    Salvar e Persistir <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mentor IA removed */}
            </div>
          )}

          {/* TAB 4: REDAÇÃO NOTA 1000 GRADER */}
          {activeTab === "redacao" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-indigo-600" />
                  Corretor Oficial de Redação ENEM Inteligente
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Escreva e envie redações baseadas em temas reais do ENEM para receber correções detalhadas divididas pelas 5 competências formais do edital do INEP.
                </p>
              </div>

              {/* Theme Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Selecione uma Proposta / Tema de Redação:
                </label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                >
                  {ESSAY_THEMES.map((theme, i) => (
                    <option key={i} value={theme}>
                      {theme}
                    </option>
                  ))}
                </select>
              </div>

              {/* Essay Text Area */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Seu Texto Dissertativo-Argumentativo:
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${
                    essayText.length < 500 ? "text-slate-400" : essayText.length > 3000 ? "text-rose-500" : "text-emerald-600"
                  }`}>
                    {essayText.length} caracteres (Ideal: 800 - 2500)
                  </span>
                </div>
                <textarea
                  placeholder="Escreva sua introdução, desenvolvimento 1, desenvolvimento 2 e proposta de intervenção de acordo com o padrão do ENEM..."
                  className="w-full h-80 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono leading-relaxed"
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                />
              </div>

              {/* ChatGPT Prompt & Link Card */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                      GPT
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-emerald-950">Correção Profissional no ChatGPT</h3>
                      <p className="text-xs text-emerald-700 font-medium">Envie seu texto para o ChatGPT para receber uma correção detalhada e pontuação baseada no ENEM.</p>
                    </div>
                  </div>
                  <a
                    href="https://chatgpt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2.5 px-5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    Ir para o ChatGPT
                  </a>
                </div>

                <div className="bg-white border border-emerald-150 rounded-xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      Prompt Pronto para Copiar:
                    </span>
                    <button
                      onClick={() => {
                        const text = `Corrija minha redação do ENEM sobre o tema "${selectedTheme}". Avalie e dê notas detalhadas de 0 a 200 para cada uma das 5 competências do edital do INEP, justifique cada nota e sugira melhorias práticas. Aqui está o meu texto:\n\n${essayText || "[Por favor, escreva o seu texto primeiro no editor acima]"}`;
                        navigator.clipboard.writeText(text);
                        showToast("Prompt copiado com sucesso para a área de transferência!", "success");
                      }}
                      className="text-indigo-600 hover:text-indigo-800 text-[11px] font-extrabold transition-all"
                    >
                      Copiar Prompt
                    </button>
                  </div>
                  <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line font-mono">
                    {`Corrija minha redação do ENEM sobre o tema "${selectedTheme}". Avalie e dê notas detalhadas de 0 a 200 para cada uma das 5 competências do edital do INEP, justifique cada nota e sugira melhorias práticas. Aqui está o meu texto:\n\n${essayText || "[Escreva seu texto no campo acima para que ele apareça aqui]"}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PROGRESS & BADGES ENGINE REMOVED */}
        </main>

        {/* RIGHT SIDEBAR: DAILY TIMELINE & AREA NOTES OVERVIEW */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-6" id="app-right-sidebar">
          
          {/* Caderno Rápido widget */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                Anotações Atuais (5 Áreas)
              </h2>
              <button
                onClick={() => setActiveTab("anotacoes")}
                className="text-indigo-600 hover:text-indigo-800 text-[10px] font-extrabold transition-all"
              >
                Escrever
              </button>
            </div>
            
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
              {notes.map((n) => {
                const count = n.content.trim().length;
                let colorClass = "text-indigo-600 bg-indigo-50 border-indigo-100";
                if (n.area === EnemArea.MATEMATICA) colorClass = "text-blue-600 bg-blue-50 border-blue-100";
                if (n.area === EnemArea.NATUREZA) colorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
                if (n.area === EnemArea.HUMANAS) colorClass = "text-amber-600 bg-amber-50 border-amber-100";
                if (n.area === EnemArea.REDACAO) colorClass = "text-rose-600 bg-rose-50 border-rose-100";

                return (
                  <div key={n.area} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-[10px]">{n.area.split(",")[0]}</span>
                      {count > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    </div>
                    <p className="text-slate-600 leading-snug line-clamp-2">
                      {n.content.trim() || <span className="italic text-slate-400">Nenhuma anotação registrada ainda.</span>}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's study planner/timeline schedule widget (Daily Timeline) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
              Cronograma diário sugerido
            </h2>
            <div className="space-y-4">
              {[
                { time: "08:00", label: "Sessão 1: Linguagens", isCompleted: dailySessionsCompleted >= 1, isCurrent: dailySessionsCompleted === 0 },
                { time: "09:35", label: "Sessão 2: Matemática", isCompleted: dailySessionsCompleted >= 2, isCurrent: dailySessionsCompleted === 1 },
                { time: "11:10", label: "Sessão 3: Natureza", isCompleted: dailySessionsCompleted >= 3, isCurrent: dailySessionsCompleted === 2 },
                { time: "14:00", label: "Sessão 4: Humanas", isCompleted: dailySessionsCompleted >= 4, isCurrent: dailySessionsCompleted === 3 },
                { time: "15:35", label: "Sessão 5: Redação", isCompleted: dailySessionsCompleted >= 5, isCurrent: dailySessionsCompleted === 4 }
              ].map((step, idx) => {
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-8 py-1 rounded text-[9px] font-bold text-center ${
                      step.isCurrent 
                        ? "bg-indigo-600 text-white animate-pulse" 
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {step.time}
                    </div>
                    <div className="flex-grow">
                      <p className={`text-xs font-bold ${
                        step.isCompleted 
                          ? "line-through text-slate-400" 
                          : step.isCurrent 
                          ? "text-indigo-600 font-extrabold" 
                          : "text-slate-700"
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </aside>

      </div>

    </div>
  );
}
