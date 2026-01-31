import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { UserProfile } from '@/lib/types'

// AppState defines the global state interface for the application.
interface AppState {
  isAuthenticated: boolean
  user: UserProfile | null
  activeDivision: string
  activeTab: string
  activeCategory: 'core' | 'infrastructure' | 'business'
  contextContent: React.ReactNode | null
  isContextOpen: boolean
  privacyMode: boolean
  
  // Actions
  setAuth: (status: boolean) => void
  setUser: (user: UserProfile) => void
  setDivision: (division: string) => void
  setTab: (tab: string) => void
  setCategory: (category: 'core' | 'infrastructure' | 'business') => void
  setContextSidebar: (content: React.ReactNode | null) => void
  toggleContext: (open?: boolean) => void
  togglePrivacy: (enabled?: boolean) => void
  logout: () => void
}

// useAppStore is the global state management hook using Zustand.
export const useAppStore = create<AppState>()(
  immer((set) => ({
    isAuthenticated: false,
    user: null,
    activeDivision: 'dashboard',
    activeTab: 'overview',
    activeCategory: 'core',
    contextContent: null,
    isContextOpen: false,
    privacyMode: false,

    setAuth: (status) =>
      set((state) => {
        state.isAuthenticated = status
      }),

    setUser: (user) =>
      set((state) => {
        state.user = user
      }),

    setDivision: (division) =>
      set((state) => {
        state.activeDivision = division
        state.activeTab = 'overview' // Reset tab on division change
        state.isContextOpen = false
        state.contextContent = null
      }),

    setTab: (tab) =>
      set((state) => {
        state.activeTab = tab
      }),

    setCategory: (category) =>
      set((state) => {
        state.activeCategory = category
      }),

    setContextSidebar: (content) =>
      set((state) => {
        state.contextContent = content
      }),

    toggleContext: (open) =>
      set((state) => {
        state.isContextOpen = open !== undefined ? open : !state.isContextOpen
      }),

    togglePrivacy: (enabled) =>
      set((state) => {
        state.privacyMode = enabled !== undefined ? enabled : !state.privacyMode
      }),

    logout: () =>
      set((state) => {
        state.isAuthenticated = false
        state.user = null
        state.activeDivision = 'dashboard'
        state.activeCategory = 'core'
        state.isContextOpen = false
        state.contextContent = null
        state.privacyMode = false
      }),
  }))
)
