// ─────────────────────────────────────────────────────────────
// AÑOS / NIVELES DE LA CARRERA
//
// Toda materia viene del plan, y en el plan el año es obligatorio
// (plan_subjects."year" es NOT NULL). Por eso acá ya no existe el
// caso "sin año": desapareció junto con las materias a mano.
//
// Este archivo es el único lugar donde el año se convierte en color.
// Antes cada materia guardaba su color en la base; ahora el color es
// una consecuencia del nivel, así que se calcula y no se almacena.
// ─────────────────────────────────────────────────────────────

export function yearLabel(year) {
  return `${year}° año`;
}

// Chip que se muestra arriba de cada grupo de materias.
// Tailwind necesita ver las clases COMPLETAS en el código para
// incluirlas en el CSS final: por eso van escritas enteras y no
// armadas con template strings tipo `bg-${color}-100`.
export const YEAR_BADGE = {
  1: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  2: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  3: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  4: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  5: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
};

// Puntito de color: el mismo lenguaje visual que el chip, pero para
// las listas compactas (desplegable de materias, gráfico de barras).
export const YEAR_DOT = {
  1: 'bg-blue-500',
  2: 'bg-green-500',
  3: 'bg-amber-500',
  4: 'bg-rose-500',
  5: 'bg-purple-500',
};

// Ordena alfabéticamente entendiendo los acentos.
// La base ordena por bytes: para SQLite "Á" (U+00C1) va DESPUÉS de "Z",
// así que "Álgebra" terminaba abajo de todo. localeCompare usa las
// reglas del idioma, donde Á va junto a la A.
export function porNombre(a, b) {
  return a.name.localeCompare(b.name, 'es');
}
