// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE AUTENTICACIÓN
// Aquí vive la LÓGICA de registro, login y "quién soy".
// Los controllers reciben la request (req), hacen el trabajo,
// y mandan la respuesta (res).
// ─────────────────────────────────────────────────────────────

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_EXPIRES_IN = '7d'; // el token dura 7 días

// Función auxiliar: genera un token firmado con el id del usuario
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// ─── POST /api/auth/register ───────────────────────────────────
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // 1. Validar que llegaron todos los datos
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Faltan datos: name, email y password son obligatorios' });
    }

    // 2. Verificar que el email no esté ya registrado
    if (User.findByEmail(email)) {
      return res.status(409).json({ message: 'Ese email ya está registrado' });
    }

    // 3. Hashear la contraseña (el 10 es el "costo": más alto = más seguro pero más lento)
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Crear el usuario
    const user = User.create({ name, email, passwordHash });

    // 5. Generar el token
    const token = generateToken(user.id);

    // 6. Responder — OJO: nunca devolvemos el passwordHash
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

// ─── POST /api/auth/login ──────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Faltan datos: email y password son obligatorios' });
    }

    // 1. Buscar el usuario
    const user = User.findByEmail(email);
    // Nota: damos el mismo mensaje si el email no existe o si la password
    // es incorrecta, para no revelar qué emails están registrados.
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 2. Comparar la password enviada con el hash guardado
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // 3. Generar token
    const token = generateToken(user.id);

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}

// ─── GET /api/auth/me ──────────────────────────────────────────
// Ruta PROTEGIDA: solo funciona con un token válido.
// El middleware ya puso el id del usuario en req.userId.
function me(req, res) {
  const user = User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}

module.exports = { register, login, me };
