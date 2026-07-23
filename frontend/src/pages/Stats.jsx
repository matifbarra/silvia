// ─────────────────────────────────────────────────────────────
// PÁGINA RESUMEN (estadísticas)
// - Tarjetas con los números clave (materias, pendientes, etc.)
// - Barra de progreso general (% de tareas hechas)
// - "Gráfico" de barras de tareas por materia, hecho con divs y
//   anchos en % (no hace falta ninguna librería de gráficos).
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../api/stats';
import { SUBJECT_COLORS } from '../constants/colors';
import Spinner from '../components/Spinner';

// Tarjeta de número reutilizable
function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-5 transition hover:shadow-md">
      <p className={`text-4xl font-extrabold tracking-tight ${accent || 'text-slate-800 dark:text-slate-100'}`}>
        {value}
      </p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Error cargando estadísticas', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Spinner label="Cargando resumen..." />;
  }

  if (!stats) {
    return <p className="text-red-500">No se pudo cargar el resumen.</p>;
  }

  // El máximo de tareas en una materia, para escalar las barras del gráfico
  const maxTasks = Math.max(1, ...stats.perSubject.map((s) => s.total));

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Resumen</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">Tu progreso de estudio de un vistazo.</p>

      {/* Tarjetas de números */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Materias" value={stats.totalSubjects} accent="text-violet-600 dark:text-violet-400" />
        <StatCard label="Tareas pendientes" value={stats.pendingTasks} accent="text-amber-600 dark:text-amber-400" />
        <StatCard label="Tareas hechas" value={stats.doneTasks} accent="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Vencidas" value={stats.overdueTasks} accent="text-red-600 dark:text-red-400" />
      </div>

      {/* Barra de progreso general */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Progreso general</h3>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {stats.doneTasks}/{stats.totalTasks} tareas · {stats.progress}%
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-violet-600 rounded-full transition-all duration-700"
            style={{ width: `${stats.progress}%` }}
          />
        </div>
      </div>

      {/* Gráfico: tareas por materia */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-6">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Tareas por materia</h3>

        {stats.perSubject.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Todavía no tenés materias.{' '}
            <Link to="/materias" className="text-violet-600 dark:text-violet-400 font-medium hover:underline">
              Creá la primera
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-3.5">
            {stats.perSubject.map((s) => {
              const c = SUBJECT_COLORS[s.color] || SUBJECT_COLORS.indigo;
              const widthPct = (s.total / maxTasks) * 100;
              return (
                <div key={s.subjectId} className="flex items-center gap-3">
                  {/* Nombre de la materia */}
                  <span className="w-28 sm:w-40 shrink-0 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {s.name}
                  </span>

                  {/* Barra */}
                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700/60 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${c.dot} rounded-lg transition-all duration-700`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>

                  {/* Conteo hechas/total */}
                  <span className="w-14 shrink-0 text-right text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                    {s.done}/{s.total}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
