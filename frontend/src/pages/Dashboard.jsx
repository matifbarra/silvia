// ─────────────────────────────────────────────────────────────
// DASHBOARD — Gestión de Materias
// - useEffect: carga las materias del backend al abrir la página
// - useState: guarda la lista, el nombre nuevo y el color elegido
// - Al crear/borrar, actualizamos el estado para reflejarlo al toque
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjects';
import { SUBJECT_COLORS, COLOR_KEYS } from '../constants/colors';
import Spinner from '../components/Spinner';
import { IconPencil, IconTrash, IconPlus, IconBook } from '../components/icons';

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [color, setColor] = useState('indigo');
  const [saving, setSaving] = useState(false);

  // Estado de edición: qué materia estamos editando y sus valores cargados.
  // editingId === null → no estamos editando nada.
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('indigo');

  // Cargar materias al montar el componente
  useEffect(() => {
    getSubjects()
      .then((data) => setSubjects(data))
      .catch((err) => console.error('Error cargando materias', err))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const nueva = await createSubject(name.trim(), color);
      setSubjects((prev) => [nueva, ...prev]); // la agregamos arriba
      setName(''); // limpiamos el input
    } catch (err) {
      console.error('Error creando materia', err);
    } finally {
      setSaving(false);
    }
  }

  // Entra en modo edición: precargamos los valores actuales en el mini-form
  function startEdit(subject) {
    setEditingId(subject.id);
    setEditName(subject.name);
    setEditColor(subject.color);
  }

  // Cancela sin guardar
  function cancelEdit() {
    setEditingId(null);
  }

  // Guarda los cambios de la materia que se está editando
  async function handleUpdate(id) {
    if (!editName.trim()) return;
    try {
      const actualizada = await updateSubject(id, editName.trim(), editColor);
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

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
        Mis materias
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        Organizá las materias que estás cursando.
      </p>

      {/* Formulario para agregar materia */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm dark:bg-slate-800 dark:border-slate-700 p-4 mb-8 flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Nombre de la materia
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Análisis Matemático"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        {/* Selector de color */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Color
          </label>
          <div className="flex gap-2 h-[42px] items-center">{colorSwatches(color, setColor)}</div>
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

      {/* Lista de materias */}
      {loading ? (
        <Spinner label="Cargando materias..." />
      ) : subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 dark:bg-slate-800 dark:border-slate-700">
          <div className="mx-auto w-12 h-12 grid place-items-center rounded-full bg-violet-50 text-violet-500 dark:bg-violet-500/10 mb-3">
            <IconBook className="w-6 h-6" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Todavía no tenés materias. ¡Agregá la primera!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
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
                  <div className="flex gap-2">{colorSwatches(editColor, setEditColor, 'w-7 h-7')}</div>
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
                  <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
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
      )}
    </div>
  );
}
