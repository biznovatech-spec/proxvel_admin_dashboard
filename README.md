# PROXVEL · Panel Administrativo

Dashboard web para administrar el contenido turístico de PROXVEL (destinos, multimedia y
anuncios internos). Conectado al backend real (FastAPI + JWT/RBAC).

## Stack

React 19 · Vite 8 · TypeScript · TailwindCSS 3 · React Router 7 · TanStack Query 5 ·
Axios · React Hook Form + Zod · Framer Motion · Lucide React · Recharts · Radix UI · Sonner.

## Requisitos

- Node 18+ (probado con Node 24)
- Backend PROXVEL corriendo (por defecto en `http://127.0.0.1:8000/api/v1`)

## Configuración

Copia `.env.example` a `.env` y ajusta la URL del backend:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_APP_VERSION=0.1.0-beta
```

> No coloques secretos aquí. El dashboard solo usa la URL pública del backend; las claves
> de Cloudinary y el `SECRET_KEY` del JWT viven exclusivamente en el backend.

## Scripts

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # type-check + build de producción (dist/)
npm run lint     # ESLint
npm run preview  # previsualizar el build
```

## Acceso

- Solo roles `admin` y `super_admin` pueden usar el panel.
- Un `traveler` autenticado es redirigido a la pantalla de **Acceso denegado** (`/403`).
- El primer administrador se crea desde el backend (nunca desde el dashboard):

```bash
cd ../proxvel_backend
python scripts/create_admin_user.py --role super_admin
```

## Estructura

```
src/
  api/         apiClient (axios + interceptores 401/403) y endpoints tipados
  app/         providers, router y navegación
  auth/        store de sesión, servicio, guards (ProtectedRoute, RoleGuard)
  components/  ui (primitivos), dashboard, destinations, media, announcements, metrics, feedback
  hooks/       hooks de datos (TanStack Query)
  layouts/     AuthLayout, DashboardLayout
  pages/       una página por ruta
  utils/       formato de fechas, constantes de anuncios
  config/      env.ts
```

Consulta el reporte completo en `../docs/reporte_fase_5A_dashboard_admin_mvp.md`.
