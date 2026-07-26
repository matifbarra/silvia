// ─────────────────────────────────────────────────────────────
// MODELO DE TAREA (Task) — async, SQLite/Postgres
//
// El LEFT JOIN trae el nombre y el año de la materia del plan.
// Que sea LEFT y no INNER es lo que permite que una tarea sin materia
// (o con un código que ya no existe) igual aparezca en la lista: el
// INNER la haría desaparecer.
//
// No traemos color porque el plan no tiene: el color sale del AÑO, y
// eso lo decide el frontend. Guardar en la base un dato que solo sirve
// para pintar sería mezclar el dominio con la presentación.
//
// Ojo con las comillas en los alias ("subjectName") para que
// Postgres no los pase a minúscula.
// ─────────────────────────────────────────────────────────────

const { db } = require('../db/database');

const SELECT_WITH_SUBJECT = `
  SELECT t.*, ps."name" AS "subjectName", ps."year" AS "subjectYear"
  FROM tasks t
  LEFT JOIN plan_subjects ps ON ps."code" = t."code"
`;

const Task = {
  async create({ userId, code, title, dueDate, priority }) {
    const inserted = await db.get(
      'INSERT INTO tasks ("userId", "code", "title", "dueDate", "priority") VALUES (?, ?, ?, ?, ?) RETURNING id',
      [userId, code ?? null, title, dueDate || null, priority || 'media']
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

  async update({ id, userId, title, dueDate, code, priority }) {
    await db.run(
      'UPDATE tasks SET "title" = ?, "dueDate" = ?, "code" = ?, "priority" = ? WHERE id = ? AND "userId" = ?',
      [title, dueDate, code ?? null, priority, id, userId]
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
