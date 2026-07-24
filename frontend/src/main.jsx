// ─────────────────────────────────────────────────────────────
// PUNTO DE ENTRADA
// Envolvemos toda la app en dos "proveedores":
//   - BrowserRouter: habilita la navegación por URLs
//   - AuthProvider:  da acceso a la sesión desde cualquier página
// El orden importa: AuthProvider va DENTRO de BrowserRouter.
// ─────────────────────────────────────────────────────────────

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConfirmProvider } from './context/ConfirmContext';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
