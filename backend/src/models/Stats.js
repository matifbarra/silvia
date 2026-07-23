// ─────────────────────────────────────────────────────────────
// MODELO DE ESTADÍSTICAS
// No guarda datos nuevos: solo RESUME lo que ya hay con funciones
// de agregación de SQL (COUNT, SUM, GROUP BY). Todo filtrado por
// userId para que cada uno vea solo sus propios números.
// ─────────────────────────────────────────────────────────────

const db = require('../db/database');

const Stats = {
  getForUser(userId) {
    // ─── Números generales ───────────────────────────────────
    // Subconsultas: cada (SELECT ...) devuelve un único número.
    const totals = db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM subjects WHERE userId = @u)                         AS totalSubjects,
           (SELECT COUNT(*) FROM tasks    WHERE userId = @u)                         AS totalTasks,
           (SELECT COUNT(*) FROM tasks    WHERE userId = @u AND done = 1)            AS doneTasks,
           (SELECT COUNT(*) FROM tasks    WHERE userId = @u AND done = 0
                                            AND dueDate IS NOT NULL
                                            AND dueDate < date('now'))               AS overdueTasks`
      )
      .get({ u: userId });

    const pendingTasks = totals.totalTasks - totals.doneTasks;
    const progress =
      totals.totalTasks > 0
        ? Math.round((totals.doneTasks / totals.totalTasks) * 100)
        : 0;

    // ─── Tareas por materia (GROUP BY) ───────────────────────
    // LEFT JOIN desde subjects para incluir materias con 0 tareas.
    const perSubject = db
      .prepare(
        `SELECT
           s.id    AS subjectId,
           s.name  AS name,
           s.color AS color,
           COUNT(t.id)                                AS total,
           SUM(CASE WHEN t.done = 1 THEN 1 ELSE 0 END) AS done
         FROM subjects s
         LEFT JOIN tasks t ON t.subjectId = s.id AND t.userId = s.userId
         WHERE s.userId = ?
         GROUP BY s.id
         ORDER BY total DESC, s.name ASC`
      )
      .all(userId);

    return {
      totalSubjects: totals.totalSubjects,
      totalTasks: totals.totalTasks,
      doneTasks: totals.doneTasks,
      pendingTasks,
      overdueTasks: totals.overdueTasks,
      progress,
      perSubject: perSubject.map((r) => ({ ...r, done: r.done || 0 })),
    };
  },
};

module.exports = Stats;
