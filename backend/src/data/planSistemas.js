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
//   code → el número de la materia en el plan (sirve como identificador)
//   year → el nivel / año en el que se cursa (1 a 5)
// ─────────────────────────────────────────────────────────────

const PLAN_SISTEMAS = [
  // ── 1er año ──
  { code: 1, year: 1, name: 'Análisis Matemático I' },
  { code: 2, year: 1, name: 'Álgebra y Geometría Analítica' },
  { code: 3, year: 1, name: 'Física I' },
  { code: 4, year: 1, name: 'Inglés I' },
  { code: 5, year: 1, name: 'Lógica y Estructuras Discretas' },
  { code: 6, year: 1, name: 'Algoritmo y Estructura de Datos' },
  { code: 7, year: 1, name: 'Arquitectura de Computadoras' },
  { code: 8, year: 1, name: 'Sistemas y Proceso de Negocios' },

  // ── 2do año ──
  { code: 9, year: 2, name: 'Análisis Matemático II' },
  { code: 10, year: 2, name: 'Física II' },
  { code: 11, year: 2, name: 'Ingeniería y Sociedad' },
  { code: 12, year: 2, name: 'Inglés II' },
  { code: 13, year: 2, name: 'Sintaxis y Semántica de los Lenguajes' },
  { code: 14, year: 2, name: 'Paradigmas de Programación' },
  { code: 15, year: 2, name: 'Sistemas Operativos' },
  { code: 16, year: 2, name: 'Análisis de Sistemas de Información' },
  { code: 17, year: 2, name: 'Probabilidad y Estadística' },

  // ── 3er año ──
  { code: 18, year: 3, name: 'Economía' },
  { code: 19, year: 3, name: 'Base de Datos' },
  { code: 20, year: 3, name: 'Desarrollo de Software' },
  { code: 21, year: 3, name: 'Comunicación de Datos' },
  { code: 22, year: 3, name: 'Análisis Numérico' },
  { code: 23, year: 3, name: 'Diseño de Sistemas de Información' },
  { code: 99, year: 3, name: 'Seminario Integrador (Analista)' },

  // ── 4to año ──
  { code: 24, year: 4, name: 'Legislación' },
  { code: 25, year: 4, name: 'Ingeniería y Calidad de Software' },
  { code: 26, year: 4, name: 'Redes de Datos' },
  { code: 27, year: 4, name: 'Investigación Operativa' },
  { code: 28, year: 4, name: 'Simulación' },
  { code: 29, year: 4, name: 'Tecnologías para la Automatización' },
  { code: 30, year: 4, name: 'Administración de Sistemas de Información' },

  // ── 5to año ──
  { code: 31, year: 5, name: 'Inteligencia Artificial' },
  { code: 32, year: 5, name: 'Ciencia de Datos' },
  { code: 33, year: 5, name: 'Sistemas de Gestión' },
  { code: 34, year: 5, name: 'Gestión Gerencial' },
  { code: 35, year: 5, name: 'Seguridad en los Sistemas de Información' },
  { code: 36, year: 5, name: 'Proyecto Final' },
];

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

module.exports = { PLAN_SISTEMAS, PLAN_POR_CODE, YEARS, COLOR_POR_ANIO };
