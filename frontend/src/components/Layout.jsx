// ─────────────────────────────────────────────────────────────
// LAYOUT (estructura compartida)
// La barra superior + navegación que aparece en TODAS las páginas
// privadas. <Outlet /> es el "hueco" donde React Router inserta la
// página actual. Así no repetimos el header.
//
// Estética "dev tool": el wordmark se presenta como un prompt de
// terminal y la nav usa etiquetas monoespaciadas, como las pestañas
// de un editor.
// ─────────────────────────────────────────────────────────────

import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import BottomNav from './BottomNav';
import { IconTerminal, IconLogout } from './icons';

export default function Layout() {
  const { user, logout } = useAuth();

  // Clases del link según si su ruta está activa. La pestaña activa se
  // "enciende" en la marca; las demás quedan apagadas y aclaran al hover.
  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 rounded-lg font-mono text-[13px] font-medium transition cursor-pointer ${
      isActive
        ? 'text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-500/12'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/70'
    }`;

  return (
    <div className="min-h-screen">
      {/* Header sticky con blur: la "barra de herramientas" de la app. */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          <div className="flex items-center gap-2 sm:gap-6">
            {/* Logo: prompt de terminal en un cuadrado de marca + wordmark */}
            <div className="flex items-center gap-2.5">
              <span className="grid place-items-center w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-600/25">
                <IconTerminal className="w-5 h-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                silv<span className="text-brand-600 dark:text-brand-400">IA</span>
              </span>
            </div>
            {/* En mobile esta nav se oculta: la reemplaza <BottomNav /> */}
            <nav className="hidden sm:flex items-center gap-1">
              <NavLink to="/" end className={linkClass}>
                resumen
              </NavLink>
              <NavLink to="/materias" className={linkClass}>
                materias
              </NavLink>
              <NavLink to="/tareas" className={linkClass}>
                tareas
              </NavLink>
              <NavLink to="/carrera" className={linkClass}>
                carrera
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="hidden sm:inline text-sm text-slate-500 dark:text-slate-400">
              <span className="font-mono text-slate-400 dark:text-slate-600">~/</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{user.name}</span>
            </span>
            <ThemeToggle />
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition cursor-pointer"
            >
              <IconLogout className="w-4 h-4" />
              <span className="hidden sm:inline">salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* pb-28 en mobile: la barra de tabs es "fixed" y flota sobre el
          contenido. Sin ese espacio, la última tarjeta quedaría tapada. */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-28 sm:pb-12">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
