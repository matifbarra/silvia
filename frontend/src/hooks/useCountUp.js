// ─────────────────────────────────────────────────────────────
// useCountUp — anima un número desde 0 hasta `target` al montar.
// Le da a los KPI ese arranque "vivo" (como si el dato se calculara
// en el momento). Usa requestAnimationFrame con un easing suave y
// respeta prefers-reduced-motion (si el usuario prefiere menos
// movimiento, muestra el valor final de una).
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const prefiereMenos = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefiereMenos || target === 0) {
      setValue(target);
      return;
    }

    let raf;
    const inicio = performance.now();
    const tick = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duration);
      // easeOutCubic: arranca rápido y desacelera al llegar
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
