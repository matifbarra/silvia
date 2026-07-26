// ─────────────────────────────────────────────────────────────
// RUTAS DE CARRERA (plan de estudio + correlativas)
// Todas privadas: el estado del plan es de cada usuario.
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const { getCarrera, getMaterias, setStatus } = require('../controllers/carreraController');
const authRequired = require('../middleware/authMiddleware');

router.use(authRequired);

router.get('/materias', getMaterias); // GET /api/carrera/materias
router.get('/', getCarrera); //          GET /api/carrera
router.put('/', setStatus); //           PUT /api/carrera  { codes, status }

module.exports = router;
