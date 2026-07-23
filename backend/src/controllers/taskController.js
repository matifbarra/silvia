// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE TAREAS (async)
// ─────────────────────────────────────────────────────────────

const Task = require('../models/Task');
const Subject = require('../models/Subject');

// Prioridades válidas. Si llega cualquier otra cosa, la ignoramos.
const PRIORIDADES = ['alta', 'media', 'baja'];
function normalizarPrioridad(valor, porDefecto = 'media') {
  return PRIORIDADES.includes(valor) ? valor : porDefecto;
}

// GET /api/tasks
async function getAll(req, res) {
  const tasks = await Task.findAllByUser(req.userId);
  res.json(tasks);
}

// POST /api/tasks
async function create(req, res) {
  const { title, dueDate, subjectId, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título de la tarea es obligatorio' });
  }

  // Si mandaron una materia, confirmamos que exista y sea del usuario
  if (subjectId) {
    const subject = await Subject.findById(Number(subjectId), req.userId);
    if (!subject) {
      return res.status(400).json({ message: 'La materia indicada no existe' });
    }
  }

  const task = await Task.create({
    userId: req.userId,
    subjectId: subjectId ? Number(subjectId) : null,
    title: title.trim(),
    dueDate: dueDate || null,
    priority: normalizarPrioridad(priority),
  });

  res.status(201).json(task);
}

// PUT /api/tasks/:id → edita una tarea (título, fecha y/o materia)
async function update(req, res) {
  const id = Number(req.params.id);

  const existing = await Task.findById(id, req.userId);
  if (!existing) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }

  const { title, dueDate, subjectId, priority } = req.body;

  // Si mandaron una materia, confirmamos que exista y sea del usuario
  if (subjectId) {
    const subject = await Subject.findById(Number(subjectId), req.userId);
    if (!subject) {
      return res.status(400).json({ message: 'La materia indicada no existe' });
    }
  }

  const updated = await Task.update({
    id,
    userId: req.userId,
    title: title?.trim() || existing.title,
    dueDate: dueDate || null,
    subjectId: subjectId ? Number(subjectId) : null,
    priority: normalizarPrioridad(priority, existing.priority),
  });

  res.json(updated);
}

// PATCH /api/tasks/:id/toggle → marca hecha/pendiente
async function toggle(req, res) {
  const id = Number(req.params.id);
  const existing = await Task.findById(id, req.userId);
  if (!existing) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  const updated = await Task.toggleDone(id, req.userId);
  res.json(updated);
}

// DELETE /api/tasks/:id
async function remove(req, res) {
  const id = Number(req.params.id);
  const deleted = await Task.remove(id, req.userId);
  if (!deleted) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  res.json({ message: 'Tarea eliminada', id });
}

module.exports = { getAll, create, update, toggle, remove };
