// ─────────────────────────────────────────────────────────────
// CONTEXT DE AUTENTICACIÓN
// Es la "memoria global" de la sesión. Guarda el usuario logueado
// y expone las funciones login/register/logout para toda la app.
// Cualquier componente puede usar useAuth() para acceder a esto.
// ─────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true mientras verificamos si ya había sesión

  // Al abrir la app: si hay un token guardado, pedimos /me para
  // restaurar la sesión (así no te desloguea al refrescar la página).
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token')) // token viejo/inválido → lo borramos
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  }

  async function register(name, email, password) {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el context más cómodo: const { user, login } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
