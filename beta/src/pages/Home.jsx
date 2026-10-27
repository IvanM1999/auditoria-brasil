import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Smile, Brain, BookOpen, Trophy, Puzzle, Heart, Eye, Sparkles } from "lucide-react";

const features = [
  {
    to: "/emocionario",
    icon: Smile,
    title: "Emocionário",
    desc: "Conheça cada emoção com exemplos e sinais do corpo",
    color: "from-sky-100 to-sky-50",
    iconColor: "text-sky-500",
  },
  {
    to: "/desafios",
    icon: Brain,
    title: "Desafios",
    desc: "Jogos de reconhecimento emocional e raciocínio",
    color: "from-emerald-100 to-emerald-50",
    iconColor: "text-emerald-500",
  },
  {
    to: "/blog",
    icon: BookOpen,
    title: "Blog",
    desc: "Artigos sobre autismo e doenças invisíveis",
    color: "from-violet-100 to-violet-50",
    iconColor: "text-violet-500",
  },
  {
    to: "/progresso",
    icon: Trophy,
    title: "Progresso",
    desc: "Veja sua pontuação e evolução",
    color: "from-amber-100 to-amber-50",
    iconColor: "text-amber-500",
  },
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center pt-6"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-block text-6xl mb-4"
        >
          🧩
        </motion.div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
          Bem-vindo ao Emocionário Amigo
        </h1>
        <p className="mt-3 text-slate-500 max-w-xl mx-auto leading-relaxed">
          Um espaço calmo e divertido para explorar emoções, aprender sobre o autismo
          e crescer no seu ritmo.
        </p>
      </motion.section>

      {/* Feature cards */}
      <section className="grid sm:grid-cols-2 gap-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
            >
              <Link to={f.to}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`bg-gradient-to-br ${f.color} rounded-3xl p-6 border border-white shadow-sm h-full`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center mb-4">
                    <Icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-heading font-bold text-slate-700 text-lg">{f.title}</h3>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed">{f.desc}</p>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </section>

      {/* O que é o autismo */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Puzzle className="w-5 h-5 text-sky-500" />
          <h2 className="font-heading text-xl font-bold text-slate-800">O que é o autismo?</h2>
        </div>
        <p className="text-slate-600 leading-relaxed">
          O autismo, ou Transtorno do Espectro Autista (TEA), é uma condição neurológica que
          afeta a forma como a pessoa percebe o mundo, se comunica e interage com os outros.
          Não é uma doença — é uma forma diferente de ser e de pensar. Pessoas autistas podem
          ter sensibilidades sensoriais, interesses profundos e formas únicas de aprender.
        </p>
        <p className="text-slate-600 leading-relaxed mt-3">
          Algumas condições, como o autismo, são chamadas de{" "}
          <span className="font-semibold text-slate-700">doenças invisíveis</span> porque não
          são visíveis a olho nu, mas afetam o dia a dia de quem as vive. Entender é o primeiro
          passo para acolher. 💙
        </p>
        <div className="grid sm:grid-cols-3 gap-3 mt-6">
          <div className="bg-sky-50 rounded-2xl p-4 text-center">
            <Eye className="w-6 h-6 text-sky-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">Percepção única do mundo</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center">
            <Heart className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">Sensibilidades sensoriais</p>
          </div>
          <div className="bg-violet-50 rounded-2xl p-4 text-center">
            <Sparkles className="w-6 h-6 text-violet-400 mx-auto mb-2" />
            <p className="text-xs text-slate-600 font-medium">Interesses profundos</p>
          </div>
        </div>
      </motion.section>
    </div>
  );
}