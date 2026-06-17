import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Megaphone, Plus } from 'lucide-react'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { STATUS_LABELS } from '@/utils/announcements'
import type { AnnouncementStatus } from '@/types'
import { cn } from '@/lib/utils'

type Filter = 'all' | AnnouncementStatus
const FILTERS: Filter[] = ['all', 'active', 'scheduled', 'expired', 'inactive']

export function AnnouncementsPage() {
  const { data, isLoading, isError, refetch } = useAnnouncements()
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(
    () => (data ?? []).filter((a) => filter === 'all' || a.status === filter),
    [data, filter],
  )

  return (
    <div>
      <PageHeader
        title="Anuncios internos"
        description="Banners y mensajes promocionales que se mostrarán dentro de la app móvil PROXVEL."
        actions={
          <Button asChild>
            <Link to="/anuncios/nuevo">
              <Plus className="h-4 w-4" />
              Crear anuncio
            </Link>
          </Button>
        }
      />

      {/* Filtros por estado */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const count =
            f === 'all'
              ? (data?.length ?? 0)
              : (data ?? []).filter((a) => a.status === f).length
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                filter === f
                  ? 'bg-jungle-600 text-white shadow-soft'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              )}
            >
              {f === 'all' ? 'Todos' : STATUS_LABELS[f]}
              <span className={cn('ml-1.5 text-xs', filter === f ? 'text-white/70' : 'text-slate-400')}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={
            (data?.length ?? 0) === 0
              ? 'Aún no hay anuncios'
              : 'Sin anuncios para este filtro'
          }
          description={
            (data?.length ?? 0) === 0
              ? 'Crea tu primer anuncio interno para destacar contenido turístico en la app móvil.'
              : 'Prueba con otro estado en los filtros.'
          }
          action={
            (data?.length ?? 0) === 0 ? (
              <Button asChild>
                <Link to="/anuncios/nuevo">
                  <Plus className="h-4 w-4" />
                  Crear anuncio
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      )}
    </div>
  )
}
