// ─────────────────────────────────────────────────────────────
// SPINNER (indicador de carga reutilizable)
// Un círculo que gira, hecho solo con clases de Tailwind:
// animate-spin + un borde con un lado transparente.
// ─────────────────────────────────────────────────────────────

export default function Spinner({ label = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-slate-500">
      <span className="w-6 h-6 rounded-full border-2 border-slate-300 border-t-indigo-600 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
