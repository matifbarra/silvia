// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE MATERIAS (async)
// Express 5 reenvía solo los errores de funciones async, así que
// no hace falta try/catch en cada una.
// ─────────────────────────────────────────────────────────────

const Subject = require('../models/Subject');

// GET /api/subjects → lista todas las materias del usuario
async function getAll(req, res) {
  const subjects = await Subject.findAllByUser(req.userId);
  res.json(subjects);
}

// POST /api/subjects → crea una materia
async function create(req, res) {
  const { name, color } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'El nombre de la materia es obligatorio' });
  }

  const subject = await Subject.create({
    userId: req.userId,
    name: name.trim(),
    color: color || 'indigo',
  });

  res.status(201).json(subject);
}

// PUT /api/subjects/:id → edita una materia
async function update(req, res) {
  const { name, color } = req.body;
  const id = Number(req.params.id);

  const existing = await Subject.findById(id, req.userId);
  if (!existing) {
    return res.status(404).json({ message: 'Materia no encontrada' });
  }

  const updated = await Subject.update({
    id,
    userId: req.userId,
    name: name?.trim() || existing.name,
    color: color || existing.color,
  });

  res.json(updated);
}

// DELETE /api/subjects/:id → borra una materia
async function remove(req, res) {
  const id = Number(req.params.id);
  const deleted = await Subject.remove(id, req.userId);

  if (!deleted) {
    return res.status(404).json({ message: 'Materia no encontrada' });
  }

  res.json({ message: 'Materia eliminada', id });
}

module.exports = { getAll, create, update, remove };
