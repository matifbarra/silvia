// ─────────────────────────────────────────────────────────────
// RUTAS DE AUTENTICACIÓN
// Aquí conectamos cada URL con su función del controller.
// Todas cuelgan de /api/auth (lo definimos en server.js).
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();

const { register, login, me } = require('../controllers/authController');
const authRequired = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', register); // POST /api/auth/register
router.post('/login', login); //     POST /api/auth/login

// Ruta protegida: el middleware authRequired corre ANTES del controller me
router.get('/me', authRequired, me); // GET /api/auth/me

module.exports = router;
