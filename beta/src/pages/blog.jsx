import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/api/localApi";
import { fetchWithCache, isOnline } from "@/lib/offlineCache";
import { BookOpen, ArrowLeft, Clock, WifiOff, Volume2, Pause, Square } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { Link } from "react-router-dom";

const categoryLabels = {
  autismo: "Autismo",
  emocoes: "Emoções",
  dicas: "Dicas",
  diagnostico: "Diagnóstico",
  vida_adulta: "Vida Adulta",
  trabalho: "Trabalho",
};

const categoryColors = {
  autismo: "bg-sky-50 text-sky-600",
  emocoes: "bg-emerald-50 text-emerald-600",
  dicas: "bg-violet-50 text-violet-600",
  diagnostico: "bg-amber-50 text-amber-600",
  vida_adulta: "bg-rose-50 text-rose-600",
  trabalho: "bg-indigo-50 text-indigo-600",
};

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [offline, setOffline] = useState(!isOnline());
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const articleText = selected && [selected.title, selected.excerpt, selected.content]
    .filter(Boolean)
    .join(". ")
    .replace(/[#*_>`\[\]()]/g, "");

  const speakArticle = () => {
    if (!window.speechSynthesis || !articleText) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(articleText);
    utterance.lang = "pt-BR";
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const pauseArticle = () => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      setIsSpeaking(false);
    }
  };

  const stopArticle = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  useEffect(() => {
    fetchWithCache("blogposts", () => api.entities.BlogPost.list("-created_date", 50))
      .then((data) => setPosts(data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? posts : posts.filter((p) => p.category === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-violet-100 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Article view
  if (selected) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao blog
        </button>

        <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[selected.category]}`}>
            {categoryLabels[selected.category]}
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-800 mt-4 leading-tight">
            {selected.title}
          </h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-slate-400">
            <span>{selected.author}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {selected.read_time}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-5" aria-label="Leitura do artigo">
            <button
              type="button"
              onClick={speakArticle}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-100 px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-200"
              disabled={!window.speechSynthesis}
            >
              <Volume2 className="w-4 h-4" /> Ouvir artigo
            </button>
            {isSpeaking && (
              <button type="button" onClick={pauseArticle} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
                <Pause className="w-4 h-4" /> Pausar
              </button>
            )}
            <button type="button" onClick={stopArticle} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200">
              <Square className="w-4 h-4" /> Parar
            </button>
          </div>
          {selected.excerpt && (
            <p className="text-slate-500 mt-4 text-lg leading-relaxed italic">{selected.excerpt}</p>
          )}
          <div className="mt-6">
            <MarkdownRenderer content={selected.content} />
          </div>
          {selected.title?.toLowerCase().includes("burnout") && (
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-semibold text-amber-900">Precisa de apoio para organizar o próximo passo?</p>
              <p className="text-sm text-amber-800 mt-1 leading-relaxed">A área beta reúne fontes verificadas, encaminhamentos e uma conversa guiada local. Ela não substitui atendimento profissional.</p>
              <Link to="/apoio-burnout" className="inline-flex mt-4 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Abrir apoio para burnout</Link>
            </div>
          )}
        </article>
      </motion.div>
    );
  }

  // List view
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 text-center">
        <BookOpen className="w-10 h-10 text-violet-400 mx-auto mb-3" />
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-800">Blog 📚</h1>
        <p className="text-slate-500 mt-2">Histórias e conhecimento sobre autismo e emoções</p>
      </motion.div>

      {offline && (
        <div className="flex items-center justify-center gap-2 bg-amber-50 text-amber-600 text-xs font-medium rounded-xl py-2 mb-4">
          <WifiOff className="w-3.5 h-3.5" /> Modo offline — lendo conteúdo salvo no dispositivo
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
            filter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          Todos
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              filter === key ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-400 py-12">Nenhum artigo nesta categoria.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((post, i) => (
            <motion.button
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => setSelected(post)}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-left"
            >
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${categoryColors[post.category]}`}>
                {categoryLabels[post.category]}
              </span>
              <h3 className="font-heading font-bold text-slate-700 text-lg mt-3 leading-snug">{post.title}</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center gap-3 mt-4 text-xs text-slate-400">
                <span>{post.author}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.read_time}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}