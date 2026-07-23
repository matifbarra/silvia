# 🚀 Guía de Deploy — silvIA en Render

Esta guía te lleva de tu código local a una app en internet, paso a paso.

## 📋 Resumen de lo que ya está listo en el código

- ✅ `render.yaml` — Render lee este archivo y crea los 2 servicios solo
- ✅ URL del backend configurable (`VITE_API_URL`)
- ✅ CORS configurable (`FRONTEND_URL`)
- ✅ Ruta de la base configurable (`DATABASE_DIR`)
- ✅ Node fijado en versión ≥20
- ✅ Build de producción probado

---

## Paso 1 — Subir el código a GitHub

Render despliega desde un repo de GitHub. Desde la carpeta `silvIA`:

```bash
git init
git add .
git commit -m "silvIA lista para deploy"
```

Luego, en GitHub:
1. Creá un repositorio nuevo (vacío, sin README) llamado `silvia`.
2. Conectá tu repo local y subí el código:

```bash
git remote add origin https://github.com/TU_USUARIO/silvia.git
git branch -M main
git push -u origin main
```

---

## Paso 2 — Crear los servicios en Render

1. Entrá a [render.com](https://render.com) y creá una cuenta (podés usar tu GitHub).
2. Click en **New +** → **Blueprint**.
3. Conectá tu repositorio `silvia`.
4. Render detecta el `render.yaml` y te muestra los 2 servicios:
   - `silvia-backend` (Node)
   - `silvia-frontend` (sitio estático)
5. Click en **Apply**. Render empieza a construir ambos.

> El primer build tarda unos minutos (instala dependencias y compila).

---

## Paso 3 — Conectar frontend y backend (variables de entorno)

Cuando terminen de crearse, cada servicio tiene su URL pública, por ejemplo:
- Backend: `https://silvia-backend.onrender.com`
- Frontend: `https://silvia-frontend.onrender.com`

Ahora hay que decirle a cada uno dónde está el otro:

**En el backend** (`silvia-backend` → Environment):
- `FRONTEND_URL` = `https://silvia-frontend.onrender.com`  *(sin barra al final)*

**En el frontend** (`silvia-frontend` → Environment):
- `VITE_API_URL` = `https://silvia-backend.onrender.com/api`  *(¡ojo, termina en /api!)*

Después de setear las variables, hacé **Manual Deploy → Deploy latest commit** en cada servicio para que tomen los valores nuevos.

> `JWT_SECRET` ya se generó solo (lo puso Render). No lo toques.

---

## Paso 4 — Probar

Abrí la URL del frontend, registrate y usá la app. 🎉

---

## 🗄️ Base de datos PostgreSQL (persistente)

El código ahora soporta **las dos bases** automáticamente:
- **En tu compu** (sin `DATABASE_URL`) → usa **SQLite** (sin instalar nada).
- **En Render** (con `DATABASE_URL`) → usa **PostgreSQL** (datos permanentes).

El `render.yaml` ya define una base Postgres (`silvia-db`) y la conecta al backend
por la variable `DATABASE_URL`. Para activarla, hay que **sincronizar el blueprint**:

### Pasos en Render para activar Postgres

1. Hacé `git push` (ver más abajo) para subir los cambios.
2. En Render, entrá a tu **Blueprint** (`silvia`) → botón **Manual Sync**.
   - Render detecta la base nueva `silvia-db` y la crea.
   - Conecta `DATABASE_URL` al backend automáticamente.
3. El backend redeploya solo y arranca con Postgres. Lo confirmás en sus **Logs**:
   deberías ver `🗄️  Base de datos lista (postgres)`.
4. Listo: los datos ahora **persisten** aunque el servicio se reinicie. 🎉

> ⚠️ El backend igual **se duerme** tras 15 min sin uso (plan free): la primera
> visita tarda ~30s en despertar. Eso es normal y no afecta los datos.
>
> ⚠️ La base Postgres **gratis** de Render tiene vencimiento (~30 días); después
> hay que renovarla o pasar a un plan pago. Para un proyecto de portafolio está perfecto.

---

## 🔄 Actualizaciones futuras

Cada vez que hagas `git push` a `main`, Render redespliega automáticamente. ¡Así de fácil!
