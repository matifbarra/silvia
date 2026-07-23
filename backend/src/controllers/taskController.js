// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE TAREAS (async)
// ─────────────────────────────────────────────────────────────

const Task = require('../models/Task');
const Subject = require('../models/Subject');

// GET /api/tasks
async function getAll(req, res) {
  const tasks = await Task.findAllByUser(req.userId);
  res.json(tasks);
}

// POST /api/tasks
async function create(req, res) {
  const { title, dueDate, subjectId } = req.body;

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
  });

  res.status(201).json(task);
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

module.exports = { getAll, create, toggle, remove };
