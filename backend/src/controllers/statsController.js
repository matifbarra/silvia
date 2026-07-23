// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE ESTADÍSTICAS
// Devuelve el resumen del usuario actual (req.userId).
// ─────────────────────────────────────────────────────────────

const Stats = require('../models/Stats');

function getStats(req, res) {
  const stats = Stats.getForUser(req.userId);
  res.json(stats);
}

module.exports = { getStats };
