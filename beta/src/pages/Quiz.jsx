import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/api/localApi";
import { Brain, CheckCircle2, XCircle, Sparkles, RefreshCw } from "lucide-react";

const STORAGE_KEY = "ea_player_name";

export default function Quiz() {
  const [emotions, setEmotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState(localStorage.getItem(STORAGE_KEY) || "");
  const [nameInput, setNameInput] = useState("");
  const [quiz, setQuiz] = useState(null); // {type, question, options, answer, emotion}
  const [score, setScore] = useState({ correct: 0, total: 0, emotional: 0, intellectual: 0 });
  const [answered, setAnswered] = useState(null); // selected option index
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    api.entities.Emotion.list("name", 50)
      .then(setEmotions)
      .catch(() => setEmotions([]))
      .finally(() => setLoading(false));
  }, []);

  const generateQuiz = useCallback(() => {
    if (emotions.length < 3) return null;
    const useIntellectual = Math.random() < 0.4;
    if (useIntellectual) {
      // Intellectual / logic question
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      const correct = a + b;
      const options = [correct, correct + 1, correct - 1, correct + 2].sort(() => Math.random() - 0.5);
      return {
        type: "intellectual",
        question: `Quanto é ${a} + ${b}?`,
        options: options.map(String),
        answer: String(correct),
      };
    }
    // Emotional recognition question
    const correctEmo = emotions[Math.floor(Math.random() * emotions.length)];
    const wrong = emotions.filter((e) => e.id !== correctEmo.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [correctEmo, ...wrong].sort(() => Math.random() - 0.5);
    return {
      type: "emotional",
      question: `Qual emoção combina com: "${correctEmo.examples || correctEmo.description}"`,
      options: options.map((e) => e.name),
      answer: correctEmo.name,
      emoji: correctEmo.emoji,
    };
  }, [emotions]);

  const startQuiz = useCallback(() => {
    const q = generateQuiz();
    if (q) {
      setQuiz(q);
      setAnswered(null);
      setShowResult(false);
    }
  }, [generateQuiz]);

  useEffect(() => {
    if (playerName && emotions.length >= 3 && !quiz) startQuiz();
  }, [playerName, emotions, quiz, startQuiz]);

  const handleAnswer = (option) => {
    if (answered !== null) return;
    setAnswered(option);
    const isCorrect = option === quiz.answer;
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
      emotional: s.emotional + (isCorrect && quiz.type === "emotional" ? 10 : 0),
      intellectual: s.intellectual + (isCorrect && quiz.type === "intellectual" ? 10 : 0),
    }));
    setShowResult(true);
  };

  const next = async () => {
    startQuiz();
  };

  const finishAndSave = async () => {
    const totalPoints = score.emotional + score.intellectual;
    try {
      await api.entities.ScoreRecord.create({
        player_name: playerName,
        total_points: totalPoints,
        emotional_score: score.emotional,
        intellectual_score: score.intellectual,
        quizzes_completed: score.total,
        level: Math.floor(totalPoints / 50) + 1,
      });
    } catch (e) {
      // ignore save errors
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Name entry
  if (!playerName) {
    return (
      <div className="max-w-md mx-auto pt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          <Brain className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h1 className="font-heading text-2xl font-bold text-slate-800">Vamos jogar! 🎮</h1>
          <p className="text-slate-500 mt-2">Como você se chama?</p>
        </motion.div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (nameInput.trim()) {
              localStorage.setItem(STORAGE_KEY, nameInput.trim());
              setPlayerName(nameInput.trim());
            }
          }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
        >
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Seu nome"
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-400 focus:outline-none text-slate-700"
            autoFocus
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            className="w-full mt-4 py-3 rounded-2xl bg-emerald-500 text-white font-semibold disabled:opacity-40 hover:bg-emerald-600 transition-colors"
          >
            Começar a jogar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Score bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-400">Olá, <span className="font-semibold text-slate-600">{playerName}</span> 👋</p>
          <div className="flex gap-4 mt-1">
            <span className="text-xs bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full font-medium">
              😊 Emocional: {score.emotional}
            </span>
            <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full font-medium">
              🧠 Intelectual: {score.intellectual}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-700">{score.correct}/{score.total}</p>
          <p className="text-xs text-slate-400">acertos</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {quiz && (
          <motion.div
            key={score.total}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                quiz.type === "emotional" ? "bg-sky-50 text-sky-600" : "bg-emerald-50 text-emerald-600"
              }`}>
                {quiz.type === "emotional" ? "😊 Reconhecimento emocional" : "🧠 Raciocínio"}
              </span>
            </div>

            {quiz.emoji && (
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl text-center mb-4"
              >
                🎭
              </motion.div>
            )}

            <h2 className="font-heading text-lg font-semibold text-slate-700 text-center mb-6 leading-relaxed">
              {quiz.question}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quiz.options.map((opt, i) => {
                const isAnswer = opt === quiz.answer;
                const isPicked = answered === opt;
                let style = "border-slate-200 hover:border-slate-300 hover:bg-slate-50";
                if (answered !== null) {
                  if (isAnswer) style = "border-emerald-400 bg-emerald-50";
                  else if (isPicked) style = "border-red-300 bg-red-50";
                  else style = "border-slate-200 opacity-50";
                }
                return (
                  <motion.button
                    key={opt}
                    whileHover={answered === null ? { scale: 1.02 } : {}}
                    whileTap={answered === null ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(opt)}
                    disabled={answered !== null}
                    className={`px-4 py-3.5 rounded-2xl border-2 text-slate-700 font-medium transition-all text-left flex items-center justify-between ${style}`}
                  >
                    <span>{opt}</span>
                    {answered !== null && isAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {answered !== null && isPicked && !isAnswer && <XCircle className="w-5 h-5 text-red-400" />}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 flex gap-3"
                >
                  <button
                    onClick={next}
                    className="flex-1 py-3 rounded-2xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Próximo desafio
                  </button>
                  <button
                    onClick={finishAndSave}
                    className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Salvar pontos
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs text-slate-400 mt-6">
        Acerte desafios para ganhar pontos e subir de nível!
      </p>
    </div>
  );
}