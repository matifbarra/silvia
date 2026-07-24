// ─────────────────────────────────────────────────────────────
// CONFIRM CONTEXT — expone useConfirm(), un reemplazo de window.confirm()
// que devuelve una PROMESA. Se usa igual de simple:
//
//   const confirmar = useConfirm();
//   const ok = await confirmar({ title, message, confirmLabel });
//   if (!ok) return;
//
// El provider mantiene un solo diálogo montado y guarda el "resolve" de
// la promesa; al elegir Confirmar/Cancelar lo resuelve con true/false.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

const ConfirmContext = createContext(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  return ctx;
}

export function ConfirmProvider({ children }) {
  const [opciones, setOpciones] = useState(null); // null = cerrado
  const resolver = useRef(null);

  const confirmar = useCallback((opts) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setOpciones(opts || {});
    });
  }, []);

  const cerrar = useCallback((resultado) => {
    setOpciones(null);
    if (resolver.current) {
      resolver.current(resultado);
      resolver.current = null;
    }
  }, []);

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      {opciones && (
        <ConfirmDialog
          {...opciones}
          onConfirm={() => cerrar(true)}
          onCancel={() => cerrar(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
}
