// ─────────────────────────────────────────────────────────────
// METER — barra de progreso que "compila" al montar.
// Arranca en 0 y crece hasta `value`% con una transición suave, y
// mientras no llega al 100% le pasa por encima un brillo (shimmer),
// como una build en curso. Al 100% el brillo se apaga.
//
// Colores: 'brand' (índigo) por defecto, 'mint' para progreso de
// carrera (aprobadas = "compilado").
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

const FILLS = {
  brand: 'bg-gradient-to-r from-brand-500 to-brand-400',
  mint: 'bg-gradient-to-r from-mint-500 to-mint-400',
};

export default function Meter({ value = 0, color = 'brand', className = 'h-2.5' }) {
  // Empezamos en 0 y, tras montar, saltamos al valor real: la transición
  // CSS hace el resto (la barra "crece" sola).
  const [ancho, setAncho] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAncho(value));
    return () => cancelAnimationFrame(id);
  }, [value]);

  const compilando = value > 0 && value < 100;

  return (
    <div
      className={`w-full ${className} rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${FILLS[color]} ${compilando ? 'shimmer-track' : ''}`}
        style={{
          width: `${ancho}%`,
          transition: 'width 0.9s cubic-bezier(0.2, 0.7, 0.2, 1)',
        }}
      />
    </div>
  );
}
