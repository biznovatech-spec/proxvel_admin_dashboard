import { Spinner } from '@/components/ui/spinner'

export function FullScreenLoader({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50">
      <Spinner className="h-8 w-8" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  )
}
