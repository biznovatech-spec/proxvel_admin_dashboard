import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { mediaApi, adminDestinationsApi } from '@/api/endpoints'
import { getApiErrorMessage } from '@/api/apiClient'
import type { DestinationMediaAdmin, MediaType } from '@/types'

/** Media pública (solo activos) — para vista no-admin */
export function useDestinationMedia(id: string | undefined) {
  return useQuery({
    queryKey: ['media', id],
    queryFn: () => mediaApi.forDestination(id as string),
    enabled: Boolean(id),
  })
}

/** Media admin (activos + inactivos) — para MediaManager */
export function useAllDestinationMedia(id: string | undefined) {
  return useQuery({
    queryKey: ['media-admin', id],
    queryFn: () => adminDestinationsApi.allMedia(id as string),
    enabled: Boolean(id),
  })
}

export function useMediaMutations(destinationId: string) {
  const qc = useQueryClient()

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['media-admin', destinationId] })
    void qc.invalidateQueries({ queryKey: ['media', destinationId] })
    void qc.invalidateQueries({ queryKey: ['destinations'] })
    void qc.invalidateQueries({ queryKey: ['metrics'] })
  }

  /** Actualiza cache optimistamente sin refetch — para toggle is_active */
  const patchCache = (mediaId: number, updates: Partial<{ is_active: boolean; alt_text: string; position: number }>) => {
    qc.setQueryData<DestinationMediaAdmin>(['media-admin', destinationId], (old) => {
      if (!old) return old
      const applyPatch = (item: (typeof old.gallery)[0]) =>
        item.id === mediaId ? { ...item, ...updates } : item
      return {
        ...old,
        cover:           old.cover?.id === mediaId ? { ...old.cover, ...updates } : old.cover,
        inactive_covers: old.inactive_covers.map(applyPatch),
        gallery:         old.gallery.map(applyPatch),
        inactive_gallery: old.inactive_gallery.map(applyPatch),
      }
    })
  }

  const upload = useMutation({
    mutationFn: (vars: { file: File; mediaType: MediaType; altText?: string; onProgress?: (p: number) => void }) =>
      mediaApi.upload(destinationId, { file: vars.file, mediaType: vars.mediaType, altText: vars.altText }, vars.onProgress),
    onSuccess: () => {
      toast.success('Imagen subida correctamente')
      invalidate()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo subir la imagen')),
  })

  const patch = useMutation({
    mutationFn: (vars: { mediaId: number; updates: Partial<{ alt_text: string; position: number; is_active: boolean }> }) =>
      mediaApi.patch(destinationId, vars.mediaId, vars.updates),
    onMutate: (vars) => patchCache(vars.mediaId, vars.updates),
    onSuccess: (_, vars) => {
      if ('is_active' in vars.updates) {
        toast.success(vars.updates.is_active ? 'Imagen reactivada' : 'Imagen desactivada')
        // Solo invalidamos si cambió is_active (afecta la vista pública)
        void qc.invalidateQueries({ queryKey: ['media', destinationId] })
        void qc.invalidateQueries({ queryKey: ['destinations'] })
        void qc.invalidateQueries({ queryKey: ['metrics'] })
      } else {
        toast.success('Multimedia actualizada')
      }
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'No se pudo actualizar la multimedia'))
      invalidate()
    },
  })

  /** Soft delete (is_active = false) — el item queda en cache como inactivo */
  const deactivate = useMutation({
    mutationFn: (mediaId: number) => mediaApi.patch(destinationId, mediaId, { is_active: false }),
    onMutate: (mediaId) => {
      // Mover item a la lista de inactivos optimistamente
      qc.setQueryData<DestinationMediaAdmin>(['media-admin', destinationId], (old) => {
        if (!old) return old
        const fromGallery = old.gallery.find((m) => m.id === mediaId)
        const fromCover   = old.cover?.id === mediaId ? old.cover : null
        if (fromGallery) {
          return { ...old, gallery: old.gallery.filter((m) => m.id !== mediaId), inactive_gallery: [...old.inactive_gallery, { ...fromGallery, is_active: false }] }
        }
        if (fromCover) {
          return { ...old, cover: null, inactive_covers: [...old.inactive_covers, { ...fromCover, is_active: false }] }
        }
        return old
      })
    },
    onSuccess: () => {
      toast.success('Imagen desactivada')
      void qc.invalidateQueries({ queryKey: ['media', destinationId] })
      void qc.invalidateQueries({ queryKey: ['destinations'] })
      void qc.invalidateQueries({ queryKey: ['metrics'] })
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'No se pudo desactivar'))
      invalidate()
    },
  })

  /** Reactivar un item inactivo */
  const activate = useMutation({
    mutationFn: (mediaId: number) => mediaApi.patch(destinationId, mediaId, { is_active: true }),
    onSuccess: () => {
      toast.success('Imagen reactivada')
      invalidate()
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, 'No se pudo reactivar'))
      invalidate()
    },
  })

  /** Eliminación permanente (Cloudinary + BD) */
  const permanentDelete = useMutation({
    mutationFn: (mediaId: number) => adminDestinationsApi.permanentDelete(destinationId, mediaId),
    onSuccess: () => {
      toast.success('Imagen eliminada permanentemente')
      invalidate()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo eliminar la imagen')),
  })

  /** Guardar orden de galería */
  const saveOrder = useMutation({
    mutationFn: (items: { id: number; position: number }[]) =>
      Promise.all(items.map((it) => mediaApi.patch(destinationId, it.id, { position: it.position }))),
    onSuccess: () => {
      toast.success('Orden guardado')
      invalidate()
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo guardar el orden')),
  })

  // legacy alias
  const remove = deactivate

  return { upload, patch, deactivate, activate, permanentDelete, saveOrder, remove }
}
