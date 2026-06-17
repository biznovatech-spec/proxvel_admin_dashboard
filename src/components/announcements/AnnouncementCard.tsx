import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Pencil, Trash2, Timer, ArrowUpNarrowWide } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { useAnnouncementMutations } from '@/hooks/useAnnouncements'
import {
  PLACEMENT_LABELS,
  STATUS_BADGE,
  STATUS_LABELS,
  TEMPLATE_GRADIENTS,
  TEMPLATE_LABELS,
} from '@/utils/announcements'
import { formatDate } from '@/utils/format'
import type { Announcement } from '@/types'

export function AnnouncementCard({ announcement: a }: { announcement: Announcement }) {
  const { update, remove } = useAnnouncementMutations()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleToggle = (checked: boolean) => {
    update.mutate({ id: a.id, payload: { is_active: checked } })
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft transition-shadow hover:shadow-soft-lg sm:flex-row">
      {/* Franja/preview por plantilla */}
      <div
        className={`relative hidden w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br sm:block ${TEMPLATE_GRADIENTS[a.template_type]}`}
      >
        {a.background_image_url ? (
          <img
            src={a.background_image_url}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={STATUS_BADGE[a.status]}>{STATUS_LABELS[a.status]}</Badge>
          <Badge variant="outline">{PLACEMENT_LABELS[a.placement]}</Badge>
          <Badge variant="neutral">{TEMPLATE_LABELS[a.template_type]}</Badge>
        </div>
        <h3 className="mt-2 truncate font-semibold text-slate-900">{a.title}</h3>
        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">{a.message}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {formatDate(a.starts_at)} → {formatDate(a.ends_at)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Timer className="h-3.5 w-3.5" />
            {a.duration_seconds}s
          </span>
          <span className="inline-flex items-center gap-1">
            <ArrowUpNarrowWide className="h-3.5 w-3.5" />
            Prioridad {a.priority}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{a.is_active ? 'Activo' : 'Inactivo'}</span>
          <Switch
            checked={a.is_active}
            onCheckedChange={handleToggle}
            disabled={update.isPending}
            aria-label="Activar o desactivar anuncio"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="secondary" size="sm">
            <Link to={`/anuncios/${a.id}`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setConfirmOpen(true)}
            aria-label="Eliminar anuncio"
            className="text-rose-500 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar anuncio"
        description={`¿Seguro que deseas eliminar "${a.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        loading={remove.isPending}
        onConfirm={() => remove.mutate(a.id, { onSuccess: () => setConfirmOpen(false) })}
      />
    </div>
  )
}
