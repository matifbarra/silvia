// ─────────────────────────────────────────────────────────────
// CONFIRM DIALOG — el cartelito que reemplaza a window.confirm().
//
// window.confirm() lo dibuja el navegador (no se puede estilar) y corta
// la estética. Este es un modal propio, con el look de silvIA, que se
// maneja por promesa desde useConfirm() (ver ConfirmProvider).
//
// Accesible: role="alertdialog", foco al botón de acción al abrir,
// Escape = cancelar, Enter confirma (el botón enfocado), y click en el
// fondo cancela.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { IconAlertTriangle } from './icons';

export default function ConfirmDialog({
  title = '¿Confirmás?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'danger', // 'danger' (rojo) | 'brand' (índigo)
  onConfirm,
  onCancel,
}) {
  const botonConfirmar = useRef(null);

  // Al abrir, enfocamos la acción principal y cerramos con Escape.
  useEffect(() => {
    botonConfirmar.current?.focus();
    function onKey(e) {
      if (e.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const esDanger = tone === 'danger';
  const chip = esDanger
    ? 'bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400'
    : 'bg-brand-50 text-brand-600 dark:bg-brand-500/12 dark:text-brand-400';
  const botonAccion = esDanger
    ? 'bg-red-600 hover:bg-red-700 shadow-red-600/25'
    : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/25';

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-slate-950/70 backdrop-blur-sm fade-in"
      onClick={onCancel}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={message ? 'confirm-desc' : undefined}
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 p-6 pop-in"
      >
        <div className="flex gap-4">
          <span className={`grid place-items-center w-11 h-11 shrink-0 rounded-xl ${chip}`}>
            <IconAlertTriangle className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <h3 id="confirm-title" className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h3>
            {message && (
              <p id="confirm-desc" className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            ref={botonConfirmar}
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl text-white shadow-lg transition active:scale-[.98] cursor-pointer ${botonAccion}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
