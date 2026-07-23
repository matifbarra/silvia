// ─────────────────────────────────────────────────────────────
// LLAMADAS A LA API DE MATERIAS
// Centralizamos acá los pedidos al backend. El token se agrega
// solo (lo hace el interceptor de axios.js). Cada función devuelve
// los datos ya "desempaquetados" (res.data).
// ─────────────────────────────────────────────────────────────

import api from './axios';

export async function getSubjects() {
  const res = await api.get('/subjects');
  return res.data;
}

export async function createSubject(name, color) {
  const res = await api.post('/subjects', { name, color });
  return res.data;
}

export async function deleteSubject(id) {
  const res = await api.delete(`/subjects/${id}`);
  return res.data;
}
