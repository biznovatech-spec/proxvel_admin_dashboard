/**
 * Cliente Axios central del dashboard.
 * - Inyecta el JWT en cada petición.
 * - Maneja 401 (sesión inválida/expirada → logout) y 403 (sin permisos) de forma global.
 * - Nunca expone secretos; solo usa el token del usuario admin autenticado.
 */

import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

import { env } from '@/config/env'
import { authStore } from '@/auth/authStore'

export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 20000,
})

function isAuthEndpoint(url?: string): boolean {
  return Boolean(url && url.includes('/auth/login'))
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = authStore.getToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    const status = error.response?.status
    const url = error.config?.url

    if (status === 401 && !isAuthEndpoint(url)) {
      // Token inválido o expirado → cerrar sesión globalmente.
      if (authStore.getToken()) {
        authStore.clearSession()
        toast.error('Tu sesión expiró. Inicia sesión nuevamente.')
      }
    } else if (status === 403) {
      toast.error('No tienes permisos administrativos para esta acción.')
    } else if (status === 500) {
      toast.error('Error interno del servidor. Inténtalo más tarde.')
    } else if (error.code === 'ERR_NETWORK') {
      // El backend no responde; los componentes muestran su propio estado de error.
      // Evitamos saturar con toasts en peticiones en segundo plano.
    }

    return Promise.reject(error)
  },
)

/** Extrae un mensaje de error legible de un error de Axios. */
export function getApiErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ERR_NETWORK') {
      return 'No se pudo conectar con el backend. Verifica que la API esté disponible.'
    }
    const data = error.response?.data as { detail?: string; message?: string } | undefined
    return data?.detail || data?.message || error.message || fallback
  }
  return fallback
}
