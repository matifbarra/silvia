// ─────────────────────────────────────────────────────────────
// PÁGINA RESUMEN (estadísticas) — el "readout" del sistema.
// - Una línea de estado tipo terminal con lo esencial.
// - Tarjetas KPI cuyos números se calculan en pantalla (count-up).
// - Barra de progreso que "compila" al montar.
// - Gráfico de barras de tareas por materia, hecho con divs y anchos
//   en % (no hace falta ninguna librería de gráficos).
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats } from '../api/stats';
import { SUBJECT_COLORS } from '../constants/colors';
import Spinner from '../components/Spinner';
import Meter from '../components/Meter';
import { useCountUp } from '../hooks/useCountUp';
import { IconBook, IconClipboard, IconCheck, IconZap } from '../components/icons';

// Config visual de cada KPI: ícono + color de acento del número.
const KPIS = [
  { key: 'totalSubjects', label: 'Materias', Icon: IconBook, accent: 'text-brand-600 dark:text-brand-400', chip: 'bg-brand-50 text-brand-600 dark:bg-brand-500/12 dark:text-brand-400' },
  { key: 'pendingTasks', label: 'Pendientes', Icon: IconClipboard, accent: 'text-amber-600 dark:text-amber-400', chip: 'bg-amber-50 text-amber-600 dark:bg-amber-500/12 dark:text-amber-400' },
  { key: 'doneTasks', label: 'Hechas', Icon: IconCheck, accent: 'text-mint-600 dark:text-mint-400', chip: 'bg-mint-500/10 text-mint-600 dark:bg-mint-500/12 dark:text-mint-400' },
  { key: 'overdueTasks', label: 'Vencidas', Icon: IconZap, accent: 'text-red-600 dark:text-red-400', chip: 'bg-red-50 text-red-600 dark:bg-red-500/12 dark:text-red-400' },
];

// Tarjeta KPI. Llama al hook de count-up en su propio nivel (por eso es un
// componente y no se calcula dentro de un .map).
function StatCard({ value, label, Icon, accent, chip, delay }) {
  const shown = useCountUp(value);
  return (
    <div className="card card-hover reveal p-5" style={{ '--d': `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <span className={`grid place-items-center w-9 h-9 rounded-lg ${chip}`}>
          <Icon className="w-[18px] h-[18px]" />
        </span>
      </div>
      <p className={`font-mono text-4xl font-semibold tracking-tight mt-3 ${accent}`}>{shown}</p>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // Al pasar a true, las barras del gráfico crecen desde 0 (animación).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Error cargando estadísticas', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!stats) return;
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, [stats]);

  if (loading) return <Spinner label="calculando tu resumen" />;
  if (!stats) {
    return (
      <p className="font-mono text-sm text-red-500">! no se pudo cargar el resumen</p>
    );
  }

  // El máximo de tareas en una materia, para escalar las barras del gráfico.
  const maxTasks = Math.max(1, ...stats.perSubject.map((s) => s.total));

  return (
    <div>
      {/* Encabezado + línea de estado tipo consola */}
      <div className="mb-8">
        <p className="eyebrow mb-2">// resumen</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Tu estudio, de un vistazo
        </h2>
        <p className="mt-2 font-mono text-sm text-slate-500 dark:text-slate-400">
          <span className="text-mint-600 dark:text-mint-400">$</span> {stats.pendingTasks} pendientes
          <span className="text-slate-300 dark:text-slate-600"> · </span>
          {stats.doneTasks} hechas
          <span className="text-slate-300 dark:text-slate-600"> · </span>
          <span className={stats.overdueTasks > 0 ? 'text-red-500' : ''}>
            {stats.overdueTasks} vencidas
          </span>
          <span className="caret text-brand-500 dark:text-brand-400">_</span>
        </p>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {KPIS.map((kpi, i) => (
          <StatCard
            key={kpi.key}
            value={stats[kpi.key]}
            label={kpi.label}
            Icon={kpi.Icon}
            accent={kpi.accent}
            chip={kpi.chip}
            delay={i * 80}
          />
        ))}
      </div>

      {/* Barra de progreso general */}
      <div className="card reveal p-6 mb-6" style={{ '--d': '340ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Progreso general</h3>
          <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
            {stats.doneTasks}/{stats.totalTasks} ·{' '}
            <span className="text-brand-600 dark:text-brand-400 font-semibold">{stats.progress}%</span>
          </span>
        </div>
        <Meter value={stats.progress} color="brand" className="h-3" />
      </div>

      {/* Gráfico: tareas por materia */}
      <div className="card reveal p-6" style={{ '--d': '420ms' }}>
        <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-5">Tareas por materia</h3>

        {stats.perSubject.length === 0 ? (
          <p className="text-slate-400 text-sm">
            Todavía no tenés materias.{' '}
            <Link to="/materias" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Creá la primera
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-3.5">
            {stats.perSubject.map((s, i) => {
              const c = SUBJECT_COLORS[s.color] || SUBJECT_COLORS.indigo;
              const widthPct = (s.total / maxTasks) * 100;
              return (
                <div key={s.subjectId} className="flex items-center gap-3">
                  <span className="w-28 sm:w-40 shrink-0 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                    {s.name}
                  </span>

                  <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${c.dot} rounded-lg`}
                      style={{
                        width: mounted ? `${widthPct}%` : '0%',
                        transition: 'width 0.8s cubic-bezier(0.2,0.7,0.2,1)',
                        transitionDelay: `${400 + i * 60}ms`,
                      }}
                    />
                  </div>

                  <span className="w-14 shrink-0 text-right font-mono text-sm text-slate-500 dark:text-slate-400">
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
