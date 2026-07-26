// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE TAREAS (async)
// ─────────────────────────────────────────────────────────────

const Task = require('../models/Task');
const Plan = require('../models/Plan');

// Prioridades válidas. Si llega cualquier otra cosa, la ignoramos.
const PRIORIDADES = ['alta', 'media', 'baja'];
function normalizarPrioridad(valor, porDefecto = 'media') {
  return PRIORIDADES.includes(valor) ? valor : porDefecto;
}

// La materia de una tarea es un código del plan. Como tasks."code" no
// tiene clave foránea (ver migrateTasksToPlan en database.js), la
// validación es responsabilidad nuestra: si el código no existe en el
// plan, cortamos acá y no dejamos que entre basura a la base.
//
// Devuelve { code } si está todo bien (con code = null si no mandaron
// materia) o { error } si el código no pertenece al plan. Devolvemos el
// error en vez de tirarlo porque Express no atrapa las excepciones de
// una función async: la petición quedaría colgada sin respuesta.
async function resolverCode(valor) {
  if (valor === undefined || valor === null || valor === '') return { code: null };

  const code = Number(valor);
  const delPlan = await Plan.findCodes();
  if (!delPlan.has(code)) return { error: 'La materia indicada no existe en el plan' };

  return { code };
}

// GET /api/tasks
async function getAll(req, res) {
  const tasks = await Task.findAllByUser(req.userId);
  res.json(tasks);
}

// POST /api/tasks
async function create(req, res) {
  const { title, dueDate, code, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'El título de la tarea es obligatorio' });
  }

  const materia = await resolverCode(code);
  if (materia.error) return res.status(400).json({ message: materia.error });

  const task = await Task.create({
    userId: req.userId,
    code: materia.code,
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

  const { title, dueDate, code, priority } = req.body;

  const materia = await resolverCode(code);
  if (materia.error) return res.status(400).json({ message: materia.error });

  const updated = await Task.update({
    id,
    userId: req.userId,
    title: title?.trim() || existing.title,
    dueDate: dueDate || null,
    code: materia.code,
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
