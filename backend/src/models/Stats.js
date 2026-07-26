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

    // Antes el primer contador era "cuántas materias tenés cargadas".
    // Esa pregunta murió con la tabla subjects: las materias ya no se
    // cargan, son las 37 del plan para todo el mundo. La versión útil
    // es cuántas estás cursando AHORA, que sí es tuya y cambia.
    const totals = await db.get(
      `SELECT
         (SELECT CAST(COUNT(*) AS INTEGER) FROM plan_status
                                            WHERE "userId" = ? AND "status" = 'cursando') AS "cursando",
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

    // Antes era un LEFT JOIN desde subjects, porque tenía sentido
    // mostrar una materia tuya aunque no tuviera tareas. Ahora el lado
    // de las materias son las 37 del plan: con LEFT JOIN el gráfico
    // saldría con 30 barras en cero. Arrancamos desde tasks y el JOIN
    // pasa a ser INNER: solo aparecen las materias en las que hiciste algo.
    const perSubject = await db.query(
      `SELECT
         ps."code" AS "code",
         ps."name" AS "name",
         ps."year" AS "year",
         CAST(COUNT(t.id) AS INTEGER)                                   AS "total",
         CAST(SUM(CASE WHEN t."done" = 1 THEN 1 ELSE 0 END) AS INTEGER) AS "done"
       FROM tasks t
       JOIN plan_subjects ps ON ps."code" = t."code"
       WHERE t."userId" = ?
       GROUP BY ps."code", ps."name", ps."year"
       ORDER BY "total" DESC, ps."name" ASC`,
      [userId]
    );

    return {
      cursando: totals.cursando,
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
