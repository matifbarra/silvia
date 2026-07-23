// ─────────────────────────────────────────────────────────────
// BOTÓN DE MODO OSCURO
// - Lee el tema actual desde el <html> (el script de index.html ya lo
//   aplicó al cargar, así que arrancamos sincronizados).
// - Al hacer click: invierte la clase .dark, guarda la preferencia en
//   localStorage y actualiza el estado para cambiar el ícono.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { IconSun, IconMoon } from './icons';

export default function ThemeToggle() {
  // Estado inicial = ¿el <html> ya tiene la clase .dark? (la puso el
  // script del index.html según localStorage o la preferencia del sistema)
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  function toggle() {
    const nuevo = !dark;
    setDark(nuevo);
    document.documentElement.classList.toggle('dark', nuevo);
    localStorage.setItem('theme', nuevo ? 'dark' : 'light');
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className="grid place-items-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
    >
      {dark ? <IconSun className="w-5 h-5" /> : <IconMoon className="w-5 h-5" />}
    </button>
  );
}
