// ─────────────────────────────────────────────────────────────
// CONEXIÓN A LA BASE DE DATOS (SQLite)
// better-sqlite3 abre (o crea) un archivo .db y nos deja correr SQL.
// Es síncrono: cada consulta devuelve el resultado al instante,
// sin promesas ni async/await. Ideal para aprender.
// ─────────────────────────────────────────────────────────────

const Database = require('better-sqlite3');
const path = require('path');

// Dónde guardar el archivo de la base:
// - En local: junto a este archivo (backend/src/db/silvia.db)
// - En producción: en DATABASE_DIR (ej: un disco persistente de Render)
const dbDir = process.env.DATABASE_DIR || __dirname;
const dbPath = path.join(dbDir, 'silvia.db');
const db = new Database(dbPath);

// Mejora la concurrencia y el rendimiento (modo recomendado)
db.pragma('journal_mode = WAL');
// Hace que SQLite respete las foreign keys (relaciones entre tablas)
db.pragma('foreign_keys = ON');

// ─── Creación de tablas ────────────────────────────────────────
// "IF NOT EXISTS" = solo las crea la primera vez. En arranques
// siguientes no hace nada, así que es seguro correr esto siempre.

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    email        TEXT    NOT NULL UNIQUE,
    passwordHash TEXT    NOT NULL,
    createdAt    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    userId    INTEGER NOT NULL,
    name      TEXT    NOT NULL,
    color     TEXT    NOT NULL DEFAULT 'indigo',
    createdAt TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    userId    INTEGER NOT NULL,
    subjectId INTEGER,                              -- puede ser NULL (tarea sin materia)
    title     TEXT    NOT NULL,
    dueDate   TEXT,                                 -- fecha de entrega (YYYY-MM-DD), opcional
    done      INTEGER NOT NULL DEFAULT 0,           -- 0 = pendiente, 1 = hecha
    createdAt TEXT    NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (userId)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE
  );
`);

console.log('🗄️  Base de datos SQLite lista');

module.exports = db;
