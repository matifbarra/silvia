// ─────────────────────────────────────────────────────────────
// MODELO DEL ESTADO DEL PLAN (PlanStatus)
// Guarda, por usuario y por materia del plan, en qué situación estás:
// pendiente / cursando / regular / aprobada.
// ─────────────────────────────────────────────────────────────

const { db } = require('../db/database');

const PlanStatus = {
  // Devuelve un Map { code → status }.
  // Usamos Map y no un array porque el cálculo de correlativas
  // pregunta "¿cómo estoy en la materia 14?" muchísimas veces: con
  // Map eso es instantáneo, con array habría que recorrerlo cada vez.
  async findMapByUser(userId) {
    const rows = await db.query('SELECT "code", "status" FROM plan_status WHERE "userId" = ?', [
      userId,
    ]);
    return new Map(rows.map((r) => [r.code, r.status]));
  },

  // UPSERT: "insertá; si ya existe esta combinación (userId, code),
  // actualizá la fila en vez de fallar".
  //
  // Sin esto habría que hacer un SELECT para ver si existe y después
  // un INSERT o un UPDATE: más viajes a la base y una condición de
  // carrera si llegan dos pedidos juntos. El UPSERT lo resuelve en una
  // sola sentencia atómica.
  //
  // ON CONFLICT ... DO UPDATE lo entienden tanto SQLite (3.24+) como
  // Postgres, así que el mismo SQL nos sirve para las dos.
  // EXCLUDED es la fila que se intentó insertar (la nueva).
  async setMany({ userId, codes, status }) {
    if (codes.length === 0) return [];

    const tuplas = codes.map(() => '(?, ?, ?)').join(', ');
    const params = codes.flatMap((code) => [userId, code, status]);

    return db.query(
      `INSERT INTO plan_status ("userId", "code", "status")
       VALUES ${tuplas}
       ON CONFLICT ("userId", "code")
       DO UPDATE SET "status" = EXCLUDED."status"
       RETURNING *`,
      params
    );
  },

  // Volver a "pendiente" = borrar la fila. Guardar el estado por
  // defecto de las 37 materias sería basura en la base.
  async clearMany({ userId, codes }) {
    if (codes.length === 0) return 0;

    const marcas = codes.map(() => '?').join(', ');
    const res = await db.run(
      `DELETE FROM plan_status WHERE "userId" = ? AND "code" IN (${marcas})`,
      [userId, ...codes]
    );
    return res.changes;
  },
};

module.exports = PlanStatus;
