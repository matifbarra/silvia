// ─────────────────────────────────────────────────────────────
// MAPA DE RUTAS (con rutas anidadas)
// Las páginas privadas viven DENTRO de <Layout>. React Router
// muestra el Layout (header + nav) y adentro, en el <Outlet/>,
// la página que corresponde a la URL.
// ─────────────────────────────────────────────────────────────

import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Stats from './pages/Stats';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Carrera from './pages/Carrera';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Rutas privadas: protegidas + envueltas en el Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Stats />} />
        <Route path="/materias" element={<Dashboard />} />
        <Route path="/tareas" element={<Tasks />} />
        <Route path="/carrera" element={<Carrera />} />
      </Route>
    </Routes>
  );
}
