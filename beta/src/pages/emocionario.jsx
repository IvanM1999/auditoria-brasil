import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/api/localApi";
import { fetchWithCache } from "@/lib/offlineCache";
import { X, Heart, Layers, Smile, Grid3x3 } from "lucide-react";
import EmotionMatrix from "@/components/EmotionMatrix";

export default function Emocionario() {
  const [emotions, setEmotions] = useState([]);
  const [combinations, setCombinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("emotions");

  useEffect(() => {
    Promise.all([
      fetchWithCache("emotions", () => api.entities.Emotion.list("name", 50)),
      fetchWithCache("combinations", () => api.entities.EmotionCombination.list("name", 50)),
    ])
      .then(([emos, combos]) => {
        setEmotions(emos || []);
        setCombinations(combos || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-sky-100 border-t-sky-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-center">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-800">
          Emocionário 🎭
        </h1>
        <p className="text-slate-500 mt-2">Toque em uma emoção para conhecê-la melhor</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-slate-100 rounded-2xl p-1">
          <button
            onClick={() => setTab("emotions")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === "emotions" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <Smile className="w-4 h-4" /> Emoções
          </button>
          <button
            onClick={() => setTab("combinations")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === "combinations" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <Layers className="w-4 h-4" /> Combinações
          </button>
          <button
            onClick={() => setTab("matrix")}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === "matrix" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"
            }`}
          >
            <Grid3x3 className="w-4 h-4" /> Matriz
          </button>
        </div>
      </div>

      {/* Emotions grid */}
      {tab === "emotions" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {emotions.map((emo, i) => (
            <motion.button
              key={emo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected({ ...emo, kind: "emotion" })}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-center"
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                className="text-4xl mb-2"
              >
                {emo.emoji}
              </motion.div>
              <p className="font-heading font-semibold text-slate-700">{emo.name}</p>
              <span className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                {emo.category === "basica" ? "básica" : "complexa"}
              </span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Combinations grid */}
      {tab === "combinations" && (
        <div className="space-y-4">
          <div className="bg-violet-50 rounded-2xl p-4 text-center">
            <p className="text-sm text-slate-600 leading-relaxed">
              Algumas pessoas autistas sentem as emoções básicas <strong>separadas, em fluxo</strong> —
              uma depois da outra, ou misturadas. Aqui estão as combinações mais comuns. 💜
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {combinations.map((combo, i) => (
              <motion.button
                key={combo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelected({ ...combo, kind: "combination" })}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm text-left"
              >
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {combo.emotion_names?.map((name, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 font-medium">
                      {name}
                    </span>
                  ))}
                </div>
                <h3 className="font-heading font-bold text-slate-700 text-lg">{combo.name}</h3>
                <p className="text-slate-500 text-sm mt-1 leading-relaxed line-clamp-2">{combo.description}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Matrix tab */}
      {tab === "matrix" && <EmotionMatrix emotions={emotions} combinations={combinations} />}

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  {selected.kind === "emotion" ? (
                    <span className="text-5xl">{selected.emoji}</span>
                  ) : (
                    <span className="text-4xl">🧬</span>
                  )}
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-800">{selected.name}</h2>
                    {selected.kind === "emotion" ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {selected.category === "basica" ? "emoção básica" : "emoção complexa"}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">
                        combinação
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selected.kind === "combination" && selected.emotion_names?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selected.emotion_names.map((name, idx) => (
                    <span key={idx} className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">O que é</p>
                  <p className="text-slate-600 leading-relaxed">{selected.description}</p>
                </div>
                {selected.kind === "combination" && selected.why_it_happens && (
                  <div className="bg-violet-50 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide mb-1">
                      Por que acontece
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed">{selected.why_it_happens}</p>
                  </div>
                )}
                {selected.body_signal && (
                  <div className="bg-sky-50 rounded-2xl p-4">
                    <p className="text-xs font-semibold text-sky-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Sinais no corpo
                    </p>
                    <p className="text-slate-600 text-sm leading-relaxed">{selected.body_signal}</p>
                  </div>
                )}
                {selected.examples && (
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Quando acontece</p>
                    <p className="text-slate-600 text-sm leading-relaxed">{selected.examples}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}