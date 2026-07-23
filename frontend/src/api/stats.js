// ─────────────────────────────────────────────────────────────
// LLAMADA A LA API DE ESTADÍSTICAS
// ─────────────────────────────────────────────────────────────

import api from './axios';

export async function getStats() {
  const res = await api.get('/stats');
  return res.data;
}
