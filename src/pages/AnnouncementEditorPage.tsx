import { useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus, Save } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/dashboard/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { SelectField } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AnnouncementPreview } from '@/components/announcements/AnnouncementPreview'
import { PLACEMENT_OPTIONS, TEMPLATE_OPTIONS } from '@/utils/announcements'
import { useAnnouncement, useAnnouncementMutations } from '@/hooks/useAnnouncements'
import { isoToLocalInput, localInputToIso } from '@/utils/format'
import type { AnnouncementPayload } from '@/types'

const PLACEMENTS = ['app_start', 'home_top', 'destination_detail', 'global_modal'] as const
const TEMPLATES = [
  'image_banner',
  'gradient_card',
  'minimal_notice',
  'tourism_highlight',
  'maintenance_notice',
] as const

const schema = z
  .object({
    title: z.string().min(1, 'El título es obligatorio').max(160, 'Máximo 160 caracteres'),
    message: z.string().min(1, 'El mensaje es obligatorio'),
    placement: z.enum(PLACEMENTS),
    template_type: z.enum(TEMPLATES),
    cta_text: z.string().max(40, 'Máximo 40 caracteres').optional().or(z.literal('')),
    cta_url: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
    starts_at: z.string().optional().or(z.literal('')),
    ends_at: z.string().optional().or(z.literal('')),
    duration_seconds: z
      .number({ message: 'Ingresa una duración' })
      .int('Debe ser un número entero')
      .min(1, 'La duración debe ser mayor a 0')
      .max(120, 'Máximo 120 segundos'),
    priority: z
      .number({ message: 'Ingresa una prioridad' })
      .int('Debe ser un número entero')
      .min(0, 'Mínimo 0')
      .max(1000, 'Máximo 1000'),
    is_active: z.boolean(),
  })
  .refine(
    (d) => {
      if (d.starts_at && d.ends_at) return new Date(d.ends_at) > new Date(d.starts_at)
      return true
    },
    { message: 'La fecha de fin debe ser posterior a la de inicio', path: ['ends_at'] },
  )

type FormValues = z.infer<typeof schema>

const DEFAULTS: FormValues = {
  title: '',
  message: '',
  placement: 'app_start',
  template_type: 'gradient_card',
  cta_text: '',
  cta_url: '',
  starts_at: '',
  ends_at: '',
  duration_seconds: 5,
  priority: 0,
  is_active: true,
}

export function AnnouncementEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const numericId = id ? Number(id) : undefined
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const existing = useAnnouncement(numericId)
  const { create, update, uploadImage } = useAnnouncementMutations()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULTS,
  })

  // Cargar valores al editar
  useEffect(() => {
    if (isEdit && existing.data) {
      const a = existing.data
      reset({
        title: a.title,
        message: a.message,
        placement: a.placement,
        template_type: a.template_type,
        cta_text: a.cta_text ?? '',
        cta_url: a.cta_url ?? '',
        starts_at: isoToLocalInput(a.starts_at),
        ends_at: isoToLocalInput(a.ends_at),
        duration_seconds: a.duration_seconds,
        priority: a.priority,
        is_active: a.is_active,
      })
    }
  }, [isEdit, existing.data, reset])

  const values = useWatch({ control })

  const buildPayload = (data: FormValues): AnnouncementPayload => ({
    title: data.title,
    message: data.message,
    placement: data.placement,
    template_type: data.template_type,
    cta_text: data.cta_text ? data.cta_text : null,
    cta_url: data.cta_url ? data.cta_url : null,
    starts_at: localInputToIso(data.starts_at || null),
    ends_at: localInputToIso(data.ends_at || null),
    duration_seconds: data.duration_seconds,
    priority: data.priority,
    is_active: data.is_active,
  })

  const onSubmit = (data: FormValues) => {
    const payload = buildPayload(data)
    if (isEdit && numericId) {
      update.mutate({ id: numericId, payload }, { onSuccess: () => navigate('/anuncios') })
    } else {
      create.mutate(payload, {
        onSuccess: (created) => navigate(`/anuncios/${created.id}`),
      })
    }
  }

  const handleImage = (file: File | undefined) => {
    if (!file || !numericId) return
    if (!file.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen.')
      return
    }
    uploadImage.mutate({ id: numericId, file })
  }

  if (isEdit && existing.isLoading) {
    return (
      <div>
        <PageHeader title="Editar anuncio" backTo="/anuncios" backLabel="Volver a anuncios" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Editar anuncio' : 'Nuevo anuncio'}
        description="Configura el contenido, la ubicación y la programación del anuncio."
        backTo="/anuncios"
        backLabel="Volver a anuncios"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Contenido */}
          <Card>
            <CardHeader>
              <CardTitle>Contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input id="title" {...register('title')} placeholder="Destino destacado de la semana" />
                {errors.title ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="message">Mensaje *</Label>
                <Textarea
                  id="message"
                  {...register('message')}
                  placeholder="Describe la promoción o el mensaje que verá el viajero."
                />
                {errors.message ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.message.message}</p>
                ) : null}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cta_text">Texto del botón (CTA)</Label>
                  <Input id="cta_text" {...register('cta_text')} placeholder="Ver más" />
                  {errors.cta_text ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.cta_text.message}</p>
                  ) : null}
                </div>
                <div>
                  <Label htmlFor="cta_url">URL del botón</Label>
                  <Input id="cta_url" {...register('cta_url')} placeholder="https://…" />
                  {errors.cta_url ? (
                    <p className="mt-1 text-xs text-rose-600">{errors.cta_url.message}</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Presentación */}
          <Card>
            <CardHeader>
              <CardTitle>Presentación y ubicación</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Plantilla visual</Label>
                <Controller
                  control={control}
                  name="template_type"
                  render={({ field }) => (
                    <SelectField
                      value={field.value}
                      onValueChange={field.onChange}
                      options={TEMPLATE_OPTIONS}
                    />
                  )}
                />
              </div>
              <div>
                <Label>Ubicación (placement)</Label>
                <Controller
                  control={control}
                  name="placement"
                  render={({ field }) => (
                    <SelectField
                      value={field.value}
                      onValueChange={field.onChange}
                      options={PLACEMENT_OPTIONS}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Programación */}
          <Card>
            <CardHeader>
              <CardTitle>Programación</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="starts_at">Inicio</Label>
                <Input id="starts_at" type="datetime-local" {...register('starts_at')} />
              </div>
              <div>
                <Label htmlFor="ends_at">Fin</Label>
                <Input id="ends_at" type="datetime-local" {...register('ends_at')} />
                {errors.ends_at ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.ends_at.message}</p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="duration_seconds">Duración visible (segundos) *</Label>
                <Input
                  id="duration_seconds"
                  type="number"
                  min={1}
                  max={120}
                  {...register('duration_seconds', { valueAsNumber: true })}
                />
                {errors.duration_seconds ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.duration_seconds.message}</p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="priority">Prioridad *</Label>
                <Input
                  id="priority"
                  type="number"
                  min={0}
                  max={1000}
                  {...register('priority', { valueAsNumber: true })}
                />
                {errors.priority ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.priority.message}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 sm:col-span-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">Anuncio activo</p>
                  <p className="text-xs text-slate-400">
                    Si está inactivo no se mostrará en la app aunque esté en rango de fechas.
                  </p>
                </div>
                <Controller
                  control={control}
                  name="is_active"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Imagen de fondo */}
          <Card>
            <CardHeader>
              <CardTitle>Imagen de fondo</CardTitle>
            </CardHeader>
            <CardContent>
              {isEdit ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-20 w-32 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {existing.data?.background_image_url ? (
                      <img
                        src={existing.data.background_image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-300">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImage(e.target.files?.[0])}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileRef.current?.click()}
                    loading={uploadImage.isPending}
                    leftIcon={<ImagePlus className="h-4 w-4" />}
                  >
                    Subir imagen (vía backend)
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Guarda el anuncio primero para habilitar la subida de la imagen de fondo. La
                  imagen se sube de forma segura a través del backend, nunca directo a Cloudinary.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/anuncios')}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={isSubmitting || create.isPending || update.isPending}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isEdit ? 'Guardar cambios' : 'Crear anuncio'}
            </Button>
          </div>
        </div>

        {/* Vista previa */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <AnnouncementPreview
              title={values.title ?? ''}
              message={values.message ?? ''}
              template={values.template_type ?? 'gradient_card'}
              placement={values.placement ?? 'app_start'}
              ctaText={values.cta_text}
              backgroundImageUrl={existing.data?.background_image_url}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
