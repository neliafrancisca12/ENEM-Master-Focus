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
  ChevronLeft,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { EnemArea, StudyNote, Question, SimuladoState, EssayCorrection, StudySessionLog, Badge, MentorFeedback, UserProgress, Cronograma, CronogramaOption, CronogramaDay } from "./types";
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

  const [activeTab, setActiveTab] = useState<"simulados" | "anotacoes" | "cronograma" | "metas">("cronograma");
  const [selectedAreaForNotes, setSelectedAreaForNotes] = useState<EnemArea>(EnemArea.LINGUAGENS);
  const [noteInput, setNoteInput] = useState("");
  const [metas, setMetas] = useState<{text: string, completed: boolean}[]>(() => {
    const saved = localStorage.getItem("enem_metas");
    const defaultMetas = [
      { text: "Ter 5 redações avaliadas com nota 1000 pelo chatgpt.", completed: false },
      { text: "Corrigir 12 provas do ENEM.", completed: false },
      { text: "Fazer todos os simulados do curso ENEM gratuito.", completed: false },
      { text: "Ficar craque em pirâmides.", completed: false }
    ];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasPyramid = parsed.some((m: any) => m.text.toLowerCase().includes("pirâmide"));
        if (!hasPyramid) {
          parsed.push({ text: "Ficar craque em pirâmides.", completed: false });
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return defaultMetas;
  });
  
  useEffect(() => {
    localStorage.setItem("enem_metas", JSON.stringify(metas));
  }, [metas]);
  const [cronograma, setCronograma] = useState<Cronograma>(() => {
    const saved = localStorage.getItem("enem_cronograma");
    if (saved) return JSON.parse(saved);
    const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    const initial: Cronograma = {};
    days.forEach(day => {
      initial[day] = { blocks: ["", "", "", ""] };
    });
    return initial;
  });
  
  useEffect(() => {
    localStorage.setItem("enem_cronograma", JSON.stringify(cronograma));
  }, [cronograma]);

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

    // Ensure we go to Anotacoes Tab to solve the revision quiz
    setActiveTab("anotacoes");

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
                  onClick={() => setActiveTab("metas")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "metas"
                      ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Target className="w-4 h-4" /> Metas do Curso
                  </span>
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
                  onClick={() => setActiveTab("cronograma")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "cronograma"
                      ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4" /> Cronograma de Estudos
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
          



          {/* TAB: METAS */}
          {activeTab === "metas" && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col gap-6 animate-fadeIn">
              <h2 className="text-lg font-black text-slate-800">Minhas Metas</h2>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  id="new-meta-input"
                  placeholder="Adicionar nova meta de estudos..."
                  className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const target = e.currentTarget;
                      if (target.value.trim()) {
                        setMetas([...metas, { text: target.value.trim(), completed: false }]);
                        target.value = "";
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById("new-meta-input") as HTMLInputElement;
                    if (input && input.value.trim()) {
                      setMetas([...metas, { text: input.value.trim(), completed: false }]);
                      input.value = "";
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl font-bold text-xs transition-all shadow-sm"
                >
                  Adicionar
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {metas.map((meta, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all group">
                    <div className="flex items-center gap-3 flex-1">
                      <input type="checkbox" checked={meta.completed} onChange={() => {
                          const newMetas = [...metas];
                          newMetas[i].completed = !newMetas[i].completed;
                          setMetas(newMetas);
                      }} className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600" />
                      <span className={`text-sm select-none ${meta.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                          {meta.text}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const newMetas = metas.filter((_, idx) => idx !== i);
                        setMetas(newMetas);
                      }}
                      className="text-slate-400 hover:text-rose-600 text-xs font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SIMULADOS FEITOS */}
          {activeTab === "simulados" && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col gap-6 animate-fadeIn">
              <h2 className="text-lg font-black text-slate-800">Simulados Feitos</h2>
              <div className="flex flex-col gap-3">
                <input type="text" placeholder="Nome do Simulado..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                <button className="bg-indigo-600 text-white p-3 rounded-xl font-bold text-sm">Adicionar Simulado</button>
              </div>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>Simulado 1 - 10/07</li>
              </ul>
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

          {/* TAB 4: CRONOGRAMA DE ESTUDOS */}
          {activeTab === "cronograma" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col gap-6 animate-fadeIn">
              <h2 className="text-lg font-black text-slate-800">Cronograma de Estudos Semanal</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Dia</th>
                      <th className="p-3">Bloco 1</th>
                      <th className="p-3">Bloco 2</th>
                      <th className="p-3">Bloco 3</th>
                      <th className="p-3">Bloco 4</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Object.entries(cronograma) as [string, CronogramaDay][]).map(([day, { blocks }]) => (
                      <tr key={day} className="border-b border-slate-100">
                        <td className="p-3 font-bold text-slate-800">{day}</td>
                        {blocks.map((block, i) => (
                          <td key={i} className="p-1">
                            <select
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                              value={block}
                              onChange={(e) => {
                                const newBlocks = [...blocks];
                                newBlocks[i] = e.target.value as CronogramaOption | "";
                                setCronograma(prev => ({ ...prev, [day]: { blocks: newBlocks } }));
                              }}
                            >
                              <option value="">Selecionar...</option>
                              <option value="Aulas">Aulas</option>
                              <option value="Exercícios">Exercícios</option>
                              <option value="Provas Anteriores">Provas Anteriores</option>
                              <option value="Redação">Redação</option>
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    localStorage.setItem("enem_cronograma", JSON.stringify(cronograma));
                    alert("Cronograma salvo com sucesso!");
                  }}
                  className="bg-indigo-600 text-white p-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all"
                >
                  Salvar Cronograma
                </button>
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
