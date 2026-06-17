/**
 * Store de autenticación ligero (sin dependencias externas).
 *
 * Almacenamiento del token: localStorage para persistir la sesión del MVP.
 * RIESGO DOCUMENTADO: localStorage es accesible por JavaScript de la página,
 * por lo que es vulnerable a XSS. Para producción se recomienda migrar a
 * cookies httpOnly emitidas por el backend. No se almacena la contraseña.
 */

import type { AuthUser } from '@/types'

const TOKEN_KEY = 'proxvel_admin_token'
const USER_KEY = 'proxvel_admin_user'

export interface AuthState {
  token: string | null
  user: AuthUser | null
  /** true mientras se valida la sesión (GET /auth/me) al iniciar. */
  bootstrapping: boolean
}

type Listener = () => void

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

let state: AuthState = {
  token: localStorage.getItem(TOKEN_KEY),
  user: readUser(),
  bootstrapping: true,
}

const listeners = new Set<Listener>()

function emit() {
  for (const l of listeners) l()
}

export const authStore = {
  getState(): AuthState {
    return state
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getToken(): string | null {
    return state.token
  },
  setSession(token: string, user: AuthUser) {
    state = { token, user, bootstrapping: false }
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    emit()
  },
  setUser(user: AuthUser) {
    state = { ...state, user, bootstrapping: false }
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    emit()
  },
  setBootstrapping(value: boolean) {
    if (state.bootstrapping === value) return
    state = { ...state, bootstrapping: value }
    emit()
  },
  clearSession() {
    state = { token: null, user: null, bootstrapping: false }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    emit()
  },
}
