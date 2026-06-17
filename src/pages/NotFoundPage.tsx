import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-jungle-50 to-lake-50 text-jungle-600">
          <Compass className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wider text-jungle-600">Error 404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Página no encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">
          La ruta que buscas no existe dentro del panel administrativo.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    </div>
  )
}
