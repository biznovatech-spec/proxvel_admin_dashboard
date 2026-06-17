/**
 * Protege rutas que requieren sesión activa (token válido).
 * - Mientras se valida la sesión inicial, muestra un loader a pantalla completa.
 * - Sin token → redirige a /login (recordando el destino).
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from './useAuth'
import { FullScreenLoader } from '@/components/feedback/FullScreenLoader'

export function ProtectedRoute() {
  const { isAuthenticated, bootstrapping } = useAuth()
  const location = useLocation()

  if (bootstrapping) {
    return <FullScreenLoader label="Validando sesión administrativa…" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
