'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Tenant {
  id: string
  name: string
  contactName?: string | null
  contactMobile?: string | null
  domain?: string | null
  accountCount: number
  status: number
  expireTime?: string | null
}

interface AppState {
  currentTenant: Tenant | null
  currentStoreId: string
  setTenant: (t: Tenant | null) => void
  setStoreId: (id: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentTenant: null,
      currentStoreId: '',
      setTenant: (t) => set({ currentTenant: t, currentStoreId: '' }),
      setStoreId: (id) => set({ currentStoreId: id }),
    }),
    { name: 'yshop-drink-demo' }
  )
)
