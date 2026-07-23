// ─────────────────────────────────────────────────────────────
// LLAMADAS A LA API DE TAREAS
// ─────────────────────────────────────────────────────────────

import api from './axios';

export async function getTasks() {
  const res = await api.get('/tasks');
  return res.data;
}

export async function createTask({ title, dueDate, subjectId, priority }) {
  const res = await api.post('/tasks', { title, dueDate, subjectId, priority });
  return res.data;
}

export async function updateTask(id, { title, dueDate, subjectId, priority }) {
  const res = await api.put(`/tasks/${id}`, { title, dueDate, subjectId, priority });
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
