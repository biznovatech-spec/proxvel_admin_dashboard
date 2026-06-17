import type { HTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-[11px] font-bold tracking-wide',
  {
    variants: {
      variant: {
        neutral: 'bg-slate-100 text-slate-600 border border-slate-200',
        success: 'bg-navy-900/8 text-navy-800 border border-navy-900/15',
        info:    'bg-navy-900/10 text-navy-900 border border-navy-900/20',
        warning: 'bg-gold-500/12 text-gold-700 border border-gold-400/30',
        danger:  'bg-rose-50 text-rose-600 border border-rose-200',
        outline: 'border border-slate-300 bg-transparent text-slate-600',
        gold:    'bg-gold-500 text-navy-900 border-0',
        navy:    'bg-navy-900 text-white border-0',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
