import { create } from 'zustand'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: typeof sessionStorage === 'undefined' ? null : JSON.parse(sessionStorage.getItem('nestly-user') || 'null') as User | null,
  accessToken: null,
  // Keep refresh token in memory only (not localStorage for security)
  refreshToken: null,
  isAuthenticated: typeof sessionStorage !== 'undefined' && !!sessionStorage.getItem('nestly-user'),

  setAuth: (user, accessToken, refreshToken) => {
    sessionStorage.setItem('nestly-user', JSON.stringify(user))
    set({ user, accessToken, refreshToken, isAuthenticated: true })
  },

  setTokens: (accessToken, refreshToken) => {
    set({ accessToken, refreshToken })
  },

  logout: () => {
    sessionStorage.removeItem('nestly-user')
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }))
  },
}))
