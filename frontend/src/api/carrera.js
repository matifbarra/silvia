// ─────────────────────────────────────────────────────────────
// LLAMADAS A LA API DE CARRERA (plan + correlativas)
// ─────────────────────────────────────────────────────────────

import api from './axios';

// Trae el plan con TU estado en cada materia y qué tenés habilitado
export async function getCarrera() {
  const res = await api.get('/carrera');
  return res.data;
}

// Cambia el estado de una o varias materias.
// El backend devuelve la carrera entera recalculada, porque cambiar
// una materia puede habilitar o bloquear otras.
export async function setStatus(codes, status) {
  const res = await api.put('/carrera', { codes, status });
  return res.data;
}
