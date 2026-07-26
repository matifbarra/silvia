// ─────────────────────────────────────────────────────────────
// LLAMADAS A LA API DE TAREAS
// ─────────────────────────────────────────────────────────────

import api from './axios';

export async function getTasks() {
  const res = await api.get('/tasks');
  return res.data;
}

// `code` = número de la materia en el plan (1..36, 99), o null si la
// tarea no es de ninguna materia.
export async function createTask({ title, dueDate, code, priority }) {
  const res = await api.post('/tasks', { title, dueDate, code, priority });
  return res.data;
}

export async function updateTask(id, { title, dueDate, code, priority }) {
  const res = await api.put(`/tasks/${id}`, { title, dueDate, code, priority });
  return res.data;
}

export async function toggleTask(id) {
  const res = await api.patch(`/tasks/${id}/toggle`);
  return res.data;
}

export async function deleteTask(id) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
}
