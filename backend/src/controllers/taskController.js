// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE TAREAS
// El userId viene del middleware (req.userId). Si la tarea trae
// una materia, verificamos que esa materia sea del usuario antes
// de asociarla (nunca confiamos en el subjectId que manda el cliente).
// ─────────────────────────────────────────────────────────────

const Task = require('../models/Task');
const Subject = require('../models/Subject');

// GET /api/tasks
function getAll(req, res) {
  const tasks = Task.findAllByUser(req.userId);
  res.json(tasks);
}

// POST /api/tasks
function create(req, res) {
  const { title, dueDate, subjectId } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título de la tarea es obligatorio' });
  }

  // Si mandaron una materia, confirmamos que exista y sea del usuario
  if (subjectId) {
    const subject = Subject.findById(Number(subjectId), req.userId);
    if (!subject) {
      return res.status(400).json({ message: 'La materia indicada no existe' });
    }
  }

  const task = Task.create({
    userId: req.userId,
    subjectId: subjectId ? Number(subjectId) : null,
    title: title.trim(),
    dueDate: dueDate || null,
  });

  res.status(201).json(task);
}

// PATCH /api/tasks/:id/toggle → marca hecha/pendiente
function toggle(req, res) {
  const id = Number(req.params.id);
  const existing = Task.findById(id, req.userId);
  if (!existing) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  const updated = Task.toggleDone(id, req.userId);
  res.json(updated);
}

// DELETE /api/tasks/:id
function remove(req, res) {
  const id = Number(req.params.id);
  const deleted = Task.remove(id, req.userId);
  if (!deleted) {
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
  res.json({ message: 'Tarea eliminada', id });
}

module.exports = { getAll, create, toggle, remove };
