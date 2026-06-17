/** Hook reactivo para el estado de autenticación. */

import { useSyncExternalStore } from 'react'

import { authStore, type AuthState } from './authStore'
import { isAdminRole } from './authService'

export function useAuth(): AuthState & { isAuthenticated: boolean; isAdmin: boolean } {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState)
  return {
    ...state,
    isAuthenticated: Boolean(state.token),
    isAdmin: isAdminRole(state.user),
  }
}
