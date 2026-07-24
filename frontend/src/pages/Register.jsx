// ─────────────────────────────────────────────────────────────
// PÁGINA DE REGISTRO
// Igual que Login pero con un campo extra: el nombre.
// Al registrarse, el backend ya devuelve un token, así que el
// usuario queda logueado automáticamente y lo mandamos al dashboard.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell from '../components/AuthShell';
import { IconArrowRight } from '../components/icons';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  }

  const label = 'block font-mono text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5';
  const field =
    'w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-600';

  return (
    <AuthShell
      title="Creá tu cuenta"
      subtitle="Empezá a organizar tu carrera con silvIA."
      footer={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Iniciá sesión
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
          <span className="font-mono mt-px">!</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={field}
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className={label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={field}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className={label}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={field}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[.99] text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-brand-600/25 transition disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
          {!loading && (
            <IconArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>
      </form>
    </AuthShell>
  );
}
