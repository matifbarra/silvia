// ─────────────────────────────────────────────────────────────
// MODELO DE TAREA (Task)
// Novedad: el LEFT JOIN. Al listar tareas unimos la tabla tasks
// con subjects para traer, en la misma consulta, el nombre y color
// de la materia asociada. "LEFT" = incluye tareas aunque no tengan
// materia (subjectId NULL) → esas columnas vienen NULL.
// ─────────────────────────────────────────────────────────────

const db = require('../db/database');

// SELECT reutilizable con el JOIN (t = tasks, s = subjects)
const SELECT_WITH_SUBJECT = `
  SELECT
    t.id, t.userId, t.subjectId, t.title, t.dueDate, t.done, t.createdAt,
    s.name  AS subjectName,
    s.color AS subjectColor
  FROM tasks t
  LEFT JOIN subjects s ON s.id = t.subjectId
`;

const Task = {
  // CREATE
  create({ userId, subjectId, title, dueDate }) {
    const stmt = db.prepare(
      'INSERT INTO tasks (userId, subjectId, title, dueDate) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(userId, subjectId || null, title, dueDate || null);
    return this.findById(result.lastInsertRowid, userId);
  },

  // READ: todas las tareas del usuario.
  // Orden: primero las pendientes, luego por fecha de entrega
  // (las que no tienen fecha van al final).
  findAllByUser(userId) {
    return db
      .prepare(
        `${SELECT_WITH_SUBJECT}
         WHERE t.userId = ?
         ORDER BY t.done ASC, (t.dueDate IS NULL) ASC, t.dueDate ASC, t.createdAt DESC`
      )
      .all(userId);
  },

  // READ: una tarea puntual (solo si es del usuario)
  findById(id, userId) {
    return db
      .prepare(`${SELECT_WITH_SUBJECT} WHERE t.id = ? AND t.userId = ?`)
      .get(id, userId);
  },

  // Marca hecha/pendiente (invierte el valor actual)
  toggleDone(id, userId) {
    db.prepare(
      'UPDATE tasks SET done = CASE WHEN done = 1 THEN 0 ELSE 1 END WHERE id = ? AND userId = ?'
    ).run(id, userId);
    return this.findById(id, userId);
  },

  // DELETE (solo si es del usuario). Devuelve true si borró algo.
  remove(id, userId) {
    const result = db
      .prepare('DELETE FROM tasks WHERE id = ? AND userId = ?')
      .run(id, userId);
    return result.changes > 0;
  },
};

module.exports = Task;
