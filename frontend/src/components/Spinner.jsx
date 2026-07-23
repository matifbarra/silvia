// ─────────────────────────────────────────────────────────────
// SPINNER (indicador de carga reutilizable)
// Un círculo que gira, hecho solo con clases de Tailwind:
// animate-spin + un borde con un lado transparente.
// ─────────────────────────────────────────────────────────────

export default function Spinner({ label = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-500 dark:text-slate-400">
      <span className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-violet-600 dark:border-slate-700 dark:border-t-violet-400 animate-spin" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
