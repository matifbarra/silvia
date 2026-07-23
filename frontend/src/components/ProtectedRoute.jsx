// ─────────────────────────────────────────────────────────────
// PROTECTED ROUTE (el "portero")
// Envuelve páginas privadas. Si no hay usuario logueado, redirige
// al login. Mientras verificamos la sesión, muestra "Cargando...".
// ─────────────────────────────────────────────────────────────

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Todavía estamos verificando si había sesión → esperamos
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Cargando...
      </div>
    );
  }

  // No hay usuario → afuera, al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Hay usuario → mostramos la página protegida
  return children;
}
