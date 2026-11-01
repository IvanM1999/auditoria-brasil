import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, Building2, BookOpen, FileText, Menu, X, Map } from "lucide-react";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/politicos", label: "Políticos", icon: Users },
  { to: "/partidos", label: "Partidos", icon: Building2 },
  { to: "/historia", label: "História", icon: BookOpen },
  { to: "/candidatos", label: "Candidatos", icon: Map },
  { to: "/documentacao", label: "Documentação", icon: FileText },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-9 h-9 rounded-sm bg-accent flex items-center justify-center text-accent-foreground text-lg shadow-sm"
            >
              AV
            </motion.div>
            <span className="font-display font-bold text-foreground text-lg tracking-tight">
              AuditVoto
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
                    active ? "text-accent" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="navActive"
                      className="absolute inset-0 bg-accent/10 rounded-sm -z-10"
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
            className="md:hidden p-2 rounded-sm text-muted-foreground hover:bg-muted"
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
              className="md:hidden overflow-hidden border-t border-border bg-background"
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
                        active ? "bg-accent/10 text-accent" : "text-muted-foreground"
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
      <main className="w-full px-0 py-0">
        <Outlet />
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted-foreground">
          <p>AuditVoto · Transparência política com fontes verificáveis</p>
          <p className="mt-1 text-xs">Confira os registros nas fontes oficiais antes de tomar decisões.</p>
        </div>
      </footer>
    </div>
  );
}