// ─────────────────────────────────────────────────────────────
// ESTADOS DE UNA MATERIA DEL PLAN
// Los mismos cuatro que valida el backend (carreraController.js).
// Acá solo definimos cómo se ven.
// ─────────────────────────────────────────────────────────────

export const ESTADO_KEYS = ['pendiente', 'cursando', 'regular', 'aprobada'];

export const ESTADOS = {
  pendiente: {
    label: 'Pendiente',
    dot: 'bg-slate-300 dark:bg-slate-600',
    chip: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  },
  cursando: {
    label: 'Cursando',
    dot: 'bg-blue-500',
    chip: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  },
  regular: {
    label: 'Regular',
    dot: 'bg-amber-500',
    chip: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  aprobada: {
    label: 'Aprobada',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  },
};

// Las vistas de la página. Cada una responde una pregunta distinta;
// por eso la que abre por defecto es "podés cursar" y no "todas":
// la página tiene que dar la RESPUESTA, no volcarte los datos.
export const VISTAS = [
  {
    key: 'habilitadas',
    label: 'Podés cursar',
    test: (m) => m.enabled && m.status === 'pendiente',
    vacio: 'No hay materias nuevas habilitadas. Marcá lo que ya aprobaste para que aparezcan.',
  },
  {
    key: 'encurso',
    label: 'En curso',
    test: (m) => m.status === 'cursando' || m.status === 'regular',
    vacio: 'No estás cursando ninguna materia todavía.',
  },
  {
    key: 'aprobadas',
    label: 'Aprobadas',
    test: (m) => m.status === 'aprobada',
    vacio: 'Todavía no marcaste ninguna materia como aprobada.',
  },
  {
    key: 'todas',
    label: 'Todas',
    test: () => true,
    vacio: 'No hay materias en el plan.',
  },
];
