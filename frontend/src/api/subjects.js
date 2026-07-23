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

// El catálogo del plan de estudio, ya agrupado por año
export async function getPlan() {
  const res = await api.get('/subjects/plan');
  return res.data;
}

// Importa varias materias del plan de una sola vez.
// codes = array con los números de materia (ej: [1, 2, 3])
export async function importSubjects(codes) {
  const res = await api.post('/subjects/import', { codes });
  return res.data; // { created: [...], skipped: n }
}

export async function createSubject(name, color, year) {
  const res = await api.post('/subjects', { name, color, year });
  return res.data;
}

export async function updateSubject(id, name, color, year) {
  const res = await api.put(`/subjects/${id}`, { name, color, year });
  return res.data;
}

export async function deleteSubject(id) {
  const res = await api.delete(`/subjects/${id}`);
  return res.data;
}
