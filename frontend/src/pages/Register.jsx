// ─────────────────────────────────────────────────────────────
// PÁGINA DE REGISTRO
// Igual que Login pero con un campo extra: el nombre.
// Al registrarse, el backend ya devuelve un token, así que el
// usuario queda logueado automáticamente y lo mandamos al dashboard.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBook } from '../components/icons';

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

  const field =
    'w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Marca arriba de la tarjeta */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-600/30">
            <IconBook className="w-6 h-6" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            silv<span className="text-violet-400">IA</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center">Creá tu cuenta</h1>
          <p className="text-slate-500 text-center mt-1 mb-6">Empezá a organizar tu estudio con silvIA</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
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
              className="w-full bg-violet-600 hover:bg-violet-700 active:scale-[.99] text-white font-semibold py-2.5 rounded-xl shadow-sm shadow-violet-600/20 transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Creando cuenta...' : 'Registrarme'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-violet-600 font-semibold hover:underline">
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
