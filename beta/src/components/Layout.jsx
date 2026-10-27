import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Smile, Brain, BookOpen, Trophy, Menu, X, Puzzle } from "lucide-react";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/emocionario", label: "Emocionário", icon: Smile },
  { to: "/desafios", label: "Desafios", icon: Brain },
  { to: "/autismo", label: "Autismo", icon: Puzzle },
  { to: "/blog", label: "Blog", icon: BookOpen },
  { to: "/progresso", label: "Progresso", icon: Trophy },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50/40">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center text-white text-lg shadow-sm"
            >
              🧩
            </motion.div>
            <span className="font-heading font-bold text-slate-700 text-lg tracking-tight">
              Emocionário Amigo
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active ? "text-sky-700" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="navActive"
                      className="absolute inset-0 bg-sky-100/70 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-slate-100 bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const active = location.pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                        active ? "bg-sky-100 text-sky-700" : "text-slate-600"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-100 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-slate-400">
          <p>Emocionário Amigo · Um espaço calmo para entender emoções 🧩</p>
          <p className="mt-1 text-xs">Feito com carinho para mentes neurodivergentes</p>
        </div>
      </footer>
    </div>
  );
}