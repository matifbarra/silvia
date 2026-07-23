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
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
