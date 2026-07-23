// ─────────────────────────────────────────────────────────────
// DASHBOARD — Gestión de Materias
// - useEffect: carga las materias del backend al abrir la página
// - useState: guarda la lista, el nombre nuevo y el color elegido
// - Al crear/borrar, actualizamos el estado para reflejarlo al toque
// - Las materias se agrupan por año del plan de estudio y se pueden
//   filtrar con los chips de arriba
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjects';
import { SUBJECT_COLORS, COLOR_KEYS } from '../constants/colors';
import { YEARS, SIN_ANIO, yearLabel, YEAR_BADGE, groupByYear } from '../constants/years';
import Spinner from '../components/Spinner';
import PlanImporter from '../components/PlanImporter';
import { IconPencil, IconTrash, IconPlus, IconBook, IconDownload } from '../components/icons';

// El <select> del año devuelve siempre strings: '' o '1'..'5'.
// Estos dos helpers traducen entre ese string y el número (o null)
// que espera el backend.
const aNumero = (valor) => (valor === '' ? null : Number(valor));
const aTexto = (year) => (year ? String(year) : '');

// Un chip del filtro por año. Va DEFINIDO AFUERA del Dashboard a
// propósito: si lo declarás adentro, React crea una función nueva en
// cada render y desmonta/remonta el chip cada vez (pierde foco y anima mal).
function FilterChip({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3.5 py-1.5 text-sm font-semibold rounded-full border transition cursor-pointer ${
        active
          ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white'
      }`}
    >
      {label}
      <span className={`ml-1.5 tabular-nums ${active ? 'text-violet-200' : 'text-slate-400'}`}>
        {count}
      </span>
    </button>
  );
}

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [color, setColor] = useState('indigo');
  const [year, setYear] = useState('');
  const [saving, setSaving] = useState(false);

  // Filtro por año: null = mostrar todas
  const [yearFilter, setYearFilter] = useState(null);
  const [showImporter, setShowImporter] = useState(false);

  // Estado de edición: qué materia estamos editando y sus valores cargados.
  // editingId === null → no estamos editando nada.
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('indigo');
  const [editYear, setEditYear] = useState('');

  // Cargar materias al montar el componente
  useEffect(() => {
    getSubjects()
      .then((data) => setSubjects(data))
      .catch((err) => console.error('Error cargando materias', err))
      .finally(() => setLoading(false));
  }, []);

  // useMemo = "recalculá esto solo cuando cambie 'subjects'".
  // Sin esto, se armaría un Set nuevo en cada render (también cuando
  // escribís en el input), aunque la lista no haya cambiado.
  const existingNames = useMemo(
    () => new Set(subjects.map((s) => s.name.trim().toLowerCase())),
    [subjects]
  );

  // Cuántas materias hay por año (para mostrar el número en los chips)
  const conteoPorAnio = useMemo(() => {
    const conteo = {};
    for (const s of subjects) {
      const clave = s.year || SIN_ANIO;
      conteo[clave] = (conteo[clave] || 0) + 1;
    }
    return conteo;
  }, [subjects]);

  // Primero filtramos, después agrupamos. Si hay filtro activo queda
  // un solo grupo; si no, salen todos los años uno abajo del otro.
  const grupos = useMemo(() => {
    const visibles =
      yearFilter === null
        ? subjects
        : subjects.filter((s) => (yearFilter === SIN_ANIO ? !s.year : s.year === yearFilter));
    return groupByYear(visibles);
  }, [subjects, yearFilter]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const nueva = await createSubject(name.trim(), color, aNumero(year));
      setSubjects((prev) => [nueva, ...prev]); // la agregamos arriba
      setName(''); // limpiamos el input
    } catch (err) {
      console.error('Error creando materia', err);
    } finally {
      setSaving(false);
    }
  }

  // El importador nos devuelve las materias que creó; las sumamos a la lista
  function handleImported(created) {
    setSubjects((prev) => [...created, ...prev]);
  }

  // Entra en modo edición: precargamos los valores actuales en el mini-form
  function startEdit(subject) {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditColor(subject.color);
    setEditYear(aTexto(subject.year));
  }

  // Cancela sin guardar
  function cancelEdit() {
    setEditingId(null);
  }

  // Guarda los cambios de la materia que se está editando
  async function handleUpdate(id) {
    if (!editName.trim()) return;
    try {
      const actualizada = await updateSubject(id, editName.trim(), editColor, aNumero(editYear));
      // Reemplazamos la vieja por la actualizada, dejando el resto igual
      setSubjects((prev) => prev.map((s) => (s.id === id ? actualizada : s)));
      setEditingId(null); // salimos del modo edición
    } catch (err) {
      console.error('Error editando materia', err);
    }
  }

  async function handleDelete(id, subjectName) {
    // Pedimos confirmación antes de borrar (evita borrados accidentales)
    const ok = window.confirm(
      `¿Seguro que querés eliminar "${subjectName}"? También se borrarán sus tareas.`
    );
    if (!ok) return;

    // Optimista: la sacamos de la lista y luego confirmamos con el backend
    const backup = subjects;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSubject(id);
    } catch (err) {
      console.error('Error borrando materia', err);
      setSubjects(backup); // si falla, la restauramos
    }
  }

  // Botones de color reutilizables (mismo look en crear y editar)
  const colorSwatches = (selected, onSelect, size = 'w-8 h-8') =>
    COLOR_KEYS.map((key) => (
      <button
        key={key}
        type="button"
        onClick={() => onSelect(key)}
        title={SUBJECT_COLORS[key].label}
        aria-label={`Color ${SUBJECT_COLORS[key].label}`}
        className={`${size} rounded-full ${SUBJECT_COLORS[key].dot} transition cursor-pointer hover:scale-110 ${
          selected === key
            ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-offset-slate-800'
            : ''
        }`}
      />
    ));

  const FIELD =
    'px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500';

  // Opciones del selector de año (las mismas en crear y editar)
  const yearOptions = (
    <>
      <option value="">Sin año</option>
      {YEARS.map((y) => (
        <option key={y} value={y}>
          {yearLabel(y)}
        </option>
      ))}
    </>
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            Mis materias
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Organizá las materias que estás cursando, año por año.
          </p>
        </div>

        <button
          onClick={() => setShowImporter(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20 transition cursor-pointer"
        >
          <IconDownload className="w-4 h-4" />
          Importar del plan
        </button>
      </div>

      {/* Formulario para agregar materia */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-4 mb-6 flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-3 sm:items-end"
      >
        <div className="flex-1 sm:min-w-[200px]">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Nombre de la materia
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Análisis Matemático"
            className={`w-full ${FIELD}`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Año
          </label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className={FIELD}>
            {yearOptions}
          </select>
        </div>

        {/* Selector de color */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Color
          </label>
          <div className="flex gap-2 h-[46px] items-center">{colorSwatches(color, setColor)}</div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:scale-[.98] text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-60 cursor-pointer"
        >
          <IconPlus className="w-4 h-4" />
          {saving ? 'Agregando...' : 'Agregar'}
        </button>
      </form>

      {/* Chips de filtro por año — solo si hay algo que filtrar */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterChip
            label="Todas"
            count={subjects.length}
            active={yearFilter === null}
            onClick={() => setYearFilter(null)}
          />
          {YEARS.filter((y) => conteoPorAnio[y]).map((y) => (
            <FilterChip
              key={y}
              label={yearLabel(y)}
              count={conteoPorAnio[y]}
              active={yearFilter === y}
              onClick={() => setYearFilter(y)}
            />
          ))}
          {conteoPorAnio[SIN_ANIO] && (
            <FilterChip
              label="Sin año"
              count={conteoPorAnio[SIN_ANIO]}
              active={yearFilter === SIN_ANIO}
              onClick={() => setYearFilter(SIN_ANIO)}
            />
          )}
        </div>
      )}

      {/* Lista de materias */}
      {loading ? (
        <Spinner label="Cargando materias..." />
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 dark:bg-slate-800 dark:border-slate-700">
          <div className="mx-auto w-12 h-12 grid place-items-center rounded-full bg-violet-50 text-violet-500 dark:bg-violet-500/10 mb-3">
            <IconBook className="w-6 h-6" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Todavía no tenés materias. Podés cargarlas del plan de estudio de una.
          </p>
          <button
            onClick={() => setShowImporter(true)}
            className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 active:scale-[.98] text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            <IconDownload className="w-4 h-4" />
            Importar del plan
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grupos.map(({ key, year: anioGrupo, subjects: delGrupo }) => (
            <section key={key}>
              {/* Título del grupo: lo ocultamos si el filtro ya deja un solo año */}
              {yearFilter === null && (
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${YEAR_BADGE[key]}`}>
                    {yearLabel(anioGrupo)}
                  </span>
                  <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs text-slate-400 tabular-nums">{delGrupo.length}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {delGrupo.map((subject) => {
                  const c = SUBJECT_COLORS[subject.color] || SUBJECT_COLORS.indigo;

                  // ── Modo edición: la tarjeta se vuelve un mini-formulario ──
                  if (editingId === subject.id) {
                    return (
                      <div
                        key={subject.id}
                        className="rounded-2xl border border-violet-300 bg-white shadow-sm dark:bg-slate-800 dark:border-violet-500/40 p-5 flex flex-col gap-3"
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdate(subject.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500"
                        />
                        <select
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                          aria-label="Año de la materia"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100"
                        >
                          {yearOptions}
                        </select>
                        <div className="flex gap-2">
                          {colorSwatches(editColor, setEditColor, 'w-7 h-7')}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleUpdate(subject.id)}
                            className="px-4 py-1.5 text-sm rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold transition cursor-pointer"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // ── Vista normal ──
                  return (
                    <div
                      key={subject.id}
                      className={`group rounded-2xl border p-5 flex items-center justify-between transition hover:shadow-md ${c.card}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`shrink-0 w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        {/* line-clamp-2 en vez de truncate: los nombres del plan
                            son largos y con una sola línea se perdía información */}
                        <span
                          title={subject.name}
                          className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug"
                        >
                          {subject.name}
                        </span>
                      </div>
                      {/* Acciones: siempre visibles en mobile, aparecen al hover en desktop */}
                      <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEdit(subject)}
                          className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-white/60 dark:hover:bg-slate-700 transition cursor-pointer"
                          title="Editar"
                          aria-label={`Editar ${subject.name}`}
                        >
                          <IconPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id, subject.name)}
                          className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white/60 dark:hover:bg-slate-700 transition cursor-pointer"
                          title="Eliminar"
                          aria-label={`Eliminar ${subject.name}`}
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* El modal se monta solo cuando hace falta */}
      {showImporter && (
        <PlanImporter
          existingNames={existingNames}
          onClose={() => setShowImporter(false)}
          onImported={handleImported}
        />
      )}
    </div>
  );
}
