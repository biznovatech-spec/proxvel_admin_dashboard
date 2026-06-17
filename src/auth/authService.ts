/**
 * Servicio de autenticación: login, logout y restauración de sesión.
 */

import { authApi } from '@/api/endpoints'
import { authStore } from './authStore'
import type { AuthUser } from '@/types'

export function isAdminRole(user: AuthUser | null): boolean {
  return user?.role === 'admin' || user?.role === 'super_admin'
}

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const result = await authApi.login(email, password)
    authStore.setSession(result.access_token, result.user)
    return result.user
  },

  logout() {
    authStore.clearSession()
  },

  /**
   * Restaura/valida la sesión al iniciar la app.
   * Si hay token, lo valida contra GET /auth/me. Si es inválido, limpia la sesión.
   */
  async bootstrap(): Promise<void> {
    const token = authStore.getToken()
    if (!token) {
      authStore.setBootstrapping(false)
      return
    }
    try {
      const user = await authApi.me()
      authStore.setUser(user)
    } catch {
      // El interceptor 401 ya limpia la sesión; aseguramos estado consistente.
      authStore.clearSession()
    } finally {
      authStore.setBootstrapping(false)
    }
  },
}
