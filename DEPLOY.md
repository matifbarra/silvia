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

## ⚠️ Importante sobre los datos (plan gratis)

En el plan **free** de Render:
- El backend **se duerme** tras 15 min sin uso. La primera visita después tarda ~30s en despertar (es normal).
- **El disco es efímero**: en cada redeploy o al despertar, el archivo SQLite puede reiniciarse → se pierden los datos.

Esto está bien para **mostrar/probar** el proyecto. Para que los datos **persistan de verdad**, tenés 2 caminos (más adelante):

1. **Disco persistente** (Render, plan pago ~US$1/mes): agregás un disco, lo montás en `/var/data`, y descomentás `DATABASE_DIR` en `render.yaml`.
2. **Base en la nube**: migrar de SQLite a PostgreSQL (Render tiene Postgres gratis por tiempo limitado). Es un cambio de código que podemos hacer como un bloque aparte.

---

## 🔄 Actualizaciones futuras

Cada vez que hagas `git push` a `main`, Render redespliega automáticamente. ¡Así de fácil!
