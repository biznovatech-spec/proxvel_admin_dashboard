import { useNavigate } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/auth/useAuth'
import { authService } from '@/auth/authService'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleLogout = () => {
    authService.logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-soft-lg">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Acceso denegado</h1>
        <p className="mt-2 text-sm text-slate-500">
          Esta cuenta no tiene permisos administrativos para acceder al panel de PROXVEL.
          El dashboard es exclusivo para roles <span className="font-medium">admin</span> y{' '}
          <span className="font-medium">super_admin</span>.
        </p>
        {user ? (
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Sesión actual: <span className="font-medium">{user.email}</span> · rol{' '}
            <span className="font-medium">{user.role}</span>
          </p>
        ) : null}
        <Button variant="primary" className="mt-6 w-full" onClick={handleLogout}>
          Cerrar sesión e ingresar con otra cuenta
        </Button>
      </div>
    </div>
  )
}
