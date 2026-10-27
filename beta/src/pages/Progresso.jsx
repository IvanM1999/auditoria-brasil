import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/api/localApi";
import { Trophy, Brain, Smile, TrendingUp, Award } from "lucide-react";

export default function Progresso() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.ScoreRecord.list("-total_points", 50)
      .then(setRecords)
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-100 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  const topThree = records.slice(0, 3);
  const rest = records.slice(3);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-800">Seu Progresso 🏆</h1>
        <p className="text-slate-500 mt-2">Tabela de pontuação e evolução</p>
      </motion.div>

      {records.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <p className="text-slate-500">Ninguém pontuou ainda.</p>
          <p className="text-slate-400 text-sm mt-1">Jogue os desafios para aparecer aqui!</p>
        </motion.div>
      ) : (
        <>
          {/* Podium */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-8 items-end">
              {topThree.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`text-center ${i === 0 ? "order-2" : i === 1 ? "order-1" : "order-3"}`}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                    className="text-4xl mb-2"
                  >
                    {medals[i]}
                  </motion.div>
                  <div className={`bg-white rounded-2xl p-4 border shadow-sm ${i === 0 ? "border-amber-200 h-36" : "h-28"}`}>
                    <p className="font-heading font-bold text-slate-700 text-sm truncate">{r.player_name}</p>
                    <p className={`font-bold ${i === 0 ? "text-2xl text-amber-500" : "text-xl text-slate-600"}`}>
                      {r.total_points}
                    </p>
                    <p className="text-xs text-slate-400">pontos</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Full leaderboard */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="font-heading font-semibold text-slate-700 text-sm">Classificação</span>
            </div>
            <div className="divide-y divide-slate-50">
              {records.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="w-6 text-center text-sm font-semibold text-slate-400">{i + 1}</span>
                  <span className="font-medium text-slate-700 flex-1 truncate">{r.player_name}</span>
                  <div className="flex gap-2">
                    <span className="text-xs bg-sky-50 text-sky-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <Smile className="w-3 h-3" /> {r.emotional_score}
                    </span>
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full flex items-center gap-1">
                      <Brain className="w-3 h-3" /> {r.intellectual_score}
                    </span>
                  </div>
                  <span className="font-bold text-slate-700 w-12 text-right">{r.total_points}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info cards */}
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-sky-50 rounded-2xl p-5 text-center">
              <Smile className="w-6 h-6 text-sky-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Maturidade Emocional</p>
              <p className="text-xs text-slate-400 mt-1">Pontos em reconhecimento de emoções</p>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-5 text-center">
              <Brain className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Raciocínio Intelectual</p>
              <p className="text-xs text-slate-400 mt-1">Pontos em desafios lógicos</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-5 text-center">
              <TrendingUp className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Nível</p>
              <p className="text-xs text-slate-400 mt-1">A cada 50 pontos, sobe um nível</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}