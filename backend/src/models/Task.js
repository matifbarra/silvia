// ─────────────────────────────────────────────────────────────
// MODELO DE TAREA (Task) — async, SQLite/Postgres
// El LEFT JOIN trae el nombre y color de la materia asociada.
// Ojo con las comillas en los alias ("subjectName") para que
// Postgres no los pase a minúscula.
// ─────────────────────────────────────────────────────────────

const { db } = require('../db/database');

const SELECT_WITH_SUBJECT = `
  SELECT t.*, s."name" AS "subjectName", s."color" AS "subjectColor"
  FROM tasks t
  LEFT JOIN subjects s ON s.id = t."subjectId"
`;

const Task = {
  async create({ userId, subjectId, title, dueDate, priority }) {
    const inserted = await db.get(
      'INSERT INTO tasks ("userId", "subjectId", "title", "dueDate", "priority") VALUES (?, ?, ?, ?, ?) RETURNING id',
      [userId, subjectId || null, title, dueDate || null, priority || 'media']
    );
    // Volvemos a leerla con el JOIN para incluir datos de la materia
    return this.findById(inserted.id, userId);
  },

  async findAllByUser(userId) {
    return db.query(
      `${SELECT_WITH_SUBJECT}
       WHERE t."userId" = ?
       ORDER BY t."done" ASC, (t."dueDate" IS NULL) ASC, t."dueDate" ASC, t."createdAt" DESC`,
      [userId]
    );
  },

  async findById(id, userId) {
    return db.get(
      `${SELECT_WITH_SUBJECT} WHERE t.id = ? AND t."userId" = ?`,
      [id, userId]
    );
  },

  async update({ id, userId, title, dueDate, subjectId, priority }) {
    await db.run(
      'UPDATE tasks SET "title" = ?, "dueDate" = ?, "subjectId" = ?, "priority" = ? WHERE id = ? AND "userId" = ?',
      [title, dueDate, subjectId, priority, id, userId]
    );
    // La releemos con el JOIN para devolver también los datos de la materia
    return this.findById(id, userId);
  },

  async toggleDone(id, userId) {
    await db.run(
      'UPDATE tasks SET "done" = CASE WHEN "done" = 1 THEN 0 ELSE 1 END WHERE id = ? AND "userId" = ?',
      [id, userId]
    );
    return this.findById(id, userId);
  },

  async remove(id, userId) {
    const res = await db.run('DELETE FROM tasks WHERE id = ? AND "userId" = ?', [id, userId]);
    return res.changes > 0;
  },
};

module.exports = Task;
