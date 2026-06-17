import { cn } from '@/lib/utils'

interface BrandProps {
  className?: string
  size?: 'sm' | 'md'
  subtitle?: string
  /** true = logo blanco (para fondos oscuros), false = logo oscuro (fondos claros) */
  light?: boolean
}

export function Brand({ className, size = 'md', subtitle, light = false }: BrandProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src="/proxvel_logo.png"
        alt="PROXVEL"
        className={cn(
          'object-contain',
          size === 'sm' ? 'h-7' : 'h-9',
          !light && 'brightness-0',   // oscuro sobre fondos claros
        )}
      />
      {subtitle ? (
        <p className={cn('text-xs font-semibold tracking-wide', light ? 'text-white/60' : 'text-slate-400')}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

/** Marca standalone (solo ícono placeholder cuando no hay logo) */
export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl bg-navy-900 text-gold-400 shadow-navy',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none">
        <path d="M7 17V7h4.2c2.1 0 3.4 1.2 3.4 3.1S13.3 13 11.2 13H9.4v4H7Z" fill="currentColor" />
        <circle cx="16.5" cy="8.5" r="1.6" fill="#d89b1f" />
      </svg>
    </div>
  )
}
