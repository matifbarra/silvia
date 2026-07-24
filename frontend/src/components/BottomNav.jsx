// ─────────────────────────────────────────────────────────────
// BARRA DE TABS INFERIOR (solo mobile)
//
// Por qué abajo: en un celular el pulgar llega cómodo a la zona
// inferior de la pantalla y no al borde de arriba. Por eso Instagram,
// Spotify o WhatsApp ponen ahí la navegación principal. Además nos
// libera el header, que con 4 secciones ya no daba abasto.
//
// En desktop no se muestra (sm:hidden): ahí sobra ancho y la nav del
// header funciona bien. Es la misma app con dos navegaciones según
// el tamaño de pantalla, no dos apps distintas.
// ─────────────────────────────────────────────────────────────

import { NavLink } from 'react-router-dom';
import { IconChart, IconBook, IconClipboard, IconRoute } from './icons';

// `end` solo en "/" para que Resumen no quede marcado como activo
// estando en /materias (que también empieza con "/").
const TABS = [
  { to: '/', label: 'Resumen', Icon: IconChart, end: true },
  { to: '/materias', label: 'Materias', Icon: IconBook },
  { to: '/tareas', label: 'Tareas', Icon: IconClipboard },
  { to: '/carrera', label: 'Carrera', Icon: IconRoute },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Navegación principal"
      // pb-[env(safe-area-inset-bottom)]: en los iPhone sin botón de
      // inicio hay una barra de gestos abajo. Ese padding evita que
      // los tabs queden tapados. Requiere viewport-fit=cover en el HTML.
      className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              // NavLink pone aria-current="page" solo en el activo,
              // así un lector de pantalla anuncia dónde estás parado.
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 h-16 text-[11px] font-semibold transition cursor-pointer ${
                  isActive
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-slate-400 dark:text-slate-500 active:text-slate-600 dark:active:text-slate-300'
                }`
              }
            >
              {/* NavLink acepta una función como hijo para saber si está
                  activo y poder estilar también el ícono, no solo el link */}
              {({ isActive }) => (
                <>
                  <span
                    className={`grid place-items-center w-12 h-7 rounded-full transition ${
                      isActive ? 'bg-violet-50 dark:bg-violet-500/15' : ''
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
