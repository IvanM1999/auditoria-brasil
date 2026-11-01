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
import Home from '@/pages/Home';
import Gabarito from '@/pages/Gabarito';
import Candidatos from '@/pages/Candidatos';
import Politicos from '@/pages/Politicos';
import PoliticoPerfil from '@/pages/PoliticoPerfil';
import Partidos from '@/pages/Partidos';
import PartidoPerfil from '@/pages/PartidoPerfil';
import Historia from '@/pages/História';
import HistoriaFicha from '@/pages/HistoriaFicha';
import Educacao from '@/pages/Educacao';
import Documentacao from '@/pages/Documentacao';
import Avaliacao from '@/pages/Avaliacao';
import Comparar from '@/pages/Comparar';
import DossiêVoto from '@/pages/DossiêVoto';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
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