// ─────────────────────────────────────────────────────────────
// IMPORTADOR DEL PLAN DE ESTUDIO
// Modal que muestra las materias del plan agrupadas por año y deja
// tildar las que querés agregar.
//
// Conceptos nuevos:
//  - Set para las selecciones: preguntar "¿está seleccionado?" es
//    instantáneo (has), a diferencia de un array (includes recorre todo).
//  - Estado "levantado": el modal no guarda las materias, solo avisa
//    al padre con onImported(). El padre (Dashboard) es el dueño de la lista.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { getPlan, importSubjects } from '../api/subjects';
import { yearLabel, YEAR_BADGE } from '../constants/years';
import { IconX, IconCheck, IconDownload } from './icons';
import Spinner from './Spinner';
import Checkbox from './Checkbox';

export default function PlanImporter({ existingNames, onClose, onImported }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seleccion, setSeleccion] = useState(new Set());
  const [importando, setImportando] = useState(false);

  useEffect(() => {
    getPlan()
      .then(setPlan)
      .catch((err) => console.error('Error cargando el plan', err))
      .finally(() => setLoading(false));
  }, []);

  // Cerrar con Escape. El return de useEffect es la "limpieza": se
  // ejecuta al desmontar, para no dejar el listener colgado.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ¿El usuario ya tiene esta materia? (comparamos sin mayúsculas)
  const yaLaTiene = (name) => existingNames.has(name.trim().toLowerCase());

  function toggle(code) {
    // Nunca mutamos el Set del estado: creamos uno nuevo. Si no,
    // React no ve el cambio de referencia y no vuelve a renderizar.
    setSeleccion((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  }

  // Tilda/destilda todas las materias de un año que todavía no tenés
  function toggleAnio(subjects) {
    const disponibles = subjects.filter((m) => !yaLaTiene(m.name)).map((m) => m.code);
    const todasTildadas = disponibles.every((code) => seleccion.has(code));

    setSeleccion((prev) => {
      const next = new Set(prev);
      disponibles.forEach((code) => (todasTildadas ? next.delete(code) : next.add(code)));
      return next;
    });
  }

  async function handleImport() {
    if (seleccion.size === 0) return;
    setImportando(true);
    try {
      const { created } = await importSubjects([...seleccion]);
      onImported(created);
      onClose();
    } catch (err) {
      console.error('Error importando materias', err);
    } finally {
      setImportando(false);
    }
  }

  return (
    // Fondo oscuro: al clickearlo se cierra el modal
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Importar materias del plan de estudio"
    >
      {/* stopPropagation evita que el click DENTRO de la tarjeta
          "burbujee" hasta el fondo y cierre el modal sin querer */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 pop-in"
      >
        {/* ── Encabezado ── */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Importar del plan de estudio
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {plan ? `${plan.career} · Plan ${plan.plan}` : 'Cargando plan...'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="grid place-items-center w-8 h-8 shrink-0 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* ── Cuerpo (scrollea solo esta parte) ── */}
        <div className="overflow-y-auto p-5 space-y-6">
          {loading ? (
            <Spinner label="Cargando plan..." />
          ) : !plan ? (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              No se pudo cargar el plan de estudio.
            </p>
          ) : (
            plan.years.map(({ year, subjects }) => {
              const disponibles = subjects.filter((m) => !yaLaTiene(m.name));
              const todasTildadas =
                disponibles.length > 0 && disponibles.every((m) => seleccion.has(m.code));

              return (
                <section key={year}>
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${YEAR_BADGE[year]}`}
                    >
                      {yearLabel(year)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleAnio(subjects)}
                      disabled={disponibles.length === 0}
                      className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-default cursor-pointer"
                    >
                      {disponibles.length === 0
                        ? 'Ya las tenés todas'
                        : todasTildadas
                          ? 'Quitar todas'
                          : 'Seleccionar todas'}
                    </button>
                  </div>

                  <ul className="space-y-1">
                    {subjects.map((materia) => {
                      const tiene = yaLaTiene(materia.name);
                      const tildada = seleccion.has(materia.code);

                      return (
                        <li key={materia.code}>
                          <label
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition ${
                              tiene
                                ? 'border-transparent opacity-55 cursor-default'
                                : tildada
                                  ? 'border-brand-300 bg-brand-50 dark:border-brand-500/40 dark:bg-brand-500/10 cursor-pointer'
                                  : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer'
                            }`}
                          >
                            <Checkbox
                              checked={tildada}
                              disabled={tiene}
                              onChange={() => toggle(materia.code)}
                              ariaLabel={materia.name}
                            />
                            <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                              {materia.name}
                            </span>
                            {tiene && (
                              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                                <IconCheck className="w-3.5 h-3.5" />
                                Ya la tenés
                              </span>
                            )}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })
          )}
        </div>

        {/* ── Pie con las acciones ── */}
        <div className="flex items-center justify-between gap-3 p-5 border-t border-slate-200 dark:border-slate-700">
          <span className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">
            {seleccion.size === 0
              ? 'Ninguna seleccionada'
              : `${seleccion.size} seleccionada${seleccion.size === 1 ? '' : 's'}`}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={seleccion.size === 0 || importando}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-[.98] text-white shadow-sm transition disabled:opacity-50 disabled:cursor-default cursor-pointer"
            >
              <IconDownload className="w-4 h-4" />
              {importando ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
