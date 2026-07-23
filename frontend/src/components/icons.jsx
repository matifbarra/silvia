// ─────────────────────────────────────────────────────────────
// ÍCONOS SVG (estilo Lucide: trazo de 2px, 24x24, currentColor)
// Usar SVG en vez de emojis es una de las cosas que más hacen que
// una UI se vea profesional: escalan sin pixelarse, heredan el color
// del texto (currentColor) y se ven iguales en todos los sistemas.
//
// Todos aceptan className para ajustar tamaño/color desde Tailwind
// (ej: <IconPencil className="w-4 h-4" />).
// ─────────────────────────────────────────────────────────────

const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function IconPencil({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function IconTrash({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconPlus({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconBell({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function IconSun({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" />
    </svg>
  );
}

export function IconMoon({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export function IconLogout({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

export function IconCheck({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function IconBook({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

export function IconChart({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className}>
      <path d="M3 3v18h18" />
      <path d="M7 15l3-3 3 3 5-5" />
    </svg>
  );
}

export function IconDownload({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5M12 15V3" />
    </svg>
  );
}

export function IconX({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function IconLock({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconChevron({ className = 'w-4 h-4' }) {
  return (
    <svg {...base} className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconRoute({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="6" cy="19" r="3" />
      <circle cx="18" cy="5" r="3" />
      <path d="M9 19h5a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h5" />
    </svg>
  );
}

export function IconClipboard({ className = 'w-5 h-5' }) {
  return (
    <svg {...base} className={className}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 13l2 2 4-4" />
    </svg>
  );
}
