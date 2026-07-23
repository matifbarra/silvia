// ─────────────────────────────────────────────────────────────
// CARRERA — Plan de estudio y correlativas
//
// Esta página responde UNA pregunta: "¿qué puedo cursar y cuánto me
// falta?". Por eso no gestiona materias (eso es /materias) ni tareas.
//
// Para que no se desborde de información usamos dos recursos clásicos:
//   1. Vista por defecto = la respuesta ("Podés cursar"), no los datos.
//   2. Divulgación progresiva: cada fila muestra lo mínimo y el detalle
//      (correlativas, qué falta) aparece solo si lo desplegás.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from 'react';
import { getCarrera, setStatus } from '../api/carrera';
import { ESTADOS, ESTADO_KEYS, VISTAS } from '../constants/estados';
import { yearLabel, YEAR_BADGE } from '../constants/years';
import Spinner from '../components/Spinner';
import { IconCheck, IconLock, IconChevron, IconRoute } from '../components/icons';

export default function Carrera() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState('habilitadas');
  const [abierta, setAbierta] = useState(null); // code de la fila desplegada
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    getCarrera()
      .then(setData)
      .catch((err) => console.error('Error cargando la carrera', err))
      .finally(() => setLoading(false));
  }, []);

  // Cambia el estado de una o varias materias. El backend nos devuelve
  // TODO recalculado, así que simplemente reemplazamos los datos.
  async function cambiarEstado(codes, nuevoEstado) {
    setGuardando(true);
    try {
      setData(await setStatus(codes, nuevoEstado));
    } catch (err) {
      console.error('Error guardando el estado', err);
    } finally {
      setGuardando(false);
    }
  }

  const vistaActual = VISTAS.find((v) => v.key === vista);

  // Filtramos según la vista y agrupamos por año
  const grupos = useMemo(() => {
    if (!data) return [];
    const visibles = data.subjects.filter(vistaActual.test);
    return data.years
      .map((year) => ({ year, materias: visibles.filter((m) => m.year === year) }))
      .filter((g) => g.materias.length > 0);
  }, [data, vistaActual]);

  // Cuántas materias entran en cada vista (para el número del chip)
  const conteoPorVista = useMemo(() => {
    if (!data) return {};
    return Object.fromEntries(
      VISTAS.map((v) => [v.key, data.subjects.filter(v.test).length])
    );
  }, [data]);

  if (loading) return <Spinner label="Cargando tu carrera..." />;
  if (!data) {
    return (
      <p className="text-center py-16 text-slate-500 dark:text-slate-400">
        No se pudo cargar el plan de estudio.
      </p>
    );
  }

  const { counts, total } = data;
  const porcentaje = Math.round((counts.aprobada / total) * 100);

  return (
    <div>
      <div className="flex items-center gap-3 mb-1">
        <span className="grid place-items-center w-9 h-9 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400">
          <IconRoute className="w-5 h-5" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Mi carrera
        </h2>
      </div>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        {data.career} · Plan {data.plan}
      </p>

      {/* ── Progreso ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-5 mb-6">
        <div className="flex items-end justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Progreso de la carrera
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white tabular-nums">
              {porcentaje}%
            </p>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">
            {counts.aprobada} de {total} aprobadas
          </p>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500"
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        {/* Desglose por estado */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
          {ESTADO_KEYS.map((key) => (
            <span key={key} className="flex items-center gap-2 text-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${ESTADOS[key].dot}`} />
              <span className="text-slate-500 dark:text-slate-400">{ESTADOS[key].label}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                {counts[key]}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Vistas ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {VISTAS.map((v) => {
          const activa = vista === v.key;
          return (
            <button
              key={v.key}
              onClick={() => setVista(v.key)}
              aria-pressed={activa}
              className={`px-3.5 py-1.5 text-sm font-semibold rounded-full border transition cursor-pointer ${
                activa
                  ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {v.label}
              <span className={`ml-1.5 tabular-nums ${activa ? 'text-violet-200' : 'text-slate-400'}`}>
                {conteoPorVista[v.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Listado ── */}
      {grupos.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 dark:bg-slate-800 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400">{vistaActual.vacio}</p>
        </div>
      ) : (
        <div className={guardando ? 'space-y-8 opacity-60 transition' : 'space-y-8 transition'}>
          {grupos.map(({ year, materias }) => (
            <section key={year}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${YEAR_BADGE[year]}`}>
                  {yearLabel(year)}
                </span>
                <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                {/* Atajo para cargar tu historial rápido cuando arrancás */}
                <select
                  value=""
                  disabled={guardando}
                  aria-label={`Marcar todas las materias de ${yearLabel(year)}`}
                  onChange={(e) => {
                    if (e.target.value) {
                      cambiarEstado(
                        data.subjects.filter((m) => m.year === year).map((m) => m.code),
                        e.target.value
                      );
                    }
                  }}
                  className="text-xs text-slate-500 dark:text-slate-400 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition"
                >
                  <option value="">Marcar todo el año…</option>
                  {ESTADO_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {ESTADOS[k].label}
                    </option>
                  ))}
                </select>
              </div>

              <ul className="space-y-2">
                {materias.map((m) => (
                  <MateriaRow
                    key={m.code}
                    materia={m}
                    abierta={abierta === m.code}
                    onToggle={() => setAbierta(abierta === m.code ? null : m.code)}
                    onEstado={(estado) => cambiarEstado([m.code], estado)}
                    disabled={guardando}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Una fila del listado. Componente aparte (y afuera del padre) para
// que cada fila maneje su propio despliegue sin re-renderizar todo.
// ─────────────────────────────────────────────────────────────
function MateriaRow({ materia, abierta, onToggle, onEstado, disabled }) {
  const est = ESTADOS[materia.status];
  const bloqueada = !materia.enabled && materia.status === 'pendiente';
  const hayDetalle =
    materia.requires.regular.length > 0 || materia.requires.aprobada.length > 0 || materia.note;

  return (
    <li className="bg-white rounded-xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center gap-3 p-3">
        {/* Nombre + señal de bloqueo/habilitación */}
        <button
          type="button"
          onClick={onToggle}
          disabled={!hayDetalle}
          aria-expanded={abierta}
          className="flex-1 min-w-0 flex items-center gap-2.5 text-left disabled:cursor-default cursor-pointer group"
        >
          {bloqueada ? (
            <IconLock className="w-4 h-4 shrink-0 text-slate-400" />
          ) : materia.status === 'aprobada' ? (
            <IconCheck className="w-4 h-4 shrink-0 text-emerald-500" />
          ) : (
            <span className={`w-2.5 h-2.5 shrink-0 rounded-full ml-0.5 mr-1 ${est.dot}`} />
          )}

          <span
            className={`text-sm font-medium truncate ${
              bloqueada
                ? 'text-slate-400 dark:text-slate-500'
                : 'text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400'
            }`}
          >
            {materia.name}
          </span>

          {hayDetalle && (
            <IconChevron
              className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${
                abierta ? 'rotate-180' : ''
              }`}
            />
          )}
        </button>

        {/* Selector de estado. El color del chip refleja el estado
            actual, así se puede escanear la lista de un vistazo. */}
        <select
          value={materia.status}
          disabled={disabled}
          onChange={(e) => onEstado(e.target.value)}
          aria-label={`Estado de ${materia.name}`}
          className={`shrink-0 text-xs font-semibold rounded-lg border px-2 py-1.5 cursor-pointer transition outline-none focus:ring-4 focus:ring-violet-500/20 ${est.chip}`}
        >
          {ESTADO_KEYS.map((k) => (
            <option key={k} value={k}>
              {ESTADOS[k].label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Detalle desplegable ── */}
      {abierta && hayDetalle && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-sm space-y-2">
          <Requisito
            titulo="Para cursarla necesitás regularizadas"
            items={materia.requires.regular}
            faltantes={materia.missing.regular}
          />
          <Requisito
            titulo="Y aprobadas"
            items={materia.requires.aprobada}
            faltantes={materia.missing.aprobada}
          />
          {materia.note && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30">
              {materia.note}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

// Lista de correlativas de un tipo. Las que te faltan van resaltadas
// en rojo; las que ya cumplís, tachadas y en gris.
function Requisito({ titulo, items, faltantes }) {
  if (items.length === 0) return null;
  const faltanCodes = new Set(faltantes.map((f) => f.code));

  return (
    <div className="pt-2">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{titulo}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const falta = faltanCodes.has(item.code);
          return (
            <span
              key={item.code}
              className={`text-xs px-2 py-1 rounded-lg border ${
                falta
                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 line-through decoration-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30'
              }`}
            >
              {item.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
