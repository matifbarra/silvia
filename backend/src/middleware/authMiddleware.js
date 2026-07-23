// ─────────────────────────────────────────────────────────────
// MIDDLEWARE DE AUTENTICACIÓN
// Un "middleware" es una función que se ejecuta ANTES del controller.
// Este revisa que la request traiga un token válido. Si lo tiene,
// deja pasar (next()); si no, corta con un error 401.
// Lo usamos para proteger rutas privadas.
// ─────────────────────────────────────────────────────────────

const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  // El token viene en el header:  Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado: falta el token' });
  }

  // Separamos "Bearer" del token en sí
  const token = authHeader.split(' ')[1];

  try {
    // verify() revisa la firma y que no esté expirado.
    // Si algo falla, lanza un error y caemos en el catch.
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Guardamos el id del usuario para que el controller lo pueda usar
    req.userId = payload.id;

    next(); // todo OK → continuamos a la ruta
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
}

module.exports = authRequired;
