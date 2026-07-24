// ─────────────────────────────────────────────────────────────
// SELECT — desplegable propio, con la estética de silvIA.
//
// Por qué no <select>: el menú que abre lo dibuja el sistema operativo
// (no se puede estilar) y rompe el look. Este componente muestra un
// menú a medida, con la misma tipografía, colores y modo oscuro que el
// resto de la app, y opcionalmente un puntito de color por opción.
//
// El menú se renderiza en un <Popover> (portal) para que no lo recorte
// ningún `overflow-hidden` ni lo tape el blur de las tarjetas.
//
// API (pensada para reemplazar un <select> directo):
//   value      → valor actual (string)
//   onChange   → recibe el nuevo value
//   options    → [{ value, label, dot? }]  (dot = clase de color, opcional)
//   variant    → 'field' (input) | 'chip' (píldora compacta de estado)
//
// Accesible: rol listbox, navegación con flechas, Enter/Escape, y cierre
// al hacer click afuera.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import Popover from './Popover';
import { IconChevron, IconCheck } from './icons';

export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Seleccionar',
  className = '',
  variant = 'field',
  chipClass = '',
  ariaLabel,
  menuAlign = 'left',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [activo, setActivo] = useState(0); // índice resaltado por teclado
  const contenedor = useRef(null);
  const lista = useRef(null);

  const seleccionada = options.find((o) => o.value === value) || null;

  // Al abrir, arrancamos el resaltado en la opción actual.
  useEffect(() => {
    if (open) {
      const i = options.findIndex((o) => o.value === value);
      setActivo(i < 0 ? 0 : i);
    }
  }, [open, value, options]);

  // Mantenemos la opción resaltada a la vista al navegar con el teclado.
  useEffect(() => {
    if (!open || !lista.current) return;
    const el = lista.current.children[activo];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activo, open]);

  function elegir(v) {
    onChange(v);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActivo((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActivo((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActivo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActivo(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (options[activo]) elegir(options[activo].value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  }

  // Estilo del disparador según variante.
  const triggerBase =
    variant === 'chip'
      ? `inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg border text-xs font-semibold outline-none transition cursor-pointer ${chipClass}`
      : 'w-full inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-left outline-none transition cursor-pointer ' +
        'border-slate-300 bg-white text-slate-900 hover:border-slate-400 ' +
        'focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 ' +
        'dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-600';

  const etiqueta = seleccionada ? seleccionada.label : placeholder;

  return (
    <div ref={contenedor} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`${triggerBase} disabled:opacity-50 disabled:cursor-default`}
      >
        {/* Puntito de color de la opción actual. En la píldora de estado no
            hace falta: el color de fondo ya comunica el estado. */}
        {variant === 'field' && seleccionada?.dot && (
          <span className={`w-2 h-2 shrink-0 rounded-full ${seleccionada.dot}`} />
        )}
        <span
          className={`flex-1 ${variant === 'field' ? 'font-mono text-sm' : ''} ${
            seleccionada ? '' : variant === 'field' ? 'text-slate-400 dark:text-slate-500' : ''
          }`}
        >
          {etiqueta}
        </span>
        <IconChevron
          className={`w-4 h-4 shrink-0 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <Popover
        anchorRef={contenedor}
        open={open}
        onClose={() => setOpen(false)}
        align={menuAlign}
        minWidth={variant === 'chip' ? 160 : 'anchor'}
        className="pop-in"
      >
        <ul
          ref={lista}
          role="listbox"
          aria-label={ariaLabel}
          className="max-h-60 overflow-y-auto p-1.5 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40"
        >
          {options.map((o, i) => {
            const sel = o.value === value;
            const act = i === activo;
            return (
              <li key={o.value + o.label} role="option" aria-selected={sel}>
                <button
                  type="button"
                  onClick={() => elegir(o.value)}
                  onMouseEnter={() => setActivo(i)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-sm transition cursor-pointer ${
                    act ? 'bg-brand-50 dark:bg-brand-500/12' : ''
                  } ${sel ? 'text-brand-700 dark:text-brand-300 font-semibold' : 'text-slate-700 dark:text-slate-200'}`}
                >
                  {o.dot && <span className={`w-2 h-2 shrink-0 rounded-full ${o.dot}`} />}
                  <span className="flex-1 truncate">{o.label}</span>
                  {sel && <IconCheck className="w-4 h-4 shrink-0 text-brand-600 dark:text-brand-400" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Popover>
    </div>
  );
}
