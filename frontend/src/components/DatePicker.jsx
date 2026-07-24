// ─────────────────────────────────────────────────────────────
// DATE PICKER — calendario propio, con la estética de silvIA.
//
// Por qué no <input type="date">: el calendario que abre es "chrome"
// del navegador (no se puede estilar) y rompe el look. Este componente
// habla el MISMO formato que el resto de la app: strings 'YYYY-MM-DD'
// (o '' para "sin fecha"), así que es un reemplazo directo del input.
//
// La semana arranca en lunes (convención local). Cierra al hacer click
// afuera o con Escape, y es navegable por teclado.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import Popover from './Popover';
import { IconCalendar, IconChevron, IconX } from './icons';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];

const pad = (n) => String(n).padStart(2, '0');
const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

// 'YYYY-MM-DD' → { y, m (0-based), d } o null. Parseamos a mano para no
// depender de la zona horaria (new Date('2026-07-24') se corre un día).
function parseISO(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return null;
  return { y, m: m - 1, d };
}

function formatoLindo(iso) {
  const p = parseISO(iso);
  if (!p) return '';
  return `${p.d} ${MESES_CORTO[p.m]} ${p.y}`;
}

export default function DatePicker({ value, onChange, className = '', placeholder = 'Sin fecha' }) {
  const [open, setOpen] = useState(false);
  const contenedor = useRef(null);

  const hoy = new Date();
  const isoHoy = toISO(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const sel = parseISO(value);

  // Mes que se está viendo. Arranca en el de la fecha elegida, o en el actual.
  const [vista, setVista] = useState({
    y: sel ? sel.y : hoy.getFullYear(),
    m: sel ? sel.m : hoy.getMonth(),
  });

  // Si el valor cambia desde afuera (ej: al abrir edición), reubicamos la vista.
  useEffect(() => {
    if (sel) setVista({ y: sel.y, m: sel.m });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function elegir(d) {
    onChange(toISO(vista.y, vista.m, d));
    setOpen(false);
  }

  function cambiarMes(delta) {
    setVista(({ y, m }) => {
      const nuevo = m + delta;
      if (nuevo < 0) return { y: y - 1, m: 11 };
      if (nuevo > 11) return { y: y + 1, m: 0 };
      return { y, m: nuevo };
    });
  }

  // Armamos la grilla del mes: huecos iniciales + días.
  const primerDia = new Date(vista.y, vista.m, 1).getDay(); // 0=domingo
  const offset = (primerDia + 6) % 7; // corremos para que lunes sea 0
  const diasEnMes = new Date(vista.y, vista.m + 1, 0).getDate();
  const celdas = [...Array(offset).fill(null), ...Array.from({ length: diasEnMes }, (_, i) => i + 1)];

  const trigger =
    'w-full inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-left outline-none transition cursor-pointer ' +
    'border-slate-300 bg-white text-slate-900 hover:border-slate-400 ' +
    'focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 ' +
    'dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:hover:border-slate-600';

  return (
    <div ref={contenedor} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={trigger}
      >
        <IconCalendar className="w-4 h-4 shrink-0 text-slate-400" />
        <span className={`flex-1 font-mono text-sm ${sel ? '' : 'text-slate-400 dark:text-slate-500'}`}>
          {sel ? formatoLindo(value) : placeholder}
        </span>
        {sel && (
          // Limpiar la fecha (volver a "sin fecha"). role span para no anidar
          // <button> dentro de <button>: usamos un div clickeable accesible.
          <span
            role="button"
            tabIndex={0}
            aria-label="Quitar fecha"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onChange('');
              }
            }}
            className="grid place-items-center w-5 h-5 rounded text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <IconX className="w-3.5 h-3.5" />
          </span>
        )}
      </button>

      <Popover
        anchorRef={contenedor}
        open={open}
        onClose={() => setOpen(false)}
        align="left"
        minWidth={272}
        className="pop-in"
      >
        <div
          role="dialog"
          aria-label="Elegir fecha"
          className="w-[17rem] p-3 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40"
        >
          {/* Cabecera: mes + navegación */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
              {MESES[vista.m]} <span className="font-mono text-slate-400">{vista.y}</span>
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => cambiarMes(-1)}
                aria-label="Mes anterior"
                className="grid place-items-center w-7 h-7 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <IconChevron className="w-4 h-4 rotate-90" />
              </button>
              <button
                type="button"
                onClick={() => cambiarMes(1)}
                aria-label="Mes siguiente"
                className="grid place-items-center w-7 h-7 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <IconChevron className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>

          {/* Encabezado de días (lunes a domingo) */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DIAS.map((d) => (
              <span key={d} className="grid place-items-center h-7 font-mono text-[11px] font-medium text-slate-400 dark:text-slate-600">
                {d}
              </span>
            ))}
          </div>

          {/* Grilla de días */}
          <div className="grid grid-cols-7 gap-1">
            {celdas.map((d, i) => {
              if (d === null) return <span key={`x${i}`} />;
              const iso = toISO(vista.y, vista.m, d);
              const esSel = value === iso;
              const esHoy = iso === isoHoy;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => elegir(d)}
                  aria-label={`${d} de ${MESES[vista.m]} de ${vista.y}`}
                  aria-pressed={esSel}
                  className={`grid place-items-center h-8 rounded-lg font-mono text-sm transition cursor-pointer ${
                    esSel
                      ? 'bg-brand-600 text-white font-semibold shadow-sm shadow-brand-600/30'
                      : esHoy
                        ? 'text-brand-600 dark:text-brand-400 font-semibold ring-1 ring-inset ring-brand-300 dark:ring-brand-500/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          {/* Pie: atajo a hoy */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                onChange(isoHoy);
                setOpen(false);
              }}
              className="font-mono text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
            >
              hoy
            </button>
            {sel && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="font-mono text-xs font-medium text-slate-500 hover:text-red-500 dark:text-slate-400 transition cursor-pointer"
              >
                limpiar
              </button>
            )}
          </div>
        </div>
      </Popover>
    </div>
  );
}
