// ─────────────────────────────────────────────────────────────
// MODELO DE ESTADÍSTICAS — async, SQLite/Postgres
// Detalles importantes para que ande en ambas bases:
//  - CAST(COUNT(...) AS INTEGER): Postgres devuelve los COUNT como
//    texto por defecto; el CAST los normaliza a número en las dos.
//  - "today" lo calculamos en JS y lo pasamos como parámetro, así
//    evitamos funciones de fecha distintas entre bases.
// ─────────────────────────────────────────────────────────────

const { db } = require('../db/database');

const Stats = {
  async getForUser(userId) {
    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    const totals = await db.get(
      `SELECT
         (SELECT CAST(COUNT(*) AS INTEGER) FROM subjects WHERE "userId" = ?) AS "totalSubjects",
         (SELECT CAST(COUNT(*) AS INTEGER) FROM tasks    WHERE "userId" = ?) AS "totalTasks",
         (SELECT CAST(COUNT(*) AS INTEGER) FROM tasks    WHERE "userId" = ? AND "done" = 1) AS "doneTasks",
         (SELECT CAST(COUNT(*) AS INTEGER) FROM tasks    WHERE "userId" = ? AND "done" = 0
                                             AND "dueDate" IS NOT NULL
                                             AND "dueDate" < ?) AS "overdueTasks"`,
      [userId, userId, userId, userId, today]
    );

    const pendingTasks = totals.totalTasks - totals.doneTasks;
    const progress =
      totals.totalTasks > 0
        ? Math.round((totals.doneTasks / totals.totalTasks) * 100)
        : 0;

    const perSubject = await db.query(
      `SELECT
         s.id      AS "subjectId",
         s."name"  AS "name",
         s."color" AS "color",
         CAST(COUNT(t.id) AS INTEGER)                                 AS "total",
         CAST(SUM(CASE WHEN t."done" = 1 THEN 1 ELSE 0 END) AS INTEGER) AS "done"
       FROM subjects s
       LEFT JOIN tasks t ON t."subjectId" = s.id AND t."userId" = s."userId"
       WHERE s."userId" = ?
       GROUP BY s.id, s."name", s."color"
       ORDER BY "total" DESC, s."name" ASC`,
      [userId]
    );

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
