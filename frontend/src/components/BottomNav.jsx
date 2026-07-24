// ─────────────────────────────────────────────────────────────
// BARRA DE TABS INFERIOR (solo mobile)
//
// Por qué abajo: en un celular el pulgar llega cómodo a la zona
// inferior de la pantalla. Por eso Instagram, Spotify o WhatsApp ponen
// ahí la navegación principal. Además libera el header.
//
// En desktop no se muestra (sm:hidden): ahí la nav del header alcanza.
// La pestaña activa levanta una "píldora" de marca que anima al entrar.
// ─────────────────────────────────────────────────────────────

import { NavLink } from 'react-router-dom';
import { IconChart, IconBook, IconClipboard, IconRoute } from './icons';

// `end` solo en "/" para que Resumen no quede marcado como activo
// estando en /materias (que también empieza con "/").
const TABS = [
  { to: '/', label: 'resumen', Icon: IconChart, end: true },
  { to: '/materias', label: 'materias', Icon: IconBook },
  { to: '/tareas', label: 'tareas', Icon: IconClipboard },
  { to: '/carrera', label: 'carrera', Icon: IconRoute },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      // pb-[env(safe-area-inset-bottom)]: en iPhone sin botón de inicio hay
      // una barra de gestos abajo. Ese padding evita que los tabs queden
      // tapados. Requiere viewport-fit=cover en el HTML.
      className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              // NavLink pone aria-current="page" solo en el activo, así un
              // lector de pantalla anuncia dónde estás parado.
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 h-16 font-mono text-[10px] font-medium transition cursor-pointer ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid place-items-center w-12 h-7 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-500/15 scale-100'
                        : 'scale-95'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
