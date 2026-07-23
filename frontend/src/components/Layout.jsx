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
import ThemeToggle from './ThemeToggle';
import { IconBook, IconLogout } from './icons';

export default function Layout() {
  const { user, logout } = useAuth();

  // Función que decide las clases del link según si está activo.
  // El padding es más chico en mobile: con 4 secciones, la nav ya no
  // entraba en 375px y hacía que la página scrollease de costado.
  const linkClass = ({ isActive }) =>
    `px-2 sm:px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
      isActive
        ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen">
      {/* Header sticky con leve blur al hacer scroll (se ve premium) */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
        <div className="max-w-5xl mx-auto px-4 h-16 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Logo: ícono en un cuadrado violeta + wordmark.
                En mobile mostramos solo el ícono para ganar el espacio
                que necesita la nav (patrón habitual en apps con varias
                secciones: la marca se reduce a su símbolo). */}
            <div className="flex items-center gap-2">
              <span className="grid place-items-center w-8 h-8 shrink-0 rounded-lg bg-violet-600 text-white shadow-sm">
                <IconBook className="w-5 h-5" />
              </span>
              <span className="hidden sm:inline text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                silv<span className="text-violet-600 dark:text-violet-400">IA</span>
              </span>
            </div>
            <nav className="flex items-center gap-0.5 sm:gap-1">
              <NavLink to="/" end className={linkClass}>
                Resumen
              </NavLink>
              <NavLink to="/materias" className={linkClass}>
                Materias
              </NavLink>
              <NavLink to="/tareas" className={linkClass}>
                Tareas
              </NavLink>
              <NavLink to="/carrera" className={linkClass}>
                Carrera
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden sm:inline text-sm text-slate-500 dark:text-slate-400">
              Hola, <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
            </span>
            <ThemeToggle />
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition cursor-pointer"
            >
              <IconLogout className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
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
