// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE ESTADÍSTICAS
// Devuelve el resumen del usuario actual (req.userId).
// ─────────────────────────────────────────────────────────────

const Stats = require('../models/Stats');

async function getStats(req, res) {
  const stats = await Stats.getForUser(req.userId);
  res.json(stats);
}

module.exports = { getStats };
