import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function EmotionMatrix({ emotions, combinations }) {
  const [selected, setSelected] = useState(null);

  const basics = useMemo(
    () => emotions.filter((e) => e.category === "basica").slice(0, 6),
    [emotions]
  );

  const comboMap = useMemo(() => {
    const map = {};
    (combinations || []).forEach((c) => {
      const names = c.emotion_names || [];
      if (names.length >= 2) {
        const key = [names[0], names[1]].sort().join("||");
        map[key] = c;
      }
    });
    return map;
  }, [combinations]);

  const getCombo = (a, b) => comboMap[[a, b].sort().join("||")];

  return (
    <div>
      <div className="bg-emerald-50 rounded-2xl p-4 text-center mb-5">
        <p className="text-sm text-slate-600 leading-relaxed">
          A matriz mostra como emoções básicas se combinam. Toque em uma célula <span className="font-semibold">✨</span> para ver a combinação. 🟢
        </p>
      </div>

      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div
          className="inline-grid gap-1"
          style={{ gridTemplateColumns: `auto repeat(${basics.length}, minmax(44px, 1fr))` }}
        >
          {/* Header row */}
          <div />
          {basics.map((e) => (
            <div key={e.id} className="text-center text-lg pb-1" title={e.name}>
              {e.emoji}
            </div>
          ))}
          {/* Body rows */}
          {basics.map((rowEmo) => (
            <React.Fragment key={rowEmo.id}>
              <div className="text-lg pr-1 flex items-center justify-end" title={rowEmo.name}>
                {rowEmo.emoji}
              </div>
              {basics.map((colEmo) => {
                const isDiag = rowEmo.id === colEmo.id;
                const combo = getCombo(rowEmo.name, colEmo.name);
                return (
                  <button
                    key={colEmo.id}
                    onClick={() => combo && setSelected(combo)}
                    disabled={!combo && !isDiag}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${
                      isDiag
                        ? "bg-slate-100 cursor-default"
                        : combo
                        ? "bg-emerald-100 hover:bg-emerald-200 cursor-pointer"
                        : "bg-slate-50 cursor-default"
                    }`}
                  >
                    {isDiag ? "" : combo ? "✨" : ""}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Diagonal = a própria emoção · ✨ = combinação disponível
      </p>

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
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selected.emotion_names?.map((n, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 font-medium">
                        {n}
                      </span>
                    ))}
                  </div>
                  <h2 className="font-heading text-xl font-bold text-slate-800">{selected.name}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">{selected.description}</p>
              {selected.why_it_happens && (
                <div className="bg-violet-50 rounded-2xl p-4 mt-3">
                  <p className="text-xs font-semibold text-violet-400 uppercase mb-1">Por que acontece</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{selected.why_it_happens}</p>
                </div>
              )}
              {selected.body_signal && (
                <div className="bg-sky-50 rounded-2xl p-4 mt-3">
                  <p className="text-xs font-semibold text-sky-400 uppercase mb-1">Sinais no corpo</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{selected.body_signal}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}