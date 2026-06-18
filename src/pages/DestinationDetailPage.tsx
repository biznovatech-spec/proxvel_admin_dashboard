import { useState, type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  ImageIcon,
  MapPin,
  Tag,
  ThermometerSun,
  Users2,
  ExternalLink,
  Pencil,
  Save,
  X,
  Info,
  Star,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useDestinationDetail, useUpdateDestination, useUpdateAbsaScores, useDestinationReviews } from '@/hooks/useDestinations'
import { MediaManager } from '@/pages/MediaManagerPage'
import type { AspectScores } from '@/types'
import { cn } from '@/lib/utils'

const ASPECT_LABELS: Record<keyof AspectScores, string> = {
  accesibilidad: 'Accesibilidad',
  aforo_multitudes: 'Aforo / multitudes',
  alojamiento: 'Alojamiento',
  atencion_servicio: 'Atención y servicio',
  atractivos: 'Atractivos',
  clima: 'Clima',
  costos: 'Costos',
  gastronomia: 'Gastronomía',
  limpieza: 'Limpieza',
  seguridad: 'Seguridad',
}

function AspectScoresCard({ scores }: { scores: AspectScores | null }) {
  const entries = (Object.keys(ASPECT_LABELS) as (keyof AspectScores)[]).map((key) => ({
    key,
    label: ASPECT_LABELS[key],
    value: scores?.[key] ?? null,
  }))

  const hasRealScores = entries.some((e) => e.value !== null && e.value !== undefined)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aspectos ABSA</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasRealScores ? (
          <p className="text-sm text-slate-400">
            Sin puntajes ABSA disponibles. Usa «Editar contexto» para configurarlos.
          </p>
        ) : (
          <div className="space-y-3">
            {entries.map((e) => {
              const val = e.value ?? 0.5
              const pct = Math.round(val * 100)
              const isNeutral = e.value === null || e.value === undefined
              return (
                <div key={e.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{e.label}</span>
                    <span className={cn('tabular-nums', isNeutral ? 'text-slate-300' : 'text-slate-400')}>
                      {isNeutral ? '—' : `${pct}%`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        isNeutral
                          ? 'bg-slate-200'
                          : 'bg-gradient-to-r from-jungle-400 to-jungle-600',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type AbsaFormState = Record<keyof AspectScores, number>

function buildAbsaForm(scores: AspectScores | null): AbsaFormState {
  const defaults = Object.fromEntries(
    (Object.keys(ASPECT_LABELS) as (keyof AspectScores)[]).map((k) => [
      k,
      Math.round(((scores?.[k] ?? 0.5) as number) * 100),
    ]),
  ) as AbsaFormState
  return defaults
}

function AspectScoresEditor({
  form,
  onChange,
}: {
  form: AbsaFormState
  onChange: (key: keyof AspectScores, pct: number) => void
}) {
  return (
    <div className="space-y-4">
      {(Object.keys(ASPECT_LABELS) as (keyof AspectScores)[]).map((key) => {
        const pct = form[key]
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">{ASPECT_LABELS[key]}</span>
              <span className="tabular-nums font-semibold text-jungle-700">{pct}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={pct}
              onChange={(e) => onChange(key, Number(e.target.value))}
              className="w-full accent-jungle-600"
            />
          </div>
        )
      })}
    </div>
  )
}

export function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, refetch } = useDestinationDetail(id)
  const updateMutation = useUpdateDestination()
  const updateAbsaMutation = useUpdateAbsaScores()

  const [searchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'multimedia' ? 'media' : 'info'
  const [activeTab, setActiveTab] = useState<'info' | 'media' | 'context' | 'tech' | 'comments'>(defaultTab as any)

  const { data: reviewsData, isLoading: isLoadingReviews } = useDestinationReviews(id)

  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [isEditingContext, setIsEditingContext] = useState(false)
  const [abssaForm, setAbsaForm] = useState<AbsaFormState>(() => buildAbsaForm(null))

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    region: '',
    category: '',
    description: '',
    official_source_name: '',
    official_source_url: '',
  })

  // Sync form data when edit is cancelled or started
  const startEditing = () => {
    if (data) {
      setFormData({
        name: data.destination || '',
        city: data.city || '',
        region: data.region || '',
        category: data.category || '',
        description: data.tourism_info?.description || '',
        official_source_name: data.tourism_info?.official_source_name || '',
        official_source_url: data.tourism_info?.official_source_url || '',
      })
    }
    setIsEditingInfo(true)
  }

  const handleSaveInfo = () => {
    if (!id) return
    updateMutation.mutate(
      { id, payload: formData },
      {
        onSuccess: () => {
          toast.success('Información del destino actualizada')
          setIsEditingInfo(false)
        },
        onError: (err) => {
          toast.error('Error al actualizar el destino')
          console.error(err)
        },
      }
    )
  }

  const handleCancelInfo = () => {
    setIsEditingInfo(false)
    if (data) {
      setFormData({
        name: data.destination || '',
        city: data.city || '',
        region: data.region || '',
        category: data.category || '',
        description: data.tourism_info?.description || '',
        official_source_name: data.tourism_info?.official_source_name || '',
        official_source_url: data.tourism_info?.official_source_url || '',
      })
    }
  }

  const startEditingContext = () => {
    setAbsaForm(buildAbsaForm(data?.aspect_scores ?? null))
    setIsEditingContext(true)
  }

  const handleSaveContext = () => {
    if (!id) return
    const scores = Object.fromEntries(
      (Object.keys(abssaForm) as (keyof AspectScores)[]).map((k) => [k, abssaForm[k] / 100]),
    ) as Record<keyof AspectScores, number>
    updateAbsaMutation.mutate(
      { id, scores },
      { onSuccess: () => setIsEditingContext(false) },
    )
  }

  if (isError) {
    return (
      <div>
        <PageHeader title="Detalle de destino" backTo="/destinos" backLabel="Volver a destinos" />
        <ErrorState onRetry={() => void refetch()} />
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div>
        <PageHeader title="Detalle de destino" backTo="/destinos" backLabel="Volver a destinos" />
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  const tourism = data.tourism_info
  const gallery = tourism?.gallery_images ?? []
  const location = [data.city, data.region].filter(Boolean).join(', ')

  return (
    <div>
      <PageHeader
        title={data.destination}
        backTo="/destinos"
        backLabel="Volver a destinos"
      />

      {/* Hero portada */}
      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-slate-100 sm:h-72">
        {data.cover_image_url ? (
          <img
            src={data.cover_image_url}
            alt={data.destination}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
            <ImageIcon className="h-10 w-10" />
            <span className="text-sm">Sin portada · gestiona la multimedia para agregar una</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-gradient-to-t from-slate-900/70 to-transparent p-4">
          {data.category ? (
            <Badge variant="success" className="bg-white/90 shadow-sm">
              <Tag className="h-3 w-3" /> {data.category}
            </Badge>
          ) : null}
          {location ? (
            <Badge variant="info" className="bg-white/90 shadow-sm">
              <MapPin className="h-3 w-3" /> {location}
            </Badge>
          ) : null}
          <Badge variant={data.is_active ? 'success' : 'danger'} className="bg-white/90 shadow-sm">
            {data.is_active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="mt-6 flex overflow-x-auto border-b border-slate-200">
        <button
          onClick={() => setActiveTab('info')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === 'info'
              ? 'border-jungle-600 text-jungle-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          )}
        >
          Información
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === 'media'
              ? 'border-jungle-600 text-jungle-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          )}
        >
          Multimedia
        </button>
        <button
          onClick={() => setActiveTab('context')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === 'context'
              ? 'border-jungle-600 text-jungle-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          )}
        >
          Contexto turístico
        </button>
        <button
          onClick={() => setActiveTab('tech')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === 'tech'
              ? 'border-jungle-600 text-jungle-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          )}
        >
          Estado técnico
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={cn(
            'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            activeTab === 'comments'
              ? 'border-jungle-600 text-jungle-700'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          )}
        >
          Comentarios
        </button>
      </div>

      <div className="mt-6">
        {/* TAB INFORMACIÓN */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              {!isEditingInfo && (
                <Button variant="outline" onClick={startEditing}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar información
                </Button>
              )}
              {isEditingInfo && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={handleCancelInfo} disabled={updateMutation.isPending}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveInfo} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Guardando...' : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar cambios
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos Básicos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditingInfo ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">Nombre del Destino</label>
                          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">Categoría</label>
                          <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">Ciudad</label>
                          <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">Región</label>
                          <Input value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Nombre del Destino" value={data.destination} />
                        <Field label="Categoría" value={data.category} />
                        <Field label="Ciudad" value={data.city} />
                        <Field label="Región" value={data.region} />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Descripción y Fuente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditingInfo ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700">Descripción</label>
                          <Textarea 
                            rows={4}
                            value={formData.description} 
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700">Nombre de la Fuente Oficial</label>
                            <Input value={formData.official_source_name} onChange={(e) => setFormData({ ...formData, official_source_name: e.target.value })} />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700">URL de la Fuente Oficial</label>
                            <Input value={formData.official_source_url} onChange={(e) => setFormData({ ...formData, official_source_url: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-1">Descripción</p>
                          {tourism?.description ? (
                            <p className="text-sm leading-relaxed text-slate-600">{tourism.description}</p>
                          ) : (
                            <p className="text-sm italic text-slate-400">
                              Este destino aún no tiene una descripción registrada en el catálogo turístico.
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field label="Fuente Oficial" value={tourism?.official_source_name} />
                          {tourism?.official_source_url && (
                            <div>
                              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mb-1">URL Oficial</p>
                              <a
                                href={tourism.official_source_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-sm font-medium text-lake-600 hover:text-lake-700"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                Visitar enlace
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Right (Gallery Summary) */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Galería</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {gallery.length === 0 ? (
                      <p className="text-sm italic text-slate-400">
                        Sin imágenes en la galería. Ve a la pestaña de Multimedia para subir fotos.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {gallery.slice(0, 4).map((url, i) => (
                          <div
                            key={i}
                            className="aspect-square overflow-hidden rounded-xl bg-slate-100"
                          >
                            <img src={url} alt={`${data.destination} ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                          </div>
                        ))}
                      </div>
                    )}
                    <Button variant="ghost" className="w-full mt-4 text-xs" onClick={() => setActiveTab('media')}>
                      Ver multimedia completa
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB MULTIMEDIA */}
        {activeTab === 'media' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {id && <MediaManager id={id} />}
          </div>
        )}

        {/* TAB CONTEXTO TURÍSTICO */}
        {activeTab === 'context' && (
          <div className="space-y-6">
            <div className="flex items-center justify-end gap-2">
              {!isEditingContext ? (
                <Button variant="outline" onClick={startEditingContext}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar puntajes ABSA
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditingContext(false)}
                    disabled={updateAbsaMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveContext} disabled={updateAbsaMutation.isPending}>
                    {updateAbsaMutation.isPending ? 'Guardando...' : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar puntajes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {isEditingContext && (
              <div className="flex items-start gap-3 rounded-xl border border-lake-200 bg-lake-50/50 p-4 text-sm text-lake-800">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Los puntajes van de <strong>0%</strong> (muy bajo) a <strong>100%</strong> (excelente).
                  El motor IA usa estos valores para calcular la compatibilidad con el perfil del viajero.
                  Destinos sin puntajes reales usan <strong>50%</strong> por defecto.
                </p>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                {isEditingContext ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Editar Aspectos ABSA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AspectScoresEditor
                        form={abssaForm}
                        onChange={(key, pct) => setAbsaForm((prev) => ({ ...prev, [key]: pct }))}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  <AspectScoresCard scores={data.aspect_scores} />
                )}
              </div>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Clima y Aforo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ContextRow
                      icon={<ThermometerSun className="h-4 w-4 text-sand-500" />}
                      label="Clima"
                      value={data.context?.weather_category}
                      score={data.context?.weather_score}
                    />
                    <ContextRow
                      icon={<Users2 className="h-4 w-4 text-lake-500" />}
                      label="Aforo"
                      value={data.context?.crowd_level}
                      score={data.context?.crowd_score}
                    />
                    <p className="mt-2 text-xs text-slate-400">
                      Clima y aforo se calculan automáticamente desde los datos de la BD.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TAB ESTADO TÉCNICO */}
        {activeTab === 'tech' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Atributos Técnicos Completos (Solo lectura)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  <Field label="ID" value={data.destination_id} mono />
                  <Field label="Estado" value={data.is_active ? 'Activo' : 'Inactivo'} />
                  <Field label="Categoría BD" value={data.category} />
                  <Field label="Tipo" value={data.type} />
                  <Field label="Subtipo" value={data.subtype} />
                  <Field label="Experiencia" value={tourism?.experience_type} />
                  <Field label="Cant. Imágenes" value={`${gallery.length + (data.cover_image_url ? 1 : 0)}`} />
                  <Field label="Portada Configurada" value={data.cover_image_url ? "Sí" : "No"} />
                  <Field label="Galería Configurada" value={gallery.length > 0 ? "Sí" : "No"} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB COMENTARIOS */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-jungle-600" />
                  Comentarios y Reseñas
                </CardTitle>
                <Badge variant="secondary">{reviewsData?.length || 0} reseñas</Badge>
              </CardHeader>
              <CardContent>
                {isLoadingReviews ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full rounded-xl" />
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ) : !reviewsData || reviewsData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <MessageSquare className="mb-3 h-10 w-10 text-slate-200" />
                    <p>Aún no hay comentarios para este destino.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewsData.map((review) => (
                      <div key={review.review_id} className="flex flex-col sm:flex-row gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        {review.image_url ? (
                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                            <img src={review.image_url} alt="Review" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-lg bg-jungle-50 text-jungle-600 border border-jungle-100">
                            <span className="text-2xl font-bold">{review.rating_general.toFixed(1)}</span>
                            <div className="flex items-center mt-1">
                              <Star className="h-3 w-3 fill-current" />
                            </div>
                          </div>
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-800 line-clamp-2">"{review.review_text}"</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Usuario ID: {review.user_id.slice(0, 8)}... • {review.processing_month || 'Fecha desconocida'}
                              </p>
                            </div>
                            {review.image_url && (
                              <div className="flex items-center gap-1 shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                                <Star className="h-3 w-3 fill-jungle-500 text-jungle-500" />
                                {review.rating_general.toFixed(1)}
                              </div>
                            )}
                          </div>
                          
                          {review.aspect_ratings && review.aspect_ratings.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-2">
                              {review.aspect_ratings.map((aspect, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[11px] border border-slate-200 shadow-sm">
                                  <span className="font-medium text-slate-600 capitalize">{aspect.aspect}</span>
                                  <span className="flex items-center text-slate-400">
                                    <Star className="h-2.5 w-2.5 fill-current text-amber-400 mr-0.5" />
                                    {aspect.rating.toFixed(1)}
                                  </span>
                                  {aspect.comment && (
                                    <span className="text-slate-400 ml-1 italic line-clamp-1 max-w-[150px]">
                                      "{aspect.comment}"
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value?: string | null
  mono?: boolean
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={cn('mt-0.5 truncate text-sm text-slate-700', mono && 'font-mono text-xs')}>
        {value || '—'}
      </p>
    </div>
  )
}

function ContextRow({
  icon,
  label,
  value,
  score,
}: {
  icon: ReactNode
  label: string
  value?: string | null
  score?: number | null
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-slate-600">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-medium text-slate-800">
        {value || '—'}
        {score !== null && score !== undefined ? (
          <span className="ml-1 text-xs text-slate-400">({Number(score).toFixed(2)})</span>
        ) : null}
      </span>
    </div>
  )
}
