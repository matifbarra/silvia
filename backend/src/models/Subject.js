// ─────────────────────────────────────────────────────────────
// MODELO DE MATERIA (Subject) — async, SQLite/Postgres
// Todas las consultas filtran por "userId" (cada uno ve lo suyo).
// ─────────────────────────────────────────────────────────────

const { db } = require('../db/database');

const Subject = {
  async create({ userId, name, color, year }) {
    return db.get(
      'INSERT INTO subjects ("userId", "name", "color", "year") VALUES (?, ?, ?, ?) RETURNING *',
      [userId, name, color, year ?? null]
    );
  },

  // Inserta VARIAS materias en UNA sola consulta.
  //
  // En vez de hacer un INSERT por materia (8 idas y vueltas a la base
  // para importar 1er año), armamos un solo INSERT con varias tuplas:
  //   INSERT INTO subjects (...) VALUES (?,?,?,?), (?,?,?,?), (?,?,?,?)
  // y mandamos todos los parámetros aplanados en un único array.
  // Es más rápido y además es atómico: entran todas o no entra ninguna.
  async createMany(userId, items) {
    if (items.length === 0) return [];

    const tuplas = items.map(() => '(?, ?, ?, ?)').join(', ');
    // flatMap: [{name,color,year}, ...] → [userId, name, color, year, userId, name, ...]
    const params = items.flatMap((m) => [userId, m.name, m.color, m.year ?? null]);

    return db.query(
      `INSERT INTO subjects ("userId", "name", "color", "year") VALUES ${tuplas} RETURNING *`,
      params
    );
  },

  // Ordenamos por año y después por nombre para que la lista salga
  // ya agrupada del backend. NULLS LAST deja las materias "sin año"
  // al final (SQLite ordena NULL primero por defecto; Postgres, último).
  async findAllByUser(userId) {
    return db.query(
      `SELECT * FROM subjects
       WHERE "userId" = ?
       ORDER BY CASE WHEN "year" IS NULL THEN 1 ELSE 0 END, "year", "name"`,
      [userId]
    );
  },

  // Nombres que el usuario ya tiene (en minúsculas), para no importar duplicados
  async findNamesByUser(userId) {
    const rows = await db.query('SELECT "name" FROM subjects WHERE "userId" = ?', [userId]);
    return new Set(rows.map((r) => r.name.trim().toLowerCase()));
  },

  async findById(id, userId) {
    return db.get('SELECT * FROM subjects WHERE id = ? AND "userId" = ?', [id, userId]);
  },

  async update({ id, userId, name, color, year }) {
    await db.run(
      'UPDATE subjects SET "name" = ?, "color" = ?, "year" = ? WHERE id = ? AND "userId" = ?',
      [name, color, year ?? null, id, userId]
    );
    return this.findById(id, userId);
  },

  async remove(id, userId) {
    const res = await db.run('DELETE FROM subjects WHERE id = ? AND "userId" = ?', [id, userId]);
    return res.changes > 0;
  },
};

module.exports = Subject;
