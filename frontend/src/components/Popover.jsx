// ─────────────────────────────────────────────────────────────
// POPOVER — capa flotante que se renderiza en un PORTAL (document.body).
//
// Por qué un portal: si el menú vive dentro de su contenedor, lo recorta
// cualquier `overflow-hidden` de un ancestro (ej: las filas de Carrera) y
// lo tapa el "stacking context" que crean cosas como `backdrop-blur` de
// las tarjetas. Sacándolo al body, el menú siempre queda por encima.
//
// Se posiciona con position:fixed respecto al `anchorRef` (el disparador),
// se reubica al scrollear/redimensionar, y si no hay lugar abajo se abre
// hacia arriba. Cierra al hacer click afuera o con Escape.
// ─────────────────────────────────────────────────────────────

import { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function Popover({
  anchorRef,
  open,
  onClose,
  align = 'left', // 'left' | 'right' — a qué borde del disparador alinear
  minWidth, // 'anchor' = ancho del disparador; número = px; undefined = auto
  gap = 6,
  className = '',
  children,
}) {
  const ref = useRef(null);
  const [estilo, setEstilo] = useState(null);

  // Calcula (y recalcula) la posición a partir del rectángulo del disparador.
  useLayoutEffect(() => {
    if (!open) return;

    function ubicar() {
      const a = anchorRef.current;
      if (!a) return;
      const r = a.getBoundingClientRect();
      const vh = window.innerHeight;
      const espacioAbajo = vh - r.bottom;
      const espacioArriba = r.top;
      // Si abajo no entra cómodo y arriba hay más lugar, abrimos hacia arriba.
      const haciaArriba = espacioAbajo < 280 && espacioArriba > espacioAbajo;

      const s = { position: 'fixed', zIndex: 60 };
      if (minWidth === 'anchor') s.minWidth = r.width;
      else if (minWidth) s.minWidth = minWidth;

      if (haciaArriba) s.bottom = vh - r.top + gap;
      else s.top = r.bottom + gap;

      if (align === 'right') s.right = window.innerWidth - r.right;
      else s.left = r.left;

      setEstilo(s);
    }

    ubicar();
    // Throttle con rAF: al scrollear/redimensionar no recalculamos en cada
    // evento (que forzaría layout), sino una vez por frame como mucho.
    let pendiente = false;
    const alMoverse = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        ubicar();
        pendiente = false;
      });
    };
    // capture:true para enterarnos también del scroll de contenedores internos.
    window.addEventListener('scroll', alMoverse, true);
    window.addEventListener('resize', alMoverse);
    return () => {
      window.removeEventListener('scroll', alMoverse, true);
      window.removeEventListener('resize', alMoverse);
    };
  }, [open, align, minWidth, gap, anchorRef]);

  // Cerrar al hacer click afuera (ni en el popover ni en el disparador) o Escape.
  useEffect(() => {
    if (!open) return;
    function onDoc(e) {
      if (ref.current?.contains(e.target)) return;
      if (anchorRef.current?.contains(e.target)) return;
      onClose();
    }
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open || !estilo) return null;

  return createPortal(
    <div ref={ref} style={estilo} className={className}>
      {children}
    </div>,
    document.body
  );
}
