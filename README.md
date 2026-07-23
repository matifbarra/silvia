# 📚 silvIA - Study Management App

Una aplicación web para organizar y gestionar tu estudio. Vamos a construirla paso a paso aprendiendo nuevas tecnologías.

## 📁 Estructura del Proyecto

```
silvIA/
├── frontend/          # React + Vite (lo que ve el usuario)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── backend/           # Node + Express (servidor y lógica)
    ├── src/
    │   ├── routes/    (rutas de la API)
    │   ├── controllers/ (lógica de negocio)
    │   ├── models/    (esquemas de datos)
    │   ├── middleware/ (autenticación, validación, etc)
    │   └── server.js  (punto de entrada)
    ├── package.json
    └── .env           (variables de entorno)
```

## 🚀 Cómo Correr el Proyecto

### Frontend (React)
```bash
cd frontend
npm install  # Ya está hecho ✅
npm run dev
# Se abre en http://localhost:5173
```

### Backend (Node + Express)
```bash
cd backend
npm install  # Ya está hecho ✅
npm run dev
# Corre en http://localhost:5000
```

## 📦 Tecnologías Instaladas

### Frontend
- React 18
- Vite (build tool rápido)
- (Luego: Axios, React Router, Tailwind)

### Backend
- Express (framework web)
- CORS (permitir requests desde frontend)
- Dotenv (variables de entorno)
- JWT (autenticación con tokens)
- Bcryptjs (hashear contraseñas)
- (Luego: MongoDB o PostgreSQL)

## 📦 Tecnologías agregadas después

### Frontend
- Tailwind CSS v4 (estilos)
- React Router (navegación)
- Axios (llamadas a la API)

### Backend
- better-sqlite3 (base de datos SQLite)

## 🔌 Endpoints de la API

### Auth (`/api/auth`)
- `POST /register` — crear cuenta (devuelve token)
- `POST /login` — iniciar sesión (devuelve token)
- `GET  /me` — usuario actual (protegido)

### Materias (`/api/subjects`) — todas protegidas
- `GET    /` — listar mis materias
- `POST   /` — crear materia `{ name, color }`
- `PUT    /:id` — editar materia
- `DELETE /:id` — borrar materia

### Tareas (`/api/tasks`) — todas protegidas
- `GET    /` — listar mis tareas (con JOIN a la materia)
- `POST   /` — crear tarea `{ title, dueDate, subjectId }`
- `PATCH  /:id/toggle` — marcar hecha/pendiente
- `DELETE /:id` — borrar tarea

### Estadísticas (`/api/stats`) — protegida
- `GET /` — resumen: totales, progreso y tareas por materia (COUNT / SUM / GROUP BY)

## 📊 Progreso

- ✅ **Bloque 1** — Setup inicial (Vite + Express)
- ✅ **Bloque 2** — Autenticación (JWT, bcrypt, middleware)
- ✅ **Bloque 3** — Login/Registro en React (Tailwind, Router, Context)
- ✅ **Bloque 4** — Materias CRUD + SQLite
- ✅ **Bloque 5** — Tareas de estudio (fechas, estados, JOIN, navegación con Layout)
- ✅ **Bloque 6** — Estadísticas y progreso (COUNT/SUM/GROUP BY, barras de progreso)
- ✅ **Bloque 7** — Pulido de UI/UX (spinner, confirmaciones, hover, responsive, favicon)
- 🚧 **Deploy** — Código listo para Render (ver [DEPLOY.md](DEPLOY.md)); falta subir a GitHub + Render

## 🌐 Deploy

El código ya está preparado para producción (variables de entorno, CORS, `render.yaml`).
Seguí la guía paso a paso en **[DEPLOY.md](DEPLOY.md)**.

## ▶️ Cómo correr todo

```bash
# Terminal 1 - Backend
cd backend
npm run dev        # http://localhost:5000

# Terminal 2 - Frontend
cd frontend
npm run dev        # http://localhost:5173
```
