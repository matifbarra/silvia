// ─────────────────────────────────────────────────────────────
// MODELO DEL PLAN DE ESTUDIO
//
// El plan (materias + correlativas) vive ahora en la base, en dos
// tablas: plan_subjects y plan_correlativas. Este modelo se encarga
// de leerlo y de devolverlo con la forma que el resto de la app ya
// esperaba: { code, year, name, note, regular: [...], aprobada: [...] }
//
// O sea: cambió DÓNDE está el dato, no cómo lo consumen los
// controladores. Eso es exactamente para lo que sirve tener una capa
// de modelos en el medio.
// ─────────────────────────────────────────────────────────────

const { db } = require('../db/database');

// Los dos tipos de correlativa que existen. Lo usamos para ignorar
// cualquier valor raro que alguien haya metido a mano en la base.
const KINDS = ['regular', 'aprobada'];

const Plan = {
  // Plan completo, con las correlativas ya agrupadas por materia.
  //
  // Son DOS consultas, no 38. La tentación es traer las materias y
  // después, por cada una, pedirle sus correlativas: eso es el
  // problema "N+1" (1 consulta + N consultas). Con 37 materias serían
  // 38 idas y vueltas a la base. Traemos las dos listas enteras y las
  // unimos acá en memoria, que es gratis al lado de un viaje de red.
  async findAll() {
    const materias = await db.query(
      'SELECT "code", "year", "name", "note" FROM plan_subjects ORDER BY "year", "code"'
    );
    const deps = await db.query(
      'SELECT "code", "requires", "kind" FROM plan_correlativas ORDER BY "requires"'
    );

    // Un Map para poder colgarle las correlativas a cada materia en
    // O(1), en vez de buscarla en el array cada vez.
    const porCode = new Map(
      materias.map((m) => [m.code, { ...m, regular: [], aprobada: [] }])
    );

    for (const dep of deps) {
      const materia = porCode.get(dep.code);
      if (materia && KINDS.includes(dep.kind)) materia[dep.kind].push(dep.requires);
    }

    return [...porCode.values()];
  },

  // Set de codes válidos, para validar lo que manda el cliente.
  // Devolvemos un Set y no un array porque la pregunta que vamos a
  // hacer es "¿existe este code?" y en un Set eso es O(1).
  async findCodes() {
    const rows = await db.query('SELECT "code" FROM plan_subjects');
    return new Set(rows.map((r) => r.code));
  },

  // Años que existen en el plan (1..5 hoy). Sale de la base, así que
  // si mañana el plan cambia no hay que tocar código.
  async findYears() {
    const rows = await db.query(
      'SELECT DISTINCT "year" FROM plan_subjects ORDER BY "year"'
    );
    return rows.map((r) => r.year);
  },
};

module.exports = Plan;
