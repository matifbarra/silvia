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
import DatePicker from '../components/DatePicker';
import Select from '../components/Select';
import Checkbox from '../components/Checkbox';
import { useConfirm } from '../context/ConfirmContext';
import { IconPencil, IconTrash, IconPlus, IconZap, IconClipboard } from '../components/icons';

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
  const neutral = 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-400';
  if (done) return { text: dm, className: neutral };

  const n = daysUntil(iso);
  if (n < 0) return { text: `Vencida · ${dm}`, className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' };
  if (n === 0) return { text: `Hoy · ${dm}`, className: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300' };
  if (n === 1) return { text: `Mañana · ${dm}`, className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' };
  if (n <= 3) return { text: `En ${n} días · ${dm}`, className: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' };
  return { text: dm, className: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300' };
}

// Config de prioridades: etiqueta y colores. Clases completas para que
// Tailwind las incluya (igual que en constants/colors.js).
const PRIORITIES = {
  alta: { label: 'Alta', dot: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  media: { label: 'Media', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  baja: { label: 'Baja', dot: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400' },
};
const PRIORITY_KEYS = Object.keys(PRIORITIES); // ['alta','media','baja']

// Opciones para el <Select> de prioridad (con su puntito de color).
const PRIORITY_OPTIONS = PRIORITY_KEYS.map((key) => ({
  value: key,
  label: PRIORITIES[key].label,
  dot: PRIORITIES[key].dot,
}));

// Estilo compartido de inputs/selects (para no repetir el string enorme)
const FIELD =
  'px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500';

export default function Tasks() {
  const confirmar = useConfirm();
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
    const ok = await confirmar({
      tone: 'danger',
      title: 'Eliminar tarea',
      message: `Se va a eliminar "${taskTitle}". Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
    });
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

  // Opciones del <Select> de materia: "Sin materia" + cada materia con su
  // puntito de color. Los ids van como string para comparar con el value.
  const subjectOptions = [
    { value: '', label: 'Sin materia' },
    ...subjects.map((s) => ({
      value: String(s.id),
      label: s.name,
      dot: (SUBJECT_COLORS[s.color] || SUBJECT_COLORS.indigo).dot,
    })),
  ];

  return (
    <div>
      <p className="eyebrow mb-2">// tareas</p>
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Mis tareas
      </h2>
      <p className="mt-1.5 mb-6 font-mono text-sm text-slate-500 dark:text-slate-400">
        {pendingCount === 0 ? (
          <>
            <span className="text-mint-600 dark:text-mint-400">✓</span> sin pendientes — todo al día
          </>
        ) : (
          <>
            <span className="text-brand-600 dark:text-brand-400 font-semibold">{pendingCount}</span>{' '}
            pendiente{pendingCount === 1 ? '' : 's'} en cola
          </>
        )}
      </p>

      {/* Aviso de urgentes: solo aparece si hay algo que vence hoy o vencido */}
      {urgentCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300 pop-in">
          <IconZap className="w-5 h-5 shrink-0" />
          <span>
            Tenés <strong className="font-semibold">{urgentCount}</strong> tarea
            {urgentCount === 1 ? '' : 's'} que vence{urgentCount === 1 ? '' : 'n'} hoy o ya está
            {urgentCount === 1 ? '' : 'n'} vencida{urgentCount === 1 ? '' : 's'}.
          </span>
        </div>
      )}

      {/* Formulario para agregar tarea */}
      <form
        onSubmit={handleAdd}
        className="card p-4 mb-6 flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap gap-3 sm:items-end"
      >
        <div className="flex-1 sm:min-w-[220px]">
          <label className="block font-mono text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Tarea
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Estudiar capítulo 3"
            className={`w-full ${FIELD}`}
          />
        </div>

        <div>
          <label className="block font-mono text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Entrega
          </label>
          <DatePicker value={dueDate} onChange={setDueDate} className="w-full sm:w-48" />
        </div>

        <div>
          <label className="block font-mono text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Materia
          </label>
          <Select
            value={subjectId}
            onChange={setSubjectId}
            options={subjectOptions}
            ariaLabel="Materia de la tarea"
            className="w-full sm:w-52"
          />
        </div>

        <div>
          <label className="block font-mono text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Prioridad
          </label>
          <Select
            value={priority}
            onChange={setPriority}
            options={PRIORITY_OPTIONS}
            ariaLabel="Prioridad de la tarea"
            className="w-full sm:w-36"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 active:scale-[.98] text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-60 cursor-pointer"
        >
          <IconPlus className="w-4 h-4" />
          {saving ? 'Agregando...' : 'Agregar'}
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
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
              filter === f.key
                ? 'bg-brand-600 text-white shadow-sm'
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
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 dark:bg-slate-800 dark:border-slate-700">
          <div className="mx-auto w-12 h-12 grid place-items-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10 mb-3">
            <IconClipboard className="w-6 h-6" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">No hay tareas para mostrar acá.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visibleTasks.map((task, i) => {
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
                  className="bg-white rounded-2xl border border-brand-300 shadow-sm dark:bg-slate-800 dark:border-brand-500/40 p-4 flex flex-col sm:flex-row gap-3 sm:items-end"
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
                      className={`w-full ${FIELD}`}
                    />
                  </div>
                  <DatePicker
                    value={editDueDate}
                    onChange={setEditDueDate}
                    className="w-full sm:w-44"
                  />
                  <Select
                    value={editSubjectId}
                    onChange={setEditSubjectId}
                    options={subjectOptions}
                    ariaLabel="Materia de la tarea"
                    className="w-full sm:w-44"
                  />
                  <Select
                    value={editPriority}
                    onChange={setEditPriority}
                    options={PRIORITY_OPTIONS}
                    ariaLabel="Prioridad de la tarea"
                    className="w-full sm:w-32"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-2 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleUpdate(task.id)}
                      className="px-4 py-2 text-sm rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold transition cursor-pointer"
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
                style={{ '--d': `${i * 40}ms` }}
                className="group card reveal p-4 flex items-center gap-3 transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/10"
              >
                {/* Checkbox para marcar hecha */}
                <Checkbox
                  checked={!!task.done}
                  onChange={() => handleToggle(task.id)}
                  ariaLabel={
                    task.done
                      ? `Marcar "${task.title}" como pendiente`
                      : `Marcar "${task.title}" como hecha`
                  }
                />

                {/* Título (tachado si está hecha) */}
                <span
                  className={`flex-1 min-w-0 truncate font-medium ${
                    task.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {task.title}
                </span>

                {/* Prioridad (puntito de color + etiqueta) */}
                <span
                  className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold shrink-0 ${p.text}`}
                  title={`Prioridad ${p.label.toLowerCase()}`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                  {p.label}
                </span>

                {/* Badge de materia */}
                {task.subjectName && (
                  <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {task.subjectName}
                  </span>
                )}

                {/* Fecha de entrega (texto y color según cuán cerca vence) */}
                {due && (
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-lg shrink-0 ${due.className}`}
                  >
                    {due.text}
                  </span>
                )}

                {/* Acciones: siempre visibles en mobile, aparecen al hover en desktop */}
                <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <button
                    onClick={() => startEdit(task)}
                    className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Editar"
                    aria-label={`Editar ${task.title}`}
                  >
                    <IconPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id, task.title)}
                    className="grid place-items-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Eliminar"
                    aria-label={`Eliminar ${task.title}`}
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
