import type {
  AnnouncementPlacement,
  AnnouncementStatus,
  AnnouncementTemplate,
} from '@/types'
import type { SelectOption } from '@/components/ui/select'

export const PLACEMENT_LABELS: Record<AnnouncementPlacement, string> = {
  app_start: 'Inicio de la app',
  home_top: 'Home (parte superior)',
  destination_detail: 'Detalle de destino',
  global_modal: 'Modal global',
}

export const TEMPLATE_LABELS: Record<AnnouncementTemplate, string> = {
  image_banner: 'Banner con imagen',
  gradient_card: 'Tarjeta con degradado',
  minimal_notice: 'Aviso minimalista',
  tourism_highlight: 'Destacado turístico',
  maintenance_notice: 'Aviso de mantenimiento',
}

export const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  active: 'Activo',
  scheduled: 'Programado',
  expired: 'Expirado',
  inactive: 'Inactivo',
}

export const STATUS_BADGE: Record<
  AnnouncementStatus,
  'success' | 'info' | 'warning' | 'neutral'
> = {
  active: 'success',
  scheduled: 'info',
  expired: 'warning',
  inactive: 'neutral',
}

export const PLACEMENT_OPTIONS: SelectOption[] = (
  Object.keys(PLACEMENT_LABELS) as AnnouncementPlacement[]
).map((value) => ({ value, label: PLACEMENT_LABELS[value] }))

export const TEMPLATE_OPTIONS: SelectOption[] = (
  Object.keys(TEMPLATE_LABELS) as AnnouncementTemplate[]
).map((value) => ({ value, label: TEMPLATE_LABELS[value] }))

/** Degradados de fondo por plantilla para la vista previa. */
export const TEMPLATE_GRADIENTS: Record<AnnouncementTemplate, string> = {
  image_banner: 'from-slate-700 to-slate-900',
  gradient_card: 'from-jungle-500 to-lake-600',
  minimal_notice: 'from-slate-100 to-slate-200',
  tourism_highlight: 'from-sand-400 to-jungle-600',
  maintenance_notice: 'from-amber-500 to-rose-600',
}
