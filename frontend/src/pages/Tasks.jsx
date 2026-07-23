// ─────────────────────────────────────────────────────────────
// PÁGINA DE TAREAS
// - Carga tareas Y materias (las materias llenan el <select>)
// - Formulario: título + fecha de entrega + materia (opcional)
// - Cada tarea: checkbox para marcar hecha, badge de materia,
//   fecha (marca "Vencida" si pasó y sigue pendiente), y borrar
// - Filtro: todas / pendientes / hechas
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { getTasks, createTask, toggleTask, deleteTask } from '../api/tasks';
import { getSubjects } from '../api/subjects';
import { SUBJECT_COLORS } from '../constants/colors';
import Spinner from '../components/Spinner';

// Formatea 'YYYY-MM-DD' a 'DD/MM'
function formatDate(iso) {
  if (!iso) return null;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}`;
}

// ¿La fecha ya pasó? (comparando solo la parte de fecha, sin hora)
function isOverdue(iso) {
  if (!iso) return false;
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD' de hoy
  return iso < today;
}

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Campos del formulario
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [saving, setSaving] = useState(false);

  // Filtro: 'all' | 'pending' | 'done'
  const [filter, setFilter] = useState('all');

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
      });
      setTasks((prev) => [nueva, ...prev]);
      setTitle('');
      setDueDate('');
      setSubjectId('');
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Mis tareas</h2>
      <p className="text-slate-500 mb-6">
        {pendingCount === 0
          ? '¡No tenés tareas pendientes! 🎉'
          : `Tenés ${pendingCount} tarea${pendingCount === 1 ? '' : 's'} pendiente${
              pendingCount === 1 ? '' : 's'
            }.`}
      </p>

      {/* Formulario para agregar tarea */}
      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Tarea</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Estudiar capítulo 3"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Entrega</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Materia</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
          >
            <option value="">Sin materia</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
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
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
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
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-400">No hay tareas para mostrar acá.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visibleTasks.map((task) => {
            const c = task.subjectColor
              ? SUBJECT_COLORS[task.subjectColor] || SUBJECT_COLORS.indigo
              : null;
            const overdue = !task.done && isOverdue(task.dueDate);
            return (
              <li
                key={task.id}
                className="group bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 transition hover:border-slate-300 hover:shadow-sm"
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
                    task.done ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {task.title}
                </span>

                {/* Badge de materia */}
                {task.subjectName && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {task.subjectName}
                  </span>
                )}

                {/* Fecha de entrega */}
                {task.dueDate && (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      overdue ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {overdue ? 'Vencida ' : ''}
                    {formatDate(task.dueDate)}
                  </span>
                )}

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
