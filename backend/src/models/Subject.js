// ─────────────────────────────────────────────────────────────
// MODELO DE MATERIA (Subject)
// CRUD completo: Create, Read, Update, Delete.
// IMPORTANTE: todas las consultas incluyen userId para que cada
// usuario solo pueda ver/editar/borrar SUS propias materias.
// ─────────────────────────────────────────────────────────────

const db = require('../db/database');

const Subject = {
  // CREATE
  create({ userId, name, color }) {
    const stmt = db.prepare(
      'INSERT INTO subjects (userId, name, color) VALUES (?, ?, ?)'
    );
    const result = stmt.run(userId, name, color);
    return this.findById(result.lastInsertRowid, userId);
  },

  // READ: todas las materias de un usuario (las más nuevas primero)
  findAllByUser(userId) {
    return db
      .prepare('SELECT * FROM subjects WHERE userId = ? ORDER BY createdAt DESC')
      .all(userId);
  },

  // READ: una materia puntual (solo si es de ese usuario)
  findById(id, userId) {
    return db
      .prepare('SELECT * FROM subjects WHERE id = ? AND userId = ?')
      .get(id, userId);
  },

  // UPDATE (solo si la materia es del usuario)
  update({ id, userId, name, color }) {
    db.prepare(
      'UPDATE subjects SET name = ?, color = ? WHERE id = ? AND userId = ?'
    ).run(name, color, id, userId);
    return this.findById(id, userId);
  },

  // DELETE (solo si la materia es del usuario). Devuelve true si borró algo.
  remove(id, userId) {
    const result = db
      .prepare('DELETE FROM subjects WHERE id = ? AND userId = ?')
      .run(id, userId);
    return result.changes > 0;
  },
};

module.exports = Subject;
