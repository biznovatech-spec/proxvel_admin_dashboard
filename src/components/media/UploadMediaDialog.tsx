import { useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectField } from '@/components/ui/select'
import type { ReactNode } from 'react'
import type { MediaType } from '@/types'
import { useMediaMutations } from '@/hooks/useMedia'

const MAX_SIZE_MB = 5
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

interface UploadMediaDialogProps {
  destinationId: string
  defaultType?: MediaType
  trigger: ReactNode
}

export function UploadMediaDialog({
  destinationId,
  defaultType = 'gallery',
  trigger,
}: UploadMediaDialogProps) {
  const { upload } = useMediaMutations(destinationId)
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<MediaType>(defaultType)
  const [altText, setAltText] = useState('')
  const [progress, setProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setFile(null)
    setPreview(null)
    setAltText('')
    setProgress(0)
    setMediaType(defaultType)
  }

  const validateAndSet = (selected: File | undefined) => {
    if (!selected) return
    if (!ALLOWED.includes(selected.type)) {
      toast.error('Formato no permitido. Usa JPG, PNG, WEBP o GIF.')
      return
    }
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`La imagen supera el máximo de ${MAX_SIZE_MB} MB.`)
      return
    }
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleSubmit = () => {
    if (!file) {
      toast.error('Selecciona una imagen primero.')
      return
    }
    upload.mutate(
      { file, mediaType, altText: altText.trim() || undefined, onProgress: setProgress },
      {
        onSuccess: () => {
          setOpen(false)
          reset()
        },
      },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) reset()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir imagen</DialogTitle>
          <DialogDescription>
            La imagen se sube de forma segura a través del backend (nunca directo a Cloudinary).
            Máximo {MAX_SIZE_MB} MB · JPG, PNG, WEBP o GIF.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {preview ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200">
              <img src={preview} alt="Vista previa" className="max-h-56 w-full object-cover" />
              <button
                type="button"
                onClick={reset}
                className="absolute right-2 top-2 rounded-full bg-slate-900/60 p-1 text-white hover:bg-slate-900"
                aria-label="Quitar imagen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center transition-colors hover:border-jungle-300 hover:bg-jungle-50/40"
            >
              <UploadCloud className="h-8 w-8 text-slate-300" />
              <span className="text-sm font-medium text-slate-600">
                Haz clic para seleccionar una imagen
              </span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED.join(',')}
            className="hidden"
            onChange={(e) => validateAndSet(e.target.files?.[0])}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Tipo de imagen</Label>
              <SelectField
                value={mediaType}
                onValueChange={(v) => setMediaType(v as MediaType)}
                options={[
                  { value: 'cover', label: 'Portada' },
                  { value: 'gallery', label: 'Galería' },
                ]}
              />
            </div>
            <div>
              <Label htmlFor="alt">Texto alternativo</Label>
              <Input
                id="alt"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="Descripción de la imagen"
              />
            </div>
          </div>

          {upload.isPending ? (
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-jungle-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={upload.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={upload.isPending} disabled={!file}>
            Subir imagen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
