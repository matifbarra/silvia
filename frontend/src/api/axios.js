// ─────────────────────────────────────────────────────────────
// CLIENTE HTTP (Axios)
// Creamos una instancia de axios ya configurada con la URL base
// del backend. Además, un "interceptor" agrega automáticamente
// el token a cada request si el usuario está logueado, así no
// tenemos que acordarnos de ponerlo a mano cada vez.
// ─────────────────────────────────────────────────────────────

import axios from 'axios';

// En desarrollo usamos localhost. En producción, Vite reemplaza
// import.meta.env.VITE_API_URL por el valor que definamos en Render.
// (Las variables que el frontend usa deben empezar con VITE_)
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL });

// Antes de mandar CUALQUIER request, revisamos si hay token guardado
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
