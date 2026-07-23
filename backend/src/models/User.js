// ─────────────────────────────────────────────────────────────
// MODELO DE USUARIO
// Ahora las funciones son async (devuelven Promise) porque la capa
// de base es async. Usamos "?" como placeholder y comillas dobles
// en columnas camelCase (funciona en SQLite y Postgres).
// RETURNING * nos devuelve la fila recién insertada en ambas bases.
// ─────────────────────────────────────────────────────────────

const { db } = require('../db/database');

const User = {
  async create({ name, email, passwordHash }) {
    return db.get(
      'INSERT INTO users ("name", "email", "passwordHash") VALUES (?, ?, ?) RETURNING *',
      [name, email, passwordHash]
    );
  },

  async findByEmail(email) {
    return db.get('SELECT * FROM users WHERE "email" = ?', [email]);
  },

  async findById(id) {
    return db.get('SELECT * FROM users WHERE id = ?', [id]);
  },
};

module.exports = User;
