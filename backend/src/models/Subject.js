// ─────────────────────────────────────────────────────────────
// MODELO DE MATERIA (Subject) — async, SQLite/Postgres
// Todas las consultas filtran por "userId" (cada uno ve lo suyo).
// ─────────────────────────────────────────────────────────────

const { db } = require('../db/database');

const Subject = {
  async create({ userId, name, color }) {
    return db.get(
      'INSERT INTO subjects ("userId", "name", "color") VALUES (?, ?, ?) RETURNING *',
      [userId, name, color]
    );
  },

  async findAllByUser(userId) {
    return db.query(
      'SELECT * FROM subjects WHERE "userId" = ? ORDER BY "createdAt" DESC',
      [userId]
    );
  },

  async findById(id, userId) {
    return db.get('SELECT * FROM subjects WHERE id = ? AND "userId" = ?', [id, userId]);
  },

  async update({ id, userId, name, color }) {
    await db.run(
      'UPDATE subjects SET "name" = ?, "color" = ? WHERE id = ? AND "userId" = ?',
      [name, color, id, userId]
    );
    return this.findById(id, userId);
  },

  async remove(id, userId) {
    const res = await db.run('DELETE FROM subjects WHERE id = ? AND "userId" = ?', [id, userId]);
    return res.changes > 0;
  },
};

module.exports = Subject;
