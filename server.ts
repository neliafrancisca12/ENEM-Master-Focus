import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client safely
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper check for Gemini client
  const getAi = () => {
    if (!ai) {
      throw new Error("API Key do Gemini não configurada. Por favor, configure GEMINI_API_KEY nos Secrets.");
    }
    return ai;
  };

  // API Route: Generate study activities/quizzes for end-of-session
  app.post("/api/generate-activity", async (req, res) => {
    try {
      const { area, topic, notes } = req.body;
      const client = getAi();

      const prompt = `Gere uma atividade de revisão rápida de fixação para o ENEM sobre o tema "${topic || "Tópicos Gerais"}" na área de "${area}".
      ${notes ? `Aqui estão as anotações do estudante para ajudar na personalização: "${notes}"` : ""}
      
      Gere exatamente 3 questões de múltipla escolha no estilo ENEM. Cada questão deve ter:
      - Um texto de apoio contextualizado (característico do ENEM)
      - Um enunciado claro
      - Exatamente 5 alternativas (A, B, C, D, E)
      - O índice da alternativa correta (0 para A, 1 para B, etc.)
      - Uma explicação pedagógica sucinta de por que aquela alternativa é a correta.
      
      Importante: Responda estritamente em português brasileiro.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é um professor especialista em preparação para o ENEM. Gere questões de fixação pedagógicas, desafiadoras e contextualizadas.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Lista de 3 questões de múltipla escolha para revisão.",
            items: {
              type: Type.OBJECT,
              properties: {
                contextText: { type: Type.STRING, description: "Texto contextualizado de apoio." },
                questionText: { type: Type.STRING, description: "O comando/pergunta da questão." },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exatamente 5 opções/alternativas de resposta."
                },
                correctOptionIndex: { type: Type.INTEGER, description: "Índice da resposta correta (0 a 4)." },
                explanation: { type: Type.STRING, description: "Explicação didática detalhada." }
              },
              required: ["contextText", "questionText", "options", "correctOptionIndex", "explanation"]
            }
          }
        }
      });

      const text = response.text || "[]";
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Erro ao gerar atividade:", error);
      res.status(500).json({ error: error.message || "Erro interno do servidor ao gerar atividade." });
    }
  });

  // API Route: Generate Saturday Mock Exam (Simulado)
  app.post("/api/generate-simulado", async (req, res) => {
    try {
      const { area } = req.body;
      const client = getAi();

      // ENEM areas
      const prompt = `Gere um simulado oficial do ENEM para a área de "${area}".
      O simulado deve conter exatamente 5 questões completas e bem estruturadas de múltipla escolha.
      Crie questões cobrando conceitos clássicos do ENEM para esta área (por exemplo, funções/estatística para Matemática, ecologia/mecânica para Ciências da Natureza, história do Brasil/filosofia para Ciências Humanas, interpretação/figuras de linguagem para Linguagens).
      
      Cada questão deve conter:
      - Um texto de suporte ou contexto bem formulado.
      - Enunciado direcionado.
      - 5 alternativas claras (A, B, C, D, E).
      - Índice da alternativa correta (0 para A, 1 para B, etc.).
      - Explicação da resposta de forma didática.
      
      Por favor, retorne em português.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é uma banca examinadora profissional do ENEM. Crie questões fidedignas ao nível de dificuldade e estilo da prova real.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "Lista de 5 questões para o simulado de sábado.",
            items: {
              type: Type.OBJECT,
              properties: {
                contextText: { type: Type.STRING, description: "Texto de suporte da questão." },
                questionText: { type: Type.STRING, description: "Enunciado." },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "As 5 alternativas de A a E."
                },
                correctOptionIndex: { type: Type.INTEGER, description: "Índice correto (0-4)." },
                explanation: { type: Type.STRING, description: "Resolução detalhada." }
              },
              required: ["contextText", "questionText", "options", "correctOptionIndex", "explanation"]
            }
          }
        }
      });

      const text = response.text || "[]";
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Erro ao gerar simulado:", error);
      res.status(500).json({ error: error.message || "Erro ao gerar simulado." });
    }
  });

  // API Route: Grade Essay (Redação ENEM)
  app.post("/api/grade-essay", async (req, res) => {
    try {
      const { theme, essayText } = req.body;
      const client = getAi();

      const prompt = `Corrija a seguinte redação para o ENEM baseando-se estritamente na proposta/tema: "${theme}".
      
      Texto da Redação:
      """
      ${essayText}
      """
      
      Forneça uma avaliação pedagógica formal de acordo com as 5 Competências do ENEM (cada uma valendo de 0 a 200 pontos):
      1. Competência 1: Domínio da norma culta da língua escrita.
      2. Competência 2: Compreensão da proposta de redação e aplicação das áreas de conhecimento (repertório).
      3. Competência 3: Seleção, relação, organização e interpretação de informações, fatos e opiniões para defender um ponto de vista.
      4. Competência 4: Demonstração de conhecimento dos mecanismos linguísticos necessários para a construção da argumentação (coesão).
      5. Competência 5: Elaboração de proposta de intervenção para o problema abordado.
      
      Para cada competência, atribua uma nota (0, 40, 80, 120, 160, 200) e dê um feedback construtivo detalhado mostrando pontos fortes e falhas cometidas.
      Também forneça uma nota total final (soma das competências), um feedback geral motivador, e pontos exatos onde o estudante pode melhorar para atingir a nota 1000.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é um corretor oficial experiente de redação do ENEM. Avalie com seriedade, critérios rigorosos e forneça feedbacks extremamente construtivos e detalhados.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalScore: { type: Type.INTEGER, description: "Soma das notas das 5 competências (0 a 1000)." },
              competencyScores: {
                type: Type.OBJECT,
                properties: {
                  comp1: { type: Type.INTEGER, description: "Nota da Competência 1 (0-200)." },
                  comp1Feedback: { type: Type.STRING, description: "Crítica e feedback para Competência 1." },
                  comp2: { type: Type.INTEGER, description: "Nota da Competência 2 (0-200)." },
                  comp2Feedback: { type: Type.STRING, description: "Crítica e feedback para Competência 2." },
                  comp3: { type: Type.INTEGER, description: "Nota da Competência 3 (0-200)." },
                  comp3Feedback: { type: Type.STRING, description: "Crítica e feedback para Competência 3." },
                  comp4: { type: Type.INTEGER, description: "Nota da Competência 4 (0-200)." },
                  comp4Feedback: { type: Type.STRING, description: "Crítica e feedback para Competência 4." },
                  comp5: { type: Type.INTEGER, description: "Nota da Competência 5 (0-200)." },
                  comp5Feedback: { type: Type.STRING, description: "Crítica e feedback para Competência 5." }
                },
                required: [
                  "comp1", "comp1Feedback",
                  "comp2", "comp2Feedback",
                  "comp3", "comp3Feedback",
                  "comp4", "comp4Feedback",
                  "comp5", "comp5Feedback"
                ]
              },
              generalFeedback: { type: Type.STRING, description: "Feedback geral sobre a estrutura, tese e argumentos." },
              improvementPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Lista de sugestões práticas para melhorar a escrita na próxima redação."
              }
            },
            required: ["totalScore", "competencyScores", "generalFeedback", "improvementPoints"]
          }
        }
      });

      const text = response.text || "{}";
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Erro ao corrigir redação:", error);
      res.status(500).json({ error: error.message || "Erro ao corrigir redação." });
    }
  });

  // API Route: AI Coach Study Advisor (Anotações)
  app.post("/api/advisor-feedback", async (req, res) => {
    try {
      const { area, notes } = req.body;
      const client = getAi();

      const prompt = `Analise as minhas anotações de estudo sobre a área "${area}" para o ENEM e me dê um feedback didático.
      Identifique lacunas de aprendizado conceituais que podem cair no ENEM, sugira 3 tópicos quentes que eu deveria focar para fechar a prova, e crie uma dica curta de memorização (mnemônico) relevante para o assunto das minhas anotações.
      
      Minhas anotações:
      """
      ${notes}
      """`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Você é o 'Mentor ENEM Inteligente', um tutor que analisa anotações de alunos e oferece feedback estratégico, dicas de memorização e direcionamento de estudos de alto rendimento.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING, description: "Análise geral das anotações e identificação de pontos de atenção." },
              hotTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 tópicos quentes recomendados para aprofundar."
              },
              mnemonicTip: { type: Type.STRING, description: "Uma dica mnemônica ou técnica de memorização super útil." }
            },
            required: ["analysis", "hotTopics", "mnemonicTip"]
          }
        }
      });

      const text = response.text || "{}";
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Erro ao gerar feedback de mentor:", error);
      res.status(500).json({ error: error.message || "Erro ao gerar feedback do mentor." });
    }
  });

  // Vite integration for asset serving & SPA routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support Express v4 SPA routing wildcard
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
