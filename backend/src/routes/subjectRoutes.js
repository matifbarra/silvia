// ─────────────────────────────────────────────────────────────
// RUTAS DE MATERIAS (todas privadas)
// router.use(authRequired) aplica el middleware a TODAS las rutas
// de abajo. Así no hay que repetirlo en cada una.
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const { getAll, create, update, remove } = require('../controllers/subjectController');
const authRequired = require('../middleware/authMiddleware');

// A partir de acá, todo requiere token válido
router.use(authRequired);

router.get('/', getAll); //          GET    /api/subjects
router.post('/', create); //         POST   /api/subjects
router.put('/:id', update); //       PUT    /api/subjects/:id
router.delete('/:id', remove); //    DELETE /api/subjects/:id

module.exports = router;
