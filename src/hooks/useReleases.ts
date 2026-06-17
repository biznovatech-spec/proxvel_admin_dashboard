import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { releasesApi } from '@/api/endpoints'
import { getApiErrorMessage } from '@/api/apiClient'
import type { ReleaseCreatePayload } from '@/types'

export function useReleases() {
  return useQuery({
    queryKey: ['releases', 'list'],
    queryFn: () => releasesApi.list(),
    staleTime: 30_000,
  })
}

export function useCreateRelease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, onProgress }: { payload: ReleaseCreatePayload; onProgress?: (p: number) => void }) =>
      releasesApi.create(payload, onProgress),
    onSuccess: () => {
      toast.success('Versión registrada')
      queryClient.invalidateQueries({ queryKey: ['releases', 'list'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo registrar la versión')),
  })
}

export function usePublishRelease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: number; isPublished: boolean }) =>
      releasesApi.publish(id, isPublished),
    onSuccess: (_, variables) => {
      toast.success(variables.isPublished ? 'Versión publicada' : 'Versión despublicada')
      queryClient.invalidateQueries({ queryKey: ['releases', 'list'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo cambiar la publicación')),
  })
}

export function useDeleteRelease() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => releasesApi.remove(id),
    onSuccess: () => {
      toast.success('Versión eliminada')
      queryClient.invalidateQueries({ queryKey: ['releases', 'list'] })
    },
    onError: (err) => toast.error(getApiErrorMessage(err, 'No se pudo eliminar la versión')),
  })
}
