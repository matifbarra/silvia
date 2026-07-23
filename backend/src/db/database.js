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

  // ── Migración ──
  // El CREATE de arriba solo corre en instalaciones NUEVAS. Para las
  // tablas que ya existían (con datos), agregamos la columna aparte.
  await ensureColumn('tasks', 'priority', "TEXT NOT NULL DEFAULT 'media'");

  console.log(`🗄️  Base de datos lista (${db.dialect})`);
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
