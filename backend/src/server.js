const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./db/database'); // abre la base y crea las tablas al arrancar

const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS: en producción solo permitimos el dominio del frontend (FRONTEND_URL).
// Si no está definida (desarrollo), permitimos cualquier origen.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
  })
);
app.use(express.json());

// Ruta de prueba (para verificar que el server vive)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

// Rutas de autenticación → todo lo de authRoutes cuelga de /api/auth
app.use('/api/auth', authRoutes);

// Rutas de materias → cuelgan de /api/subjects (todas protegidas)
app.use('/api/subjects', subjectRoutes);

// Rutas de tareas → cuelgan de /api/tasks (todas protegidas)
app.use('/api/tasks', taskRoutes);

// Rutas de estadísticas → cuelgan de /api/stats (protegida)
app.use('/api/stats', statsRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
