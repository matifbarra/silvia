// ─────────────────────────────────────────────────────────────
// RUTAS DE ESTADÍSTICAS (protegida)
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const { getStats } = require('../controllers/statsController');
const authRequired = require('../middleware/authMiddleware');

router.use(authRequired);

router.get('/', getStats); // GET /api/stats

module.exports = router;
