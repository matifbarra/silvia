// ─────────────────────────────────────────────────────────────
// EXPLORADOR DE LA BASE DE PRODUCCIÓN (solo lectura)
//
// Para qué: mirar las tablas y los datos de la Postgres de Render
// sin instalar psql ni ningún programa extra. Usa el paquete "pg"
// que el backend ya tiene como dependencia.
//
// Uso:
//   node scripts/db.js                     → lista las tablas y cuántas filas tiene cada una
//   node scripts/db.js users               → estructura de la tabla + primeras 20 filas
//   node scripts/db.js users 100           → lo mismo pero 100 filas
//   node scripts/db.js "SELECT ..."        → una consulta tuya
//
// ⚠️ Es SOLO LECTURA, y no por buena voluntad: abrimos una transacción
// con SET TRANSACTION READ ONLY, así que el que rechaza cualquier
// INSERT/UPDATE/DELETE/DROP es el propio Postgres. Un filtro hecho con
// expresiones regulares sobre el texto de la query siempre se puede
// esquivar; esto no.
// ─────────────────────────────────────────────────────────────

const path = require('path');

// OJO: leemos .env.local, NO .env.
// Motivo: el servidor de desarrollo lee .env, y si le metés ahí el
// DATABASE_URL de producción, "npm run dev" deja de usar SQLite y
// empieza a escribir en la base real sin avisarte. Separados no pasa.
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { Pool } = require('pg');

const URL = process.env.DATABASE_URL;
if (!URL) {
  console.error(`
❌ Falta DATABASE_URL.

Creá el archivo  backend/.env.local  con una sola línea:

   DATABASE_URL=postgresql://usuario:clave@host.oregon-postgres.render.com/silvia

Ese valor sale de Render → tu base silvia-db → Connect → External Database URL.
(.env.local ya está en .gitignore, así que no se sube a GitHub.)
`);
  process.exit(1);
}

const pool = new Pool({
  connectionString: URL,
  // Render exige SSL, y su certificado no valida contra las CA del sistema.
  ssl: URL.includes('localhost') ? false : { rejectUnauthorized: false },
});

// Corre una consulta dentro de una transacción de solo lectura.
async function readOnly(sql, params = []) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SET TRANSACTION READ ONLY');
    const res = await client.query(sql, params);
    return res.rows;
  } finally {
    // ROLLBACK siempre: no hay nada que confirmar y así el pool
    // devuelve la conexión limpia aunque la consulta haya fallado.
    await client.query('ROLLBACK').catch(() => {});
    client.release();
  }
}

// ── Modo 1: sin argumentos → panorama general ────────────────
async function listarTablas() {
  // information_schema es el catálogo estándar de SQL: metadatos sobre
  // la propia base. 'public' es el esquema por defecto en Postgres.
  const tablas = await readOnly(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  if (tablas.length === 0) {
    console.log('La base está vacía (ninguna tabla en el esquema public).');
    return;
  }

  console.log('\n📋 Tablas en producción:\n');
  for (const { table_name } of tablas) {
    // Las comillas dobles evitan que Postgres pase el nombre a minúsculas.
    const [{ n }] = await readOnly(`SELECT COUNT(*)::int AS n FROM "${table_name}"`);
    console.log(`   ${table_name.padEnd(14)} ${String(n).padStart(5)} filas`);
  }
  console.log('\nPara ver una:  node scripts/db.js <tabla>\n');
}

// ── Modo 2: nombre de tabla → estructura + filas ─────────────
async function verTabla(tabla, limite) {
  const columnas = await readOnly(
    `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1
     ORDER BY ordinal_position`,
    [tabla]
  );

  if (columnas.length === 0) {
    console.error(`❌ No existe la tabla "${tabla}". Corré el script sin argumentos para ver la lista.`);
    process.exitCode = 1;
    return;
  }

  console.log(`\n🏗️  Estructura de "${tabla}":\n`);
  console.table(
    columnas.map((c) => ({
      columna: c.column_name,
      tipo: c.data_type,
      acepta_null: c.is_nullable === 'YES' ? 'sí' : 'no',
    }))
  );

  const filas = await readOnly(`SELECT * FROM "${tabla}" ORDER BY 1 LIMIT ${limite}`);
  console.log(`\n📄 Primeras ${filas.length} filas:\n`);
  if (filas.length === 0) console.log('   (vacía)\n');
  else console.table(filas);
}

async function main() {
  const [arg, arg2] = process.argv.slice(2);
  const limite = Number.parseInt(arg2, 10) || 20;

  if (!arg) return listarTablas();
  // Si tiene espacios asumimos que es SQL; si no, un nombre de tabla.
  if (arg.includes(' ')) {
    const filas = await readOnly(arg);
    console.log('');
    if (filas.length === 0) console.log('(sin resultados)\n');
    else console.table(filas);
    return;
  }
  return verTabla(arg, limite);
}

main()
  .catch((err) => {
    console.error('\n❌', err.message, '\n');
    // Errores típicos, traducidos.
    if (/read-only|solo lectura/i.test(err.message)) {
      console.error('   Ese comando modifica datos y este script es de solo lectura, a propósito.\n');
    }
    if (/ETIMEDOUT|ENOTFOUND|ECONNREFUSED/i.test(err.message)) {
      console.error('   Revisá que sea la URL EXTERNA (la interna solo funciona dentro de Render).\n');
    }
    process.exitCode = 1;
  })
  .finally(() => pool.end());
