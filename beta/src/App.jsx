import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

const Home = lazy(() => import('@/pages/Home'));
const Gabarito = lazy(() => import('@/pages/Gabarito'));
const Candidatos = lazy(() => import('@/pages/Candidatos'));
const Politicos = lazy(() => import('@/pages/Politicos'));
const PoliticoPerfil = lazy(() => import('@/pages/PoliticoPerfil'));
const Partidos = lazy(() => import('@/pages/Partidos'));
const PartidoPerfil = lazy(() => import('@/pages/PartidoPerfil'));
const Historia = lazy(() => import('@/pages/História'));
const HistoriaFicha = lazy(() => import('@/pages/HistoriaFicha'));
const Educacao = lazy(() => import('@/pages/Educacao'));
const Documentacao = lazy(() => import('@/pages/Documentacao'));
const Avaliacao = lazy(() => import('@/pages/Avaliacao'));
const Comparar = lazy(() => import('@/pages/Comparar'));
const DossiêVoto = lazy(() => import('@/pages/DossiêVoto'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center" role="status" aria-label="Carregando página">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    }>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/politicos" element={<Politicos />} />
          <Route path="/politicos/:id" element={<PoliticoPerfil />} />
          <Route path="/partidos" element={<Partidos />} />
          <Route path="/partidos/:sigla" element={<PartidoPerfil />} />
          <Route path="/historia" element={<Historia />} />
          <Route path="/historia/:id" element={<HistoriaFicha />} />
          <Route path="/educacao" element={<Educacao />} />
          <Route path="/documentacao" element={<Documentacao />} />
          <Route path="/candidato/:id" element={<PoliticoPerfil />} />
          <Route path="/gabarito" element={<Gabarito />} />
          <Route path="/candidatos" element={<Candidatos />} />
          <Route path="/comparar" element={<Comparar />} />
          <Route path="/meu-dossie" element={<DossiêVoto />} />
          <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
            <Route path="/avaliar/:id" element={<Avaliacao />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App