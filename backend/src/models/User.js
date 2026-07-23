// ─────────────────────────────────────────────────────────────
// MODELO DE USUARIO (ahora con SQLite)
// ¡Mismas funciones que antes (create/findByEmail/findById)!
// Por eso el resto de la app no se enteró del cambio. Lo único
// distinto es que por dentro ahora hablamos SQL con la base real.
//
// db.prepare(...) "prepara" una consulta SQL. Los signos ?
// son huecos que se rellenan con .run()/.get() — esto evita
// la inyección SQL (nunca pegamos valores directo en el texto).
// ─────────────────────────────────────────────────────────────

const db = require('../db/database');

const User = {
  // INSERT: crea un usuario y devuelve el registro completo
  create({ name, email, passwordHash }) {
    const stmt = db.prepare(
      'INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)'
    );
    const result = stmt.run(name, email, passwordHash);
    // result.lastInsertRowid = el id que SQLite le asignó
    return this.findById(result.lastInsertRowid);
  },

  // SELECT por email (devuelve undefined si no existe)
  findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  // SELECT por id
  findById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },
};

module.exports = User;
