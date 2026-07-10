export enum EnemArea {
  LINGUAGENS = "Linguagens, Códigos e suas Tecnologias",
  MATEMATICA = "Matemática e suas Tecnologias",
  NATUREZA = "Ciências da Natureza e suas Tecnologias",
  HUMANAS = "Ciências Humanas e suas Tecnologias",
  REDACAO = "Redação"
}

export interface StudyNote {
  area: EnemArea;
  content: string;
  updatedAt: string;
}

export interface MentorFeedback {
  analysis: string;
  hotTopics: string[];
  mnemonicTip: string;
}

export interface Question {
  contextText: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface SimuladoState {
  area: EnemArea;
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<number, number>;
  isCompleted: boolean;
  score: number;
  date: string;
}

export interface EssayCorrection {
  totalScore: number;
  competencyScores: {
    comp1: number;
    comp1Feedback: string;
    comp2: number;
    comp2Feedback: string;
    comp3: number;
    comp3Feedback: string;
    comp4: number;
    comp4Feedback: string;
    comp5: number;
    comp5Feedback: string;
  };
  generalFeedback: string;
  improvementPoints: string[];
}

export interface StudySessionLog {
  id: string;
  area: EnemArea;
  topic: string;
  durationMinutes: number;
  timestamp: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface UserProgress {
  dailySessions: number; // 0 to 5
  totalStudyTime: number; // in minutes
  simuladosCompleted: number;
  averageSimuladoScore: number; // 0 to 100
  essaysSubmitted: number;
  bestEssayScore: number; // 0 to 1000
}
