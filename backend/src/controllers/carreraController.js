// ─────────────────────────────────────────────────────────────
// CONTROLADOR DE CARRERA (plan de estudio + correlativas)
//
// La regla de "¿puedo cursar esta materia?" vive acá, en el servidor,
// y no en el frontend. Dos razones:
//   1. Es una regla del NEGOCIO (del dominio), no de cómo se ve.
//   2. Si mañana hay una app mobile, no hay que reescribirla.
// El frontend recibe la respuesta ya masticada y solo la dibuja.
// ─────────────────────────────────────────────────────────────

const PlanStatus = require('../models/PlanStatus');
const Plan = require('../models/Plan');

// Los cuatro estados posibles, en orden de avance.
const ESTADOS = ['pendiente', 'cursando', 'regular', 'aprobada'];
const POR_DEFECTO = 'pendiente';

// "Tener la materia regularizada" se cumple también si ya la aprobaste:
// aprobar es más que regularizar.
const CUENTA_COMO_REGULAR = new Set(['regular', 'aprobada']);

// GET /api/carrera
// Devuelve el plan completo con TU estado en cada materia y, para cada
// una, si la tenés habilitada y qué te falta si no.
async function getCarrera(req, res) {
  // Las dos consultas no dependen una de la otra, así que van en
  // paralelo: tardamos lo que tarde la más lenta, no la suma.
  const [plan, estados] = await Promise.all([
    Plan.findAll(),
    PlanStatus.findMapByUser(req.userId),
  ]);

  const estadoDe = (code) => estados.get(code) || POR_DEFECTO;

  // Convierte [1, 2] en [{ code: 1, name: 'Análisis Matemático I' }, ...]
  // para que el frontend muestre nombres y no números sueltos.
  const nombrePorCode = new Map(plan.map((m) => [m.code, m.name]));
  const conNombres = (codes) =>
    codes.map((code) => ({ code, name: nombrePorCode.get(code) ?? `Materia ${code}` }));

  const materias = plan.map((materia) => {
    // Correlativas que NO cumplís todavía
    const faltaRegular = materia.regular.filter((c) => !CUENTA_COMO_REGULAR.has(estadoDe(c)));
    const faltaAprobada = materia.aprobada.filter((c) => estadoDe(c) !== 'aprobada');

    return {
      code: materia.code,
      year: materia.year,
      name: materia.name,
      status: estadoDe(materia.code),
      // Habilitada = cumplís TODOS los requisitos para cursarla
      enabled: faltaRegular.length === 0 && faltaAprobada.length === 0,
      requires: { regular: conNombres(materia.regular), aprobada: conNombres(materia.aprobada) },
      missing: { regular: conNombres(faltaRegular), aprobada: conNombres(faltaAprobada) },
      note: materia.note || null,
    };
  });

  // Contadores para la barra de progreso. reduce recorre una sola vez
  // en vez de hacer cuatro filter distintos.
  const conteo = materias.reduce(
    (acc, m) => {
      acc[m.status]++;
      if (m.enabled && m.status === POR_DEFECTO) acc.habilitadas++;
      return acc;
    },
    { pendiente: 0, cursando: 0, regular: 0, aprobada: 0, habilitadas: 0 }
  );

  res.json({
    career: 'Ingeniería en Sistemas de Información',
    plan: '2023',
    // Los años salen del propio plan. El (a, b) => a - b no sobra:
    // sort() sin comparador ordena como TEXTO, así que con dos dígitos
    // pondría el 10 antes que el 2.
    years: [...new Set(plan.map((m) => m.year))].sort((a, b) => a - b),
    total: materias.length,
    counts: conteo,
    subjects: materias,
  });
}

// PUT /api/carrera
// Body: { codes: [1, 2, 3], status: 'aprobada' }
// Sirve para una sola materia (array de uno) o para un año entero.
async function setStatus(req, res) {
  const { codes, status } = req.body;

  if (!Array.isArray(codes) || codes.length === 0) {
    return res.status(400).json({ message: 'Elegí al menos una materia' });
  }
  if (!ESTADOS.includes(status)) {
    return res.status(400).json({ message: `Estado inválido. Válidos: ${ESTADOS.join(', ')}` });
  }

  // Nos quedamos solo con los codes que existen en el plan
  const delPlan = await Plan.findCodes();
  const validos = [...new Set(codes.map(Number))].filter((c) => delPlan.has(c));
  if (validos.length === 0) {
    return res.status(400).json({ message: 'Ninguna de las materias enviadas existe en el plan' });
  }

  // "pendiente" es el estado por defecto: en vez de guardarlo,
  // borramos la fila. Así la tabla solo tiene lo que te pasó de verdad.
  if (status === POR_DEFECTO) {
    await PlanStatus.clearMany({ userId: req.userId, codes: validos });
  } else {
    await PlanStatus.setMany({ userId: req.userId, codes: validos, status });
  }

  // Devolvemos la carrera recalculada: cambiar UNA materia puede
  // habilitar o bloquear varias otras, así que el frontend necesita
  // todo el panorama de nuevo (y nos ahorramos un segundo pedido).
  return getCarrera(req, res);
}

module.exports = { getCarrera, setStatus, ESTADOS };
