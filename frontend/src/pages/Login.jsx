// ─────────────────────────────────────────────────────────────
// PÁGINA DE LOGIN
// Un formulario controlado (React maneja el valor de cada input).
// Al enviar, llama a login() del context. Si sale bien, navega
// al dashboard; si falla, muestra el mensaje de error del backend.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBook } from '../components/icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); // evita que el navegador recargue la página
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/'); // éxito → al dashboard
    } catch (err) {
      // el backend nos manda { message: '...' }
      setError(err.response?.data?.message || 'Error al iniciar sesión');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-center">Bienvenido de nuevo</h1>
          <p className="text-slate-500 text-center mt-1 mb-6">Iniciá sesión para organizar tu estudio</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-violet-600 font-semibold hover:underline">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
