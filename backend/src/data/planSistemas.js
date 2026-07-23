// ─────────────────────────────────────────────────────────────
// PLAN DE ESTUDIO — Ingeniería en Sistemas de Información
// UTN · Plan 2023
//
// Esto son DATOS DE REFERENCIA: no se guardan en la base ni cambian
// por usuario. Es el catálogo del que cada uno elige qué importar.
//
// Lo ponemos en el backend (y no en el frontend) para que sea una
// única fuente de verdad: el servidor valida contra esta misma lista
// cuando el usuario pide importar materias.
//
//   code     → el número de la materia en el plan (sirve como identificador)
//   year     → el nivel / año en el que se cursa (1 a 5)
//   regular  → codes que tenés que tener REGULARIZADAS para cursarla
//   aprobada → codes que tenés que tener APROBADAS para cursarla
//
// Ojo con el PDF: en la columna de correlativas el guion SEPARA, no es
// un rango. "6-8-13-14" son cuatro materias (6, 8, 13 y 14), así que
// "1-3" es {1, 3} y NO {1, 2, 3}.
// ─────────────────────────────────────────────────────────────

const PLAN_SISTEMAS = [
  // ── 1er año ── (ninguna tiene correlativas: son el arranque)
  { code: 1, year: 1, name: 'Análisis Matemático I', regular: [], aprobada: [] },
  { code: 2, year: 1, name: 'Álgebra y Geometría Analítica', regular: [], aprobada: [] },
  { code: 3, year: 1, name: 'Física I', regular: [], aprobada: [] },
  { code: 4, year: 1, name: 'Inglés I', regular: [], aprobada: [] },
  { code: 5, year: 1, name: 'Lógica y Estructuras Discretas', regular: [], aprobada: [] },
  { code: 6, year: 1, name: 'Algoritmo y Estructura de Datos', regular: [], aprobada: [] },
  { code: 7, year: 1, name: 'Arquitectura de Computadoras', regular: [], aprobada: [] },
  { code: 8, year: 1, name: 'Sistemas y Proceso de Negocios', regular: [], aprobada: [] },

  // ── 2do año ──
  { code: 9, year: 2, name: 'Análisis Matemático II', regular: [1, 2], aprobada: [] },
  { code: 10, year: 2, name: 'Física II', regular: [1, 3], aprobada: [] },
  { code: 11, year: 2, name: 'Ingeniería y Sociedad', regular: [], aprobada: [] },
  { code: 12, year: 2, name: 'Inglés II', regular: [4], aprobada: [] },
  { code: 13, year: 2, name: 'Sintaxis y Semántica de los Lenguajes', regular: [5, 6], aprobada: [] },
  { code: 14, year: 2, name: 'Paradigmas de Programación', regular: [5, 6], aprobada: [] },
  { code: 15, year: 2, name: 'Sistemas Operativos', regular: [7], aprobada: [] },
  { code: 16, year: 2, name: 'Análisis de Sistemas de Información', regular: [6, 8], aprobada: [] },
  { code: 17, year: 2, name: 'Probabilidad y Estadística', regular: [1, 2], aprobada: [] },

  // ── 3er año ──
  { code: 18, year: 3, name: 'Economía', regular: [], aprobada: [1, 2] },
  { code: 19, year: 3, name: 'Base de Datos', regular: [13, 16], aprobada: [5, 6] },
  { code: 20, year: 3, name: 'Desarrollo de Software', regular: [14, 16], aprobada: [5, 6] },
  { code: 21, year: 3, name: 'Comunicación de Datos', regular: [], aprobada: [3, 7] },
  { code: 22, year: 3, name: 'Análisis Numérico', regular: [9], aprobada: [1, 2] },
  { code: 23, year: 3, name: 'Diseño de Sistemas de Información', regular: [14, 16], aprobada: [4, 6, 8] },
  { code: 99, year: 3, name: 'Seminario Integrador (Analista)', regular: [16], aprobada: [6, 8, 13, 14] },

  // ── 4to año ──
  { code: 24, year: 4, name: 'Legislación', regular: [11], aprobada: [] },
  { code: 25, year: 4, name: 'Ingeniería y Calidad de Software', regular: [19, 20, 23], aprobada: [13, 14] },
  { code: 26, year: 4, name: 'Redes de Datos', regular: [15, 21], aprobada: [] },
  { code: 27, year: 4, name: 'Investigación Operativa', regular: [17, 22], aprobada: [] },
  { code: 28, year: 4, name: 'Simulación', regular: [17], aprobada: [9] },
  { code: 29, year: 4, name: 'Tecnologías para la Automatización', regular: [10, 22], aprobada: [9] },
  { code: 30, year: 4, name: 'Administración de Sistemas de Información', regular: [18, 23], aprobada: [16] },

  // ── 5to año ──
  { code: 31, year: 5, name: 'Inteligencia Artificial', regular: [28], aprobada: [17, 22] },
  { code: 32, year: 5, name: 'Ciencia de Datos', regular: [28], aprobada: [17, 19] },
  { code: 33, year: 5, name: 'Sistemas de Gestión', regular: [18, 27], aprobada: [23] },
  { code: 34, year: 5, name: 'Gestión Gerencial', regular: [24, 30], aprobada: [18] },
  { code: 35, year: 5, name: 'Seguridad en los Sistemas de Información', regular: [26, 30], aprobada: [20, 21] },
  { code: 36, year: 5, name: 'Proyecto Final', regular: [25, 26, 30], aprobada: [12, 20, 23] },
];

// Requisitos que el plan pide "además de las correlativas" y que no se
// pueden expresar con una lista de codes. Los mostramos como aviso.
const NOTAS_ESPECIALES = {
  99: 'Además, tenés que tener aprobadas TODAS las materias de la 1 a la 23.',
  36: 'Además, tenés que tener aprobadas TODAS las materias del plan y la Práctica Profesional Supervisada.',
};

// Años válidos, calculados desde el plan (así no quedan "hardcodeados"
// en dos lugares: si mañana el plan cambia, esto se actualiza solo).
const YEARS = [...new Set(PLAN_SISTEMAS.map((m) => m.year))].sort();

// Color por defecto según el año, para que al importar cada nivel
// quede visualmente diferenciado. Son las claves de SUBJECT_COLORS
// del frontend (ahí se traducen a clases de Tailwind).
const COLOR_POR_ANIO = {
  1: 'blue',
  2: 'green',
  3: 'amber',
  4: 'rose',
  5: 'purple',
};

// Búsqueda rápida por code: en vez de recorrer el array cada vez
// (O(n)), armamos un Map una sola vez al cargar el módulo (O(1)).
const PLAN_POR_CODE = new Map(PLAN_SISTEMAS.map((m) => [m.code, m]));

module.exports = {
  PLAN_SISTEMAS,
  PLAN_POR_CODE,
  YEARS,
  COLOR_POR_ANIO,
  NOTAS_ESPECIALES,
};
