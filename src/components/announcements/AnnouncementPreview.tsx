import { Megaphone } from 'lucide-react'

import { cn } from '@/lib/utils'
import { PLACEMENT_LABELS, TEMPLATE_GRADIENTS, TEMPLATE_LABELS } from '@/utils/announcements'
import type { AnnouncementPlacement, AnnouncementTemplate } from '@/types'

interface AnnouncementPreviewProps {
  title: string
  message: string
  template: AnnouncementTemplate
  placement: AnnouncementPlacement
  ctaText?: string | null
  backgroundImageUrl?: string | null
}

export function AnnouncementPreview({
  title,
  message,
  template,
  placement,
  ctaText,
  backgroundImageUrl,
}: AnnouncementPreviewProps) {
  const isMinimal = template === 'minimal_notice'
  const showImage = Boolean(backgroundImageUrl)

  return (
    <div className="mx-auto w-full max-w-[280px]">
      {/* Marco tipo móvil */}
      <div className="rounded-[2rem] border-8 border-slate-900 bg-slate-900 shadow-soft-lg">
        <div className="overflow-hidden rounded-[1.4rem] bg-slate-50">
          <div className="flex items-center justify-between bg-white px-4 py-2 text-[10px] font-medium text-slate-400">
            <span>9:41</span>
            <span className="capitalize">{PLACEMENT_LABELS[placement]}</span>
          </div>

          <div className="p-3">
            <div
              className={cn(
                'relative overflow-hidden rounded-2xl p-4 shadow-sm',
                !isMinimal && 'text-white',
                isMinimal && 'border border-slate-200 bg-white text-slate-800',
                !isMinimal && !showImage && `bg-gradient-to-br ${TEMPLATE_GRADIENTS[template]}`,
              )}
            >
              {showImage ? (
                <>
                  <img
                    src={backgroundImageUrl as string}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                </>
              ) : null}

              <div className="relative min-h-[120px]">
                <div
                  className={cn(
                    'mb-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide',
                    isMinimal ? 'bg-jungle-50 text-jungle-700' : 'bg-white/20 text-white',
                  )}
                >
                  <Megaphone className="h-2.5 w-2.5" />
                  {TEMPLATE_LABELS[template]}
                </div>
                <h3 className="text-sm font-bold leading-tight">
                  {title || 'Título del anuncio'}
                </h3>
                <p
                  className={cn(
                    'mt-1 line-clamp-3 text-xs',
                    isMinimal ? 'text-slate-500' : 'text-white/85',
                  )}
                >
                  {message || 'Mensaje del anuncio que verá el viajero en la app móvil.'}
                </p>
                {ctaText ? (
                  <span
                    className={cn(
                      'mt-3 inline-block rounded-lg px-3 py-1.5 text-xs font-semibold',
                      isMinimal ? 'bg-jungle-600 text-white' : 'bg-white text-slate-900',
                    )}
                  >
                    {ctaText}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">
        Vista previa aproximada en la app móvil
      </p>
    </div>
  )
}
