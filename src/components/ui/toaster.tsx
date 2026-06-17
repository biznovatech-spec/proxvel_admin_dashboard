import { Toaster as SonnerToaster } from 'sonner'

/** Toaster global del dashboard (Sonner) con estilo PROXVEL. */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'rounded-xl border border-slate-200 shadow-soft-lg text-sm',
        },
      }}
    />
  )
}
