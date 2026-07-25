// ─────────────────────────────────────────────────────────────
// CAPA DE BASE DE DATOS (soporta SQLite y PostgreSQL)
//
// Idea: un mismo código de modelos sirve para las dos bases.
//   - Si existe DATABASE_URL (Render)  → usamos PostgreSQL (async)
//   - Si no (tu compu)                 → usamos SQLite (sin instalar nada)
//
// Exponemos 3 funciones async unificadas: query / get / run.
// Los modelos escriben SQL con placeholders "?" y comillas dobles
// en los nombres de columnas (ej: "userId"). Eso funciona en ambas:
// SQLite y Postgres respetan las comillas dobles como identificadores.
// Para Postgres, traducimos los "?" a $1, $2, ... automáticamente.
// ─────────────────────────────────────────────────────────────

const usePostgres = !!process.env.DATABASE_URL;

// Traduce los "?" a $1, $2, ... (lo que espera Postgres)
function toPgPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

let db; // { query, get, run } — todas async

if (usePostgres) {
  // ─── PostgreSQL ────────────────────────────────────────────
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Render exige SSL. En una base local no haría falta.
    ssl: process.env.DATABASE_URL.includes('localhost')
      ? false
      : { rejectUnauthorized: false },
  });

  db = {
    dialect: 'postgres',
    async query(sql, params = []) {
      const res = await pool.query(toPgPlaceholders(sql), params);
      return res.rows;
    },
    async get(sql, params = []) {
      const res = await pool.query(toPgPlaceholders(sql), params);
      return res.rows[0];
    },
    async run(sql, params = []) {
      const res = await pool.query(toPgPlaceholders(sql), params);
      return { changes: res.rowCount, rows: res.rows };
    },
  };
} else {
  // ─── SQLite ────────────────────────────────────────────────
  const Database = require('better-sqlite3');
  const path = require('path');

  const dbDir = process.env.DATABASE_DIR || __dirname;
  const sqlite = new Database(path.join(dbDir, 'silvia.db'));
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  // better-sqlite3 es síncrono; lo envolvemos en funciones async
  // para que los modelos usen la misma interfaz que con Postgres.
  db = {
    dialect: 'sqlite',
    async query(sql, params = []) {
      return sqlite.prepare(sql).all(...params);
    },
    async get(sql, params = []) {
      return sqlite.prepare(sql).get(...params);
    },
    async run(sql, params = []) {
      const info = sqlite.prepare(sql).run(...params);
      return { changes: info.changes, rows: [] };
    },
  };
}

// ─── Creación de tablas (DDL específico por base) ────────────
// La única diferencia real entre bases es cómo se declara el id
// autoincremental y el tipo de fecha por defecto.
async function initDb() {
  const idColumn = usePostgres
    ? 'id SERIAL PRIMARY KEY'
    : 'id INTEGER PRIMARY KEY AUTOINCREMENT';
  const nowDefault = usePostgres ? "NOW()::text" : "datetime('now')";

  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      ${idColumn},
      "name"         TEXT NOT NULL,
      "email"        TEXT NOT NULL UNIQUE,
      "passwordHash" TEXT NOT NULL,
      "createdAt"    TEXT NOT NULL DEFAULT (${nowDefault})
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS subjects (
      ${idColumn},
      "userId"    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "name"      TEXT NOT NULL,
      "color"     TEXT NOT NULL DEFAULT 'indigo',
      "year"      INTEGER,
      "createdAt" TEXT NOT NULL DEFAULT (${nowDefault})
    )
  `);

  await db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
      ${idColumn},
      "userId"    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "subjectId" INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
      "title"     TEXT NOT NULL,
      "dueDate"   TEXT,
      "done"      INTEGER NOT NULL DEFAULT 0,
      "priority"  TEXT NOT NULL DEFAULT 'media',
      "createdAt" TEXT NOT NULL DEFAULT (${nowDefault})
    )
  `);

  // Estado de cada materia DEL PLAN para cada usuario.
  //
  // Tabla aparte de "subjects" a propósito: podés marcar "Análisis I
  // aprobada" sin tener que agregarla a Mis Materias (ya no la cursás).
  // Son dos cosas distintas: tu historia académica vs. lo que llevás hoy.
  //
  // El UNIQUE("userId","code") es la clave del asunto: garantiza que
  // no haya dos estados para la misma materia, y es lo que después nos
  // habilita a hacer un UPSERT (insertar o actualizar en una sola query).
  await db.run(`
    CREATE TABLE IF NOT EXISTS plan_status (
      ${idColumn},
      "userId"    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "code"      INTEGER NOT NULL,
      "status"    TEXT NOT NULL,
      "updatedAt" TEXT NOT NULL DEFAULT (${nowDefault}),
      UNIQUE ("userId", "code")
    )
  `);

  // ── El plan de estudio (materias + correlativas) ──
  //
  // Antes esto vivía en un archivo .js. Lo movimos a la base para poder
  // corregir una correlativa mal cargada sin tener que editar código,
  // commitear y esperar un redeploy.
  //
  // Ojo con la clave primaria: acá NO hay un id autoincremental. El
  // número de materia del plan (1, 2, ... 36, 99) ya identifica de forma
  // única y estable a cada una en el mundo real: es una CLAVE NATURAL.
  // Agregarle un id al lado sería un identificador de más que no
  // significa nada y que habría que mantener sincronizado.
  await db.run(`
    CREATE TABLE IF NOT EXISTS plan_subjects (
      "code" INTEGER PRIMARY KEY,
      "year" INTEGER NOT NULL,
      "name" TEXT NOT NULL,
      "note" TEXT
    )
  `);

  // Las correlativas: cada FILA es "para cursar la materia X necesito
  // la materia Y en tal condición".
  //
  // En el archivo .js esto era un array (regular: [13, 16]). Un array no
  // entra en una columna: en el modelo relacional, cada elemento de la
  // lista se convierte en una fila. Base de Datos (19) pasa de ser una
  // materia con dos arrays a ser cuatro filas.
  //
  // Es una relación N:N REFLEXIVA: la tabla se apunta a sí misma dos
  // veces (materia ↔ materia), igual que "usuario sigue a usuario".
  //
  // La ventaja concreta: ahora se puede preguntar al revés. "¿Qué
  // destraba aprobar Análisis II?" es WHERE "requires" = 9, algo que
  // con los arrays en JS obligaba a recorrer las 37 materias.
  await db.run(`
    CREATE TABLE IF NOT EXISTS plan_correlativas (
      "code"     INTEGER NOT NULL REFERENCES plan_subjects("code") ON DELETE CASCADE,
      "requires" INTEGER NOT NULL REFERENCES plan_subjects("code") ON DELETE CASCADE,
      "kind"     TEXT NOT NULL,
      UNIQUE ("code", "requires", "kind")
    )
  `);

  // ── Migración ──
  // El CREATE de arriba solo corre en instalaciones NUEVAS. Para las
  // tablas que ya existían (con datos), agregamos la columna aparte.
  await ensureColumn('tasks', 'priority', "TEXT NOT NULL DEFAULT 'media'");
  // "year" = nivel del plan de estudio (1 a 5). Va SIN "NOT NULL" a propósito:
  // las materias que ya existían quedan en NULL ("sin año") y las materias
  // inventadas por el usuario tampoco están obligadas a tener nivel.
  await ensureColumn('subjects', 'year', 'INTEGER');

  await seedPlanIfEmpty();

  console.log(`🗄️  Base de datos lista (${db.dialect})`);
}

// Carga el plan de estudio SOLO si la tabla está vacía.
//
// Este es el cambio de rol importante: data/planSistemas.js deja de ser
// la fuente de verdad y pasa a ser la SEMILLA (el estado inicial).
//   - Base nueva  → arranca con el plan completo, sin cargar nada a mano.
//   - Base con datos → no se toca, así tus correcciones sobreviven a
//     cada redeploy. Si el seed pisara los datos siempre, editar la base
//     no serviría de nada: el próximo deploy borraría los cambios.
async function seedPlanIfEmpty() {
  const [fila] = await db.query('SELECT COUNT(*) AS n FROM plan_subjects');

  // Number() no es decorativo: en Postgres, COUNT devuelve un bigint y
  // el driver lo entrega como STRING para no perder precisión. Sin la
  // conversión, "0" > 0 sería false pero la comparación con datos daría
  // resultados raros según el operador. Comparamos números con números.
  if (Number(fila.n) > 0) return;

  // require acá adentro y no arriba de todo: así el archivo de semilla
  // se carga solo la primera vez, y queda claro que es una dependencia
  // del arranque y no de la operación normal de la app.
  const { PLAN_SISTEMAS, NOTAS_ESPECIALES } = require('../data/planSistemas');

  // Un INSERT con 37 tuplas en vez de 37 INSERT. Además de ser mucho
  // más rápido, es atómico: entran todas o no entra ninguna.
  const tuplasMaterias = PLAN_SISTEMAS.map(() => '(?, ?, ?, ?)').join(', ');
  await db.run(
    `INSERT INTO plan_subjects ("code", "year", "name", "note") VALUES ${tuplasMaterias}`,
    PLAN_SISTEMAS.flatMap((m) => [m.code, m.year, m.name, NOTAS_ESPECIALES[m.code] ?? null])
  );

  // Acá se ve el "aplanado": los dos arrays de cada materia se
  // convierten en una fila por cada correlativa.
  const deps = PLAN_SISTEMAS.flatMap((m) => [
    ...m.regular.map((requiere) => [m.code, requiere, 'regular']),
    ...m.aprobada.map((requiere) => [m.code, requiere, 'aprobada']),
  ]);

  if (deps.length > 0) {
    const tuplasDeps = deps.map(() => '(?, ?, ?)').join(', ');
    await db.run(
      `INSERT INTO plan_correlativas ("code", "requires", "kind") VALUES ${tuplasDeps}`,
      deps.flat()
    );
  }

  console.log(`🌱 Plan cargado: ${PLAN_SISTEMAS.length} materias, ${deps.length} correlativas`);
}

// Agrega una columna solo si todavía no existe (idempotente en ambas bases).
// Postgres tiene "IF NOT EXISTS"; SQLite no, así que ahí intentamos el ALTER
// y si falla porque la columna ya está, ignoramos ese error puntual.
async function ensureColumn(table, column, definition) {
  if (usePostgres) {
    await db.run(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS "${column}" ${definition}`);
  } else {
    try {
      await db.run(`ALTER TABLE ${table} ADD COLUMN "${column}" ${definition}`);
    } catch (err) {
      if (!/duplicate column/i.test(err.message)) throw err; // otro error → sí lo propagamos
    }
  }
}

module.exports = { db, initDb };
