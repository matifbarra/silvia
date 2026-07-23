// ─────────────────────────────────────────────────────────────
// PÁGINA DE TAREAS
// - Carga tareas Y materias (las materias llenan el <select>)
// - Formulario: título + fecha de entrega + materia (opcional)
// - Cada tarea: checkbox para marcar hecha, badge de materia,
//   fecha (marca "Vencida" si pasó y sigue pendiente), y borrar
// - Filtro: todas / pendientes / hechas
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from '../api/tasks';
import { getSubjects } from '../api/subjects';
import { SUBJECT_COLORS } from '../constants/colors';
import Spinner from '../components/Spinner';

// Formatea 'YYYY-MM-DD' a 'DD/MM'
function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}`;
}

// ¿Cuántos días faltan hasta la fecha? 0 = hoy, 1 = mañana, negativo = ya pasó.
// OJO: no restamos `new Date()` directo, porque incluye la HORA de ahora y
// arruinaría la cuenta. Aplanamos las dos fechas a medianoche y recién ahí
// restamos. El resultado en milisegundos lo dividimos por los ms de un día.
function daysUntil(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const due = new Date(y, m - 1, d); // fecha de entrega a las 00:00 (mes es 0-based)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // hoy 00:00
  const MS_POR_DIA = 1000 * 60 * 60 * 24;
  return Math.round((due - today) / MS_POR_DIA);
}

// Decide el texto y el color del badge de fecha según cuán cerca está.
// Si la tarea ya está hecha, no urge: siempre estilo neutro.
function dueInfo(iso, done) {
  if (!iso) return null;
  const dm = formatDate(iso); // 'DD/MM'
  if (done) return { text: dm, className: 'bg-slate-100 text-slate-400' };

  const n = daysUntil(iso);
  if (n < 0) return { text: `Vencida · ${dm}`, className: 'bg-red-100 text-red-700' };
  if (n === 0) return { text: `Hoy · ${dm}`, className: 'bg-red-50 text-red-600' };
  if (n === 1) return { text: `Mañana · ${dm}`, className: 'bg-amber-100 text-amber-700' };
  if (n <= 3) return { text: `En ${n} días · ${dm}`, className: 'bg-amber-50 text-amber-600' };
  return { text: dm, className: 'bg-slate-100 text-slate-500' };
}

// Config de prioridades: etiqueta y colores. Clases completas para que
// Tailwind las incluya (igual que en constants/colors.js).
const PRIORITIES = {
  alta: { label: 'Alta', dot: 'bg-red-500', text: 'text-red-600' },
  media: { label: 'Media', dot: 'bg-amber-500', text: 'text-amber-600' },
  baja: { label: 'Baja', dot: 'bg-slate-400', text: 'text-slate-500' },
};
const PRIORITY_KEYS = Object.keys(PRIORITIES); // ['alta','media','baja']

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Campos del formulario
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [priority, setPriority] = useState('media');
  const [saving, setSaving] = useState(false);

  // Filtro: 'all' | 'pending' | 'done'
  const [filter, setFilter] = useState('all');

  // Estado de edición: qué tarea editamos y sus valores cargados
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editPriority, setEditPriority] = useState('media');

  // Al montar: pedimos tareas y materias en paralelo
  useEffect(() => {
    Promise.all([getTasks(), getSubjects()])
      .then(([tasksData, subjectsData]) => {
        setTasks(tasksData);
        setSubjects(subjectsData);
      })
      .catch((err) => console.error('Error cargando datos', err))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const nueva = await createTask({
        title: title.trim(),
        dueDate: dueDate || null,
        subjectId: subjectId || null,
        priority,
      });
      setTasks((prev) => [nueva, ...prev]);
      setTitle('');
      setDueDate('');
      setSubjectId('');
      setPriority('media');
    } catch (err) {
      console.error('Error creando tarea', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(id) {
    try {
      const updated = await toggleTask(id);
      // reemplazamos la tarea por la versión actualizada
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Error actualizando tarea', err);
    }
  }

  // Entra en modo edición precargando los valores actuales.
  // Ojo: dueDate puede venir null → el <input date> necesita '' (string vacío).
  function startEdit(task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDueDate(task.dueDate || '');
    setEditSubjectId(task.subjectId ? String(task.subjectId) : '');
    setEditPriority(task.priority || 'media');
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleUpdate(id) {
    if (!editTitle.trim()) return;
    try {
      const actualizada = await updateTask(id, {
        title: editTitle.trim(),
        dueDate: editDueDate || null,
        subjectId: editSubjectId || null,
        priority: editPriority,
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? actualizada : t)));
      setEditingId(null);
    } catch (err) {
      console.error('Error editando tarea', err);
    }
  }

  async function handleDelete(id, taskTitle) {
    const ok = window.confirm(`¿Eliminar la tarea "${taskTitle}"?`);
    if (!ok) return;

    const backup = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (err) {
      console.error('Error borrando tarea', err);
      setTasks(backup);
    }
  }

  // Aplicamos el filtro sobre la lista
  const visibleTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.done).length;

  // Urgentes = pendientes con fecha que vence hoy (0) o ya vencida (< 0)
  const urgentCount = tasks.filter(
    (t) => !t.done && t.dueDate && daysUntil(t.dueDate) <= 0
  ).length;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">Mis tareas</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        {pendingCount === 0
          ? '¡No tenés tareas pendientes! 🎉'
          : `Tenés ${pendingCount} tarea${pendingCount === 1 ? '' : 's'} pendiente${
              pendingCount === 1 ? '' : 's'
            }.`}
      </p>

      {/* Aviso de urgentes: solo aparece si hay algo que vence hoy o vencido */}
      {urgentCount > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          🔔 Tenés <strong>{urgentCount}</strong> tarea{urgentCount === 1 ? '' : 's'} que
          vence{urgentCount === 1 ? '' : 'n'} hoy o ya está{urgentCount === 1 ? '' : 'n'} vencida
          {urgentCount === 1 ? '' : 's'}.
        </div>
      )}

      {/* Formulario para agregar tarea */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tarea</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Estudiar capítulo 3"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Entrega</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Materia</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 bg-white"
          >
            <option value="">Sin materia</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prioridad</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 bg-white"
          >
            {PRIORITY_KEYS.map((key) => (
              <option key={key} value={key}>
                {PRIORITIES[key].label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition disabled:opacity-60"
        >
          {saving ? 'Agregando...' : '+ Agregar'}
        </button>
      </form>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendientes' },
          { key: 'done', label: 'Hechas' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === f.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de tareas */}
      {loading ? (
        <Spinner label="Cargando tareas..." />
      ) : visibleTasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 dark:bg-slate-800 dark:border-slate-600">
          <p className="text-slate-400">No hay tareas para mostrar acá.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visibleTasks.map((task) => {
            const c = task.subjectColor
              ? SUBJECT_COLORS[task.subjectColor] || SUBJECT_COLORS.indigo
              : null;
            const due = dueInfo(task.dueDate, task.done);
            const p = PRIORITIES[task.priority] || PRIORITIES.media;

            // ── Modo edición: la fila se vuelve un formulario inline ──
            if (editingId === task.id) {
              return (
                <li
                  key={task.id}
                  className="bg-white rounded-xl border border-slate-300 dark:bg-slate-800 dark:border-slate-600 p-4 flex flex-col sm:flex-row gap-3 sm:items-end"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(task.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                    />
                  </div>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                  />
                  <select
                    value={editSubjectId}
                    onChange={(e) => setEditSubjectId(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 bg-white"
                  >
                    <option value="">Sin materia</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 bg-white"
                  >
                    {PRIORITY_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {PRIORITIES[key].label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUpdate(task.id)}
                      className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
                    >
                      Guardar
                    </button>
                  </div>
                </li>
              );
            }

            // ── Vista normal ──
            return (
              <li
                key={task.id}
                className="group bg-white rounded-xl border border-slate-200 dark:bg-slate-800 dark:border-slate-700 p-4 flex items-center gap-3 transition hover:border-slate-300 hover:shadow-sm"
              >
                {/* Checkbox para marcar hecha */}
                <input
                  type="checkbox"
                  checked={!!task.done}
                  onChange={() => handleToggle(task.id)}
                  className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
                />

                {/* Título (tachado si está hecha) */}
                <span
                  className={`flex-1 ${
                    task.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {task.title}
                </span>

                {/* Prioridad (puntito de color + etiqueta) */}
                <span
                  className={`flex items-center gap-1.5 text-xs font-medium ${p.text}`}
                  title={`Prioridad ${p.label.toLowerCase()}`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                  {p.label}
                </span>

                {/* Badge de materia */}
                {task.subjectName && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {task.subjectName}
                  </span>
                )}

                {/* Fecha de entrega (texto y color según cuán cerca vence) */}
                {due && (
                  <span className={`text-xs font-medium px-2 py-1 rounded ${due.className}`}>
                    {due.text}
                  </span>
                )}

                {/* Editar */}
                <button
                  onClick={() => startEdit(task)}
                  className="text-slate-400 hover:text-indigo-600 transition text-sm opacity-0 group-hover:opacity-100"
                  title="Editar"
                >
                  ✏️
                </button>

                {/* Borrar */}
                <button
                  onClick={() => handleDelete(task.id, task.title)}
                  className="text-slate-400 hover:text-red-600 transition text-sm opacity-0 group-hover:opacity-100"
                  title="Eliminar"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
