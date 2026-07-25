// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE MATERIAS (async)
// Express 5 reenvía solo los errores de funciones async, así que
// no hace falta try/catch en cada una.
// ─────────────────────────────────────────────────────────────

const Subject = require('../models/Subject');
const Plan = require('../models/Plan');
const { COLOR_POR_ANIO } = require('../data/planSistemas');

// Devuelve un año válido (1..5) o null si no lo es.
// Nunca confiamos en lo que manda el cliente: alguien podría mandar
// year: 99 o year: "hola" desde Postman.
//
// Los años válidos ahora vienen de la base, así que se los pasamos como
// parámetro en vez de leerlos de una constante. Sigue siendo una función
// pura: mismas entradas, misma salida, y se puede testear sin base.
function normalizarAnio(valor, years) {
  const n = Number(valor);
  return years.includes(n) ? n : null;
}

// GET /api/subjects → lista todas las materias del usuario
async function getAll(req, res) {
  const subjects = await Subject.findAllByUser(req.userId);
  res.json(subjects);
}

// GET /api/subjects/plan → el catálogo del plan de estudio
// No depende del usuario: es siempre el mismo. Lo mandamos ya agrupado
// por año para que el frontend no tenga que hacer ese trabajo.
async function getPlan(req, res) {
  const plan = await Plan.findAll();
  const years = [...new Set(plan.map((m) => m.year))].sort((a, b) => a - b);

  const porAnio = years.map((year) => ({
    year,
    // El color es una decisión de presentación, no parte del plan, así
    // que sigue en código. El fallback cubre el caso de que en la base
    // aparezca un año que este mapa no tiene previsto.
    color: COLOR_POR_ANIO[year] || 'indigo',
    subjects: plan.filter((m) => m.year === year),
  }));

  res.json({ career: 'Ingeniería en Sistemas de Información', plan: '2023', years: porAnio });
}

// POST /api/subjects/import → crea varias materias del plan de una
// Body: { codes: [1, 2, 3] }  (los "code" del plan)
async function importFromPlan(req, res) {
  const { codes } = req.body;

  if (!Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ message: 'Elegí al menos una materia para importar' });
  }

  // 1) Nos quedamos solo con los codes que EXISTEN en el plan.
  //    new Set(codes) elimina repetidos si el cliente mandó alguno dos veces.
  const plan = await Plan.findAll();
  const porCode = new Map(plan.map((m) => [m.code, m]));

  const delPlan = [...new Set(codes)]
    .map((code) => porCode.get(Number(code)))
    .filter(Boolean);

  if (delPlan.length === 0) {
    return res.status(400).json({ message: 'Ninguna de las materias enviadas existe en el plan' });
  }

  // 2) Sacamos las que el usuario YA tiene (comparando por nombre, sin
  //    distinguir mayúsculas) para no llenarle la lista de duplicados.
  const yaTiene = await Subject.findNamesByUser(req.userId);
  const nuevas = delPlan.filter((m) => !yaTiene.has(m.name.toLowerCase()));

  if (nuevas.length === 0) {
    return res.json({ created: [], skipped: delPlan.length });
  }

  // 3) Un solo INSERT con todas. El color sale del año.
  const created = await Subject.createMany(
    req.userId,
    nuevas.map((m) => ({ name: m.name, color: COLOR_POR_ANIO[m.year] || 'indigo', year: m.year }))
  );

  res.status(201).json({ created, skipped: delPlan.length - nuevas.length });
}

// POST /api/subjects → crea una materia
async function create(req, res) {
  const { name, color, year } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'El nombre de la materia es obligatorio' });
  }

  const subject = await Subject.create({
    userId: req.userId,
    name: name.trim(),
    color: color || 'indigo',
    year: normalizarAnio(year, await Plan.findYears()),
  });

  res.status(201).json(subject);
}

// PUT /api/subjects/:id → edita una materia
async function update(req, res) {
  const { name, color, year } = req.body;
  const id = Number(req.params.id);

  const existing = await Subject.findById(id, req.userId);
  if (!existing) {
    return res.status(404).json({ message: 'Materia no encontrada' });
  }

  const updated = await Subject.update({
    id,
    userId: req.userId,
    name: name?.trim() || existing.name,
    color: color || existing.color,
    // Ojo: acá NO usamos "|| existing.year" porque queremos permitir
    // que el usuario saque el año (mandando year: null a propósito).
    year: normalizarAnio(year, await Plan.findYears()),
  });

  res.json(updated);
}

// DELETE /api/subjects/:id → borra una materia
async function remove(req, res) {
  const id = Number(req.params.id);
  const deleted = await Subject.remove(id, req.userId);

  if (!deleted) {
    return res.status(404).json({ message: 'Materia no encontrada' });
  }

  res.json({ message: 'Materia eliminada', id });
}

module.exports = { getAll, getPlan, importFromPlan, create, update, remove };
