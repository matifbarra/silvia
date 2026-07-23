// ─────────────────────────────────────────────────────────────
// COLORES DE MATERIAS
// Tailwind necesita ver las clases COMPLETAS en el código para
// incluirlas en el CSS final. Por eso las escribimos enteras acá
// (no las armamos con template strings tipo `bg-${x}-500`).
// ─────────────────────────────────────────────────────────────

export const SUBJECT_COLORS = {
  indigo: { dot: 'bg-indigo-500', card: 'border-indigo-200 bg-indigo-50', label: 'Índigo' },
  blue: { dot: 'bg-blue-500', card: 'border-blue-200 bg-blue-50', label: 'Azul' },
  green: { dot: 'bg-green-500', card: 'border-green-200 bg-green-50', label: 'Verde' },
  purple: { dot: 'bg-purple-500', card: 'border-purple-200 bg-purple-50', label: 'Violeta' },
  rose: { dot: 'bg-rose-500', card: 'border-rose-200 bg-rose-50', label: 'Rosa' },
  amber: { dot: 'bg-amber-500', card: 'border-amber-200 bg-amber-50', label: 'Ámbar' },
};

// Lista de las claves para recorrerlas en el selector de color
export const COLOR_KEYS = Object.keys(SUBJECT_COLORS);
