// ─────────────────────────────────────────────────────────────
// DASHBOARD — Gestión de Materias
// - useEffect: carga las materias del backend al abrir la página
// - useState: guarda la lista, el nombre nuevo y el color elegido
// - Al crear/borrar, actualizamos el estado para reflejarlo al toque
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { getSubjects, createSubject, deleteSubject } from '../api/subjects';
import { SUBJECT_COLORS, COLOR_KEYS } from '../constants/colors';
import Spinner from '../components/Spinner';

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [color, setColor] = useState('indigo');
  const [saving, setSaving] = useState(false);

  // Cargar materias al montar el componente
  useEffect(() => {
    getSubjects()
      .then((data) => setSubjects(data))
      .catch((err) => console.error('Error cargando materias', err))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const nueva = await createSubject(name.trim(), color);
      setSubjects((prev) => [nueva, ...prev]); // la agregamos arriba
      setName(''); // limpiamos el input
    } catch (err) {
      console.error('Error creando materia', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id, subjectName) {
    // Pedimos confirmación antes de borrar (evita borrados accidentales)
    const ok = window.confirm(
      `¿Seguro que querés eliminar "${subjectName}"? También se borrarán sus tareas.`
    );
    if (!ok) return;

    // Optimista: la sacamos de la lista y luego confirmamos con el backend
    const backup = subjects;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    try {
      await deleteSubject(id);
    } catch (err) {
      console.error('Error borrando materia', err);
      setSubjects(backup); // si falla, la restauramos
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Mis materias</h2>
      <p className="text-slate-500 mb-6">Organizá las materias que estás cursando.</p>

        {/* Formulario para agregar materia */}
        <form
          onSubmit={handleAdd}
          className="bg-white rounded-xl border border-slate-200 p-4 mb-8 flex flex-col sm:flex-row gap-3 sm:items-end"
        >
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre de la materia
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Análisis Matemático"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          {/* Selector de color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
            <div className="flex gap-2">
              {COLOR_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColor(key)}
                  title={SUBJECT_COLORS[key].label}
                  className={`w-8 h-8 rounded-full ${SUBJECT_COLORS[key].dot} transition ${
                    color === key ? 'ring-2 ring-offset-2 ring-slate-400' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg transition disabled:opacity-60"
          >
            {saving ? 'Agregando...' : '+ Agregar'}
          </button>
        </form>

        {/* Lista de materias */}
        {loading ? (
          <Spinner label="Cargando materias..." />
        ) : subjects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400">Todavía no tenés materias. ¡Agregá la primera! 👆</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => {
              const c = SUBJECT_COLORS[subject.color] || SUBJECT_COLORS.indigo;
              return (
                <div
                  key={subject.id}
                  className={`group rounded-xl border p-5 flex items-start justify-between transition hover:shadow-md ${c.card}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                    <span className="font-medium text-slate-800">{subject.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(subject.id, subject.name)}
                    className="text-slate-400 hover:text-red-600 transition text-sm opacity-0 group-hover:opacity-100"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
