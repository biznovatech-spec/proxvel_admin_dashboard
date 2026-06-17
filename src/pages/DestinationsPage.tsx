import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPinned, SlidersHorizontal, Plus, FileSpreadsheet } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectField, type SelectOption } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { ErrorState } from '@/components/feedback/ErrorState'
import { DestinationListItem } from '@/components/destinations/DestinationListItem'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDestinations, useCreateDestination } from '@/hooks/useDestinations'
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

const createSchema = z.object({
  name:     z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  city:     z.string().optional().or(z.literal('')),
  region:   z.string().optional().or(z.literal('')),
  category: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
})
type CreateForm = z.infer<typeof createSchema>

export function DestinationsPage() {
  const navigate         = useNavigate()
  const { data, isLoading, isError, refetch } = useDestinations()
  const createMutation   = useCreateDestination()
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('all')
  const [cover, setCover]       = useState('all')
  const [status, setStatus]     = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const debouncedSearch = useDebounce(search, 250)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: '', city: '', region: '', category: '', description: '' },
  })

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

  const onSubmit = (values: CreateForm) => {
    const payload = {
      name:     values.name,
      city:     values.city || undefined,
      region:   values.region || undefined,
      category: values.category || undefined,
      description: values.description || undefined,
    }
    createMutation.mutate(payload, {
      onSuccess: (created) => {
        setCreateOpen(false)
        reset()
        navigate(`/destinos/${created.destination_id}`)
      },
    })
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
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuevo destino
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
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Crear primer destino
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((d, i) => (
            <DestinationListItem key={d.destination_id} destination={d} index={i} />
          ))}
        </div>
      )}

      {/* Dialog — Nuevo destino */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) reset() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nuevo destino turístico</DialogTitle>
          </DialogHeader>

          <form id="create-dest-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="dest-name">Nombre del destino *</Label>
              <Input id="dest-name" {...register('name')} placeholder="Ej. Lago Titicaca" />
              {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
              <p className="mt-1 text-[11px] text-slate-400">
                El ID (slug) se genera automáticamente desde el nombre.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="dest-city">Ciudad</Label>
                <Input id="dest-city" {...register('city')} placeholder="Puno" />
              </div>
              <div>
                <Label htmlFor="dest-region">Región</Label>
                <Input id="dest-region" {...register('region')} placeholder="Puno" />
              </div>
              <div>
                <Label htmlFor="dest-category">Categoría</Label>
                <Input id="dest-category" {...register('category')} placeholder="Sitios Naturales" />
              </div>
            </div>

            <div>
              <Label htmlFor="dest-description">Descripción</Label>
              <textarea
                id="dest-description"
                {...register('description')}
                rows={3}
                placeholder="Breve descripción del destino…"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-400/40"
              />
            </div>
          </form>

          <DialogFooter>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset() }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              form="create-dest-form"
              loading={isSubmitting || createMutation.isPending}
            >
              Crear destino
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
