import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPinned, SlidersHorizontal, FileSpreadsheet } from 'lucide-react'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SelectField, type SelectOption } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { DestinationListItem } from '@/components/destinations/DestinationListItem'
import { useDestinations, useSyncFromMetrics } from '@/hooks/useDestinations'
import { useDebounce } from '@/hooks/useDebounce'


const COVER_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todas las portadas' },
  { value: 'with', label: 'Con portada' },
  { value: 'without', label: 'Sin portada' },
]

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
]

export function DestinationsPage() {
  const navigate         = useNavigate()
  const { data, isLoading, isError, refetch } = useDestinations()
  const syncMutation     = useSyncFromMetrics()
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('all')
  const [cover, setCover]       = useState('all')
  const [status, setStatus]     = useState('all')
  const debouncedSearch = useDebounce(search, 250)

  const categoryOptions = useMemo<SelectOption[]>(() => {
    const set = new Set<string>()
    for (const d of data ?? []) if (d.category) set.add(d.category)
    return [
      { value: 'all', label: 'Todas las categorías' },
      ...[...set].sort().map((c) => ({ value: c, label: c })),
    ]
  }, [data])

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase()
    return (data ?? []).filter((d) => {
      const matchesTerm =
        !term ||
        d.destination.toLowerCase().includes(term) ||
        (d.city ?? '').toLowerCase().includes(term) ||
        d.destination_id.toLowerCase().includes(term)
      const matchesCategory = category === 'all' || d.category === category
      const hasCover = Boolean(d.cover_image_url)
      const matchesCover = cover === 'all' || (cover === 'with' ? hasCover : !hasCover)
      const matchesStatus = status === 'all' || (status === 'active' ? d.is_active : !d.is_active)
      return matchesTerm && matchesCategory && matchesCover && matchesStatus
    })
  }, [data, debouncedSearch, category, cover, status])

  const handleSync = () => {
    syncMutation.mutate()
  }

  return (
    <div>
      <PageHeader
        title="Destinos turísticos"
        description="Catálogo de destinos conectado al backend. Gestiona su multimedia y revisa su estado."
        actions={
          <div className="flex items-center gap-3">
            {data && (
              <Badge variant="neutral">
                {data.length} destino{data.length === 1 ? '' : 's'}
              </Badge>
            )}
            <Button variant="secondary" size="sm" onClick={() => navigate('/destinos/importar')}>
              <FileSpreadsheet className="h-4 w-4" />
              Importar Excel
            </Button>
            <Button size="sm" onClick={handleSync} loading={syncMutation.isPending}>
              Recalcular estados
            </Button>
          </div>
        }
      />

      {/* Filtros */}
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-soft md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, ciudad o identificador…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="hidden h-4 w-4 text-slate-400 md:block" />
          <SelectField value={category} onValueChange={setCategory} options={categoryOptions} className="w-full md:w-48" ariaLabel="Filtrar por categoría" />
          <SelectField value={cover}    onValueChange={setCover}    options={COVER_OPTIONS}   className="w-full md:w-44" ariaLabel="Filtrar por portada" />
          <SelectField value={status}   onValueChange={setStatus}   options={STATUS_OPTIONS}  className="w-full md:w-36" ariaLabel="Filtrar por estado" />
        </div>
      </div>

      {/* Lista */}
      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-slate-200/80 bg-white">
              <Skeleton className="h-44 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="mt-3 h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MapPinned}
          title="No se encontraron destinos"
          description={
            (data?.length ?? 0) === 0
              ? 'El backend no devolvió destinos. Verifica la base de datos o la carga inicial.'
              : 'Ajusta los filtros o el término de búsqueda para ver resultados.'
          }
          action={
            <Button onClick={handleSync} loading={syncMutation.isPending}>
              Sincronizar destinos iniciales
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((d, i) => (
            <DestinationListItem key={d.destination_id} destination={d} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
