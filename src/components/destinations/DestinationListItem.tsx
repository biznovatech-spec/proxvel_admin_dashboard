import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, MapPin, Power, PowerOff } from 'lucide-react'
import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { useSetDestinationStatus } from '@/hooks/useDestinations'
import { cn } from '@/lib/utils'
import type { DestinationSummary } from '@/types'

interface Props {
  destination: DestinationSummary
  index?: number
}

export function DestinationListItem({ destination, index = 0 }: Props) {
  const hasCover = Boolean(destination.cover_image_url)
  const isActive = destination.is_active
  const setStatus = useSetDestinationStatus()
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'card-hover-gold group flex flex-col overflow-hidden rounded-xl border bg-white shadow-soft',
        isActive ? 'border-slate-200/80' : 'border-rose-200',
      )}
    >
      {/* Imagen */}
      <div className={cn('relative h-44 w-full overflow-hidden bg-slate-100', !isActive && 'opacity-60 grayscale')}>
        {hasCover ? (
          <img
            src={destination.cover_image_url as string}
            alt={destination.destination}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-106"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5" />
            </svg>
            <span className="text-xs font-medium">Sin portada</span>
          </div>
        )}

        {/* Gold shimmer on hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'linear-gradient(135deg, rgba(216,155,31,0.08) 0%, transparent 60%)' }}
        />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {hasCover ? (
            <Badge variant="navy" className="shadow">Con portada</Badge>
          ) : (
            <Badge variant="warning" className="shadow">Sin portada</Badge>
          )}
        </div>
        {!isActive && (
          <div className="absolute right-3 top-3">
            <Badge variant="danger" className="shadow">Inactivo</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-bold leading-snug text-slate-900 line-clamp-1">
            {destination.destination}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
            {destination.category ? (
              <span className="inline-flex items-center gap-1 font-medium">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#d89b1f' }} />
                {destination.category}
              </span>
            ) : null}
            {destination.region || destination.city ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {[destination.city, destination.region].filter(Boolean).join(', ')}
              </span>
            ) : null}
          </div>
          <code className="mt-1.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            {destination.destination_id}
          </code>
        </div>

        <div className="mt-auto flex gap-2">
          <Button asChild variant="secondary" size="sm" className="flex-1">
            <Link to={`/destinos/${destination.destination_id}`}>
              <Eye className="h-4 w-4" />
              Gestionar
            </Link>
          </Button>
          <Button
            variant={isActive ? 'ghost' : 'primary'}
            size="sm"
            onClick={() => setConfirmOpen(true)}
            loading={setStatus.isPending}
            leftIcon={isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            title={isActive ? 'Desactivar destino' : 'Activar destino'}
          >
            {isActive ? 'Desactivar' : 'Activar'}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isActive ? 'Desactivar destino' : 'Activar destino'}
        description={
          isActive
            ? 'El destino dejará de mostrarse en la app (catálogo y mapa), pero se conserva en el sistema. Podrás reactivarlo cuando quieras.'
            : 'El destino volverá a mostrarse en la app pública.'
        }
        confirmLabel={isActive ? 'Desactivar' : 'Activar'}
        variant={isActive ? 'danger' : 'primary'}
        loading={setStatus.isPending}
        onConfirm={() =>
          setStatus.mutate(
            { id: destination.destination_id, isActive: !isActive },
            { onSuccess: () => setConfirmOpen(false) },
          )
        }
      />
    </motion.div>
  )
}
