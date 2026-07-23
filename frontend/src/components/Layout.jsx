// ─────────────────────────────────────────────────────────────
// LAYOUT (estructura compartida)
// La barra superior + navegación que aparece en TODAS las páginas
// privadas. <Outlet /> es el "hueco" donde React Router inserta
// la página actual (Materias o Tareas). Así no repetimos el header.
//
// NavLink es como Link pero sabe si su ruta está activa, y nos deja
// darle un estilo distinto al link de la página en la que estamos.
// ─────────────────────────────────────────────────────────────

import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  // Función que decide las clases del link según si está activo
  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? 'bg-indigo-100 text-indigo-700'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
    }`;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          <div className="flex items-center gap-3 sm:gap-6">
            <h1 className="text-xl font-bold text-indigo-600">silvIA</h1>
            <nav className="flex items-center gap-1">
              <NavLink to="/" end className={linkClass}>
                Resumen
              </NavLink>
              <NavLink to="/materias" className={linkClass}>
                Materias
              </NavLink>
              <NavLink to="/tareas" className={linkClass}>
                Tareas
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-slate-600">Hola, {user.name} 👋</span>
            <button
              onClick={logout}
              className="text-sm text-slate-500 hover:text-red-600 transition whitespace-nowrap"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
