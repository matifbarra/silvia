// ─────────────────────────────────────────────────────────────
// SPINNER (indicador de carga reutilizable)
// Un círculo que gira + un texto en mono con caret parpadeante, como
// un proceso corriendo en una terminal. El label lo pasa cada página.
// ─────────────────────────────────────────────────────────────

export default function Spinner({ label = 'cargando' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500 dark:text-slate-400">
      <span className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-brand-600 dark:border-slate-700 dark:border-t-brand-400 animate-spin" />
      <span className="font-mono text-sm">
        {label}
        <span className="caret">_</span>
      </span>
    </div>
  );
}
