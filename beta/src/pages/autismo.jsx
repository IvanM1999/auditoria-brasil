import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/api/localApi";
import { fetchWithCache } from "@/lib/offlineCache";
import { Puzzle, Search, Layers, Compass, Heart, Brain, Briefcase, UserCheck, BookOpen, ArrowRight } from "lucide-react";

const topics = [
  {
    icon: Layers,
    color: "bg-sky-50 text-sky-500",
    title: "Os 3 níveis de suporte",
    desc: "O autismo é classificado em níveis 1, 2 e 3 conforme o grau de suporte necessário — não é 'mais ou menos autista'.",
  },
  {
    icon: Puzzle,
    color: "bg-violet-50 text-violet-500",
    title: "O autismo nunca vem sozinho",
    desc: "TDAH, ansiedade, TOC, dislexia e outras condições costumam acompanhar o autismo. São comorbidades, não coincidências.",
  },
  {
    icon: Search,
    color: "bg-emerald-50 text-emerald-500",
    title: "Diagnóstico tardio",
    desc: "Muitos adultos descobrem o autismo tarde. Não é tarde demais — entender a si muda tudo.",
  },
  {
    icon: Brain,
    color: "bg-amber-50 text-amber-500",
    title: "Facetas do autismo",
    desc: "Hiperfoco, sensibilidade sensorial, pensamento em detalhes, honestidade — o autismo tem muitas faces.",
  },
  {
    icon: Compass,
    color: "bg-rose-50 text-rose-500",
    title: "Bússola moral",
    desc: "Muitas pessoas autistas têm um senso forte de justiça e ética — uma bússola moral afiada.",
  },
  {
    icon: Heart,
    color: "bg-teal-50 text-teal-500",
    title: "Apoio e enfrentamento",
    desc: "Estratégias, rotinas, terapias e autoconhecimento para lidar com os desafios do dia a dia.",
  },
  {
    icon: Briefcase,
    color: "bg-indigo-50 text-indigo-500",
    title: "No trabalho: para empregadores",
    desc: "Como entender, apoiar e aproveitar o potencial do funcionário autista.",
  },
  {
    icon: UserCheck,
    color: "bg-cyan-50 text-cyan-500",
    title: "No trabalho: seus direitos",
    desc: "Direitos, adaptações e como se ajustar ao novo cenário de vida e trabalho.",
  },
];

const relatedCategories = ["autismo", "diagnostico", "vida_adulta", "trabalho"];

export default function Autismo() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithCache("blogposts", () => api.entities.BlogPost.list("-created_date", 50))
      .then((all) => setPosts((all || []).filter((p) => relatedCategories.includes(p.category))))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 text-center">
        <Puzzle className="w-10 h-10 text-violet-400 mx-auto mb-3" />
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-800">Autismo 🧩</h1>
        <p className="text-slate-500 mt-2 max-w-lg mx-auto">
          Um espaço para entender o espectro, o diagnóstico e a vida adulta — sem preconceito.
        </p>
      </motion.div>

      {/* Clarification banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sky-50 border border-sky-100 rounded-2xl p-5 mb-8"
      >
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong className="text-sky-700">Importante:</strong> o autismo não é síndrome de Down, não é
          doença mental, não é deficiência intelectual e não tem cura — porque não é uma doença. É uma
          condição neurológica, uma forma diferente de o cérebro funcionar. 💙
        </p>
      </motion.div>

      {/* Topic cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {topics.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm"
            >
              <div className={`w-11 h-11 rounded-2xl ${t.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-700">{t.title}</h3>
              <p className="text-slate-500 text-sm mt-1 leading-relaxed">{t.desc}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Related articles */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-slate-400" />
        <h2 className="font-heading text-lg font-bold text-slate-700">Artigos relacionados</h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-7 h-7 border-4 border-violet-100 border-t-violet-400 rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-center text-slate-400 py-8 text-sm">Nenhum artigo ainda.</p>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <motion.a
              key={post.id}
              href="/blog"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-slate-700 truncate">{post.title}</h3>
                <p className="text-slate-400 text-xs mt-0.5 truncate">{post.excerpt}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 ml-3" />
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}