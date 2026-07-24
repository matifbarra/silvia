// ─────────────────────────────────────────────────────────────
// CHECKBOX — casilla propia, con la estética de silvIA.
//
// En vez de dibujar un control nuevo (que rompería la asociación con
// <label>), mantenemos el <input type="checkbox"> REAL pero le sacamos
// el look nativo (appearance-none) y pintamos la caja con Tailwind. El
// tilde es un ícono que aparece con `peer-checked`. Así sigue siendo
// 100% accesible y clickeable desde su label.
// ─────────────────────────────────────────────────────────────

import { IconCheck } from './icons';

export default function Checkbox({
  checked,
  onChange,
  disabled = false,
  size = 'w-5 h-5',
  className = '',
  ariaLabel,
}) {
  return (
    <span className={`relative inline-grid place-items-center shrink-0 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`peer appearance-none ${size} rounded-md border-2 border-slate-300 bg-white cursor-pointer transition
          hover:border-brand-400
          checked:bg-brand-600 checked:border-brand-600
          focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25
          disabled:opacity-50 disabled:cursor-default
          dark:border-slate-600 dark:bg-slate-900 dark:checked:bg-brand-500 dark:checked:border-brand-500`}
      />
      {/* El tilde: centrado sobre la caja, aparece cuando está marcada. */}
      <IconCheck className="pointer-events-none absolute w-3.5 h-3.5 text-white opacity-0 scale-75 transition peer-checked:opacity-100 peer-checked:scale-100" />
    </span>
  );
}
