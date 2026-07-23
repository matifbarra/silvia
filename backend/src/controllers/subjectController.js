// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE MATERIAS
// El userId viene del middleware authRequired (req.userId), así
// que nunca confiamos en el cliente para saber de quién es la materia.
// ─────────────────────────────────────────────────────────────

const Subject = require('../models/Subject');

// GET /api/subjects → lista todas las materias del usuario
function getAll(req, res) {
  const subjects = Subject.findAllByUser(req.userId);
  res.json(subjects);
}

// POST /api/subjects → crea una materia
function create(req, res) {
  const { name, color } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'El nombre de la materia es obligatorio' });
  }

  const subject = Subject.create({
    userId: req.userId,
    name: name.trim(),
    color: color || 'indigo',
  });

  res.status(201).json(subject);
}

// PUT /api/subjects/:id → edita una materia
function update(req, res) {
  const { name, color } = req.body;
  const id = Number(req.params.id);

  // Verificamos que exista y sea del usuario
  const existing = Subject.findById(id, req.userId);
  if (!existing) {
    return res.status(404).json({ message: 'Materia no encontrada' });
  }

  const updated = Subject.update({
    id,
    userId: req.userId,
    name: name?.trim() || existing.name,
    color: color || existing.color,
  });

  res.json(updated);
}

// DELETE /api/subjects/:id → borra una materia
function remove(req, res) {
  const id = Number(req.params.id);
  const deleted = Subject.remove(id, req.userId);

  if (!deleted) {
    return res.status(404).json({ message: 'Materia no encontrada' });
  }

  res.json({ message: 'Materia eliminada', id });
}

module.exports = { getAll, create, update, remove };
