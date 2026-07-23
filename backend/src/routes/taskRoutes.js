// ─────────────────────────────────────────────────────────────
// RUTAS DE TAREAS (todas privadas)
// Nota el método PATCH para "toggle": PATCH se usa para cambios
// parciales (acá solo tocamos el estado done, no toda la tarea).
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const { getAll, create, update, toggle, remove } = require('../controllers/taskController');
const authRequired = require('../middleware/authMiddleware');

router.use(authRequired); // todo requiere token

router.get('/', getAll); //              GET    /api/tasks
router.post('/', create); //             POST   /api/tasks
router.put('/:id', update); //           PUT    /api/tasks/:id
router.patch('/:id/toggle', toggle); //  PATCH  /api/tasks/:id/toggle
router.delete('/:id', remove); //        DELETE /api/tasks/:id

module.exports = router;
