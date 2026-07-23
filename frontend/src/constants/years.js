// ─────────────────────────────────────────────────────────────
// AÑOS / NIVELES DE LA CARRERA
// El backend manda el año como número (1..5) o null.
// Acá le damos el nombre y el estilo que se ve en pantalla.
// ─────────────────────────────────────────────────────────────

export const YEARS = [1, 2, 3, 4, 5];

// Clave especial para las materias que no tienen año asignado.
// Usamos un string (y no null) porque es más cómodo como valor de
// filtro y como key de React.
export const SIN_ANIO = 'sin-anio';

export function yearLabel(year) {
  return year ? `${year}° año` : 'Sin año';
}

// Chip que se muestra arriba de cada grupo de materias
export const YEAR_BADGE = {
  1: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  2: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  3: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  4: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  5: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  [SIN_ANIO]: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

// Ordena alfabéticamente entendiendo los acentos.
// La base ordena por bytes: para SQLite "Á" (U+00C1) va DESPUÉS de "Z",
// así que "Álgebra" terminaba abajo de todo. localeCompare usa las
// reglas del idioma, donde Á va junto a la A.
function porNombre(a, b) {
  return a.name.localeCompare(b.name, 'es');
}

// Agrupa una lista de materias por año.
// Devuelve un array de { key, year, subjects } ya ordenado:
// 1°, 2°, ... 5° y al final las que no tienen año.
export function groupByYear(subjects) {
  const grupos = [];

  for (const year of YEARS) {
    // filter ya devuelve un array nuevo, así que sort() no rompe el original
    const delAnio = subjects.filter((s) => s.year === year).sort(porNombre);
    if (delAnio.length > 0) grupos.push({ key: year, year, subjects: delAnio });
  }

  const sinAnio = subjects.filter((s) => !s.year).sort(porNombre);
  if (sinAnio.length > 0) grupos.push({ key: SIN_ANIO, year: null, subjects: sinAnio });

  return grupos;
}
