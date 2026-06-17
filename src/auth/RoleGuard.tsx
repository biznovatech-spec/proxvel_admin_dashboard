/**
 * Restringe el acceso por rol. Por defecto exige admin o super_admin.
 * Un traveler autenticado es redirigido a la pantalla de acceso denegado (/403).
 */

import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from './useAuth'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  allow?: UserRole[]
}

export function RoleGuard({ allow = ['admin', 'super_admin'] }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
