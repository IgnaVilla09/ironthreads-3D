import { create } from 'zustand'
import type { Sector, DecalConfig } from '../types'

interface StoreState {
  shirtColor: string
  selectedSector: Sector
  decals: Record<Sector, DecalConfig | null>
  isExporting: boolean
  capturedImages: string[]

  setShirtColor: (color: string) => void
  setSelectedSector: (sector: Sector) => void
  addDecal: (sector: Sector, image: string) => void
  updateDecalPosition: (sector: Sector, position: [number, number, number]) => void
  updateDecalScale: (sector: Sector, scale: number) => void
  updateDecalRotation: (sector: Sector, rotation: number) => void
  removeDecal: (sector: Sector) => void
  setIsExporting: (value: boolean) => void
  setCapturedImages: (images: string[]) => void
  reset: () => void
}

const DEFAULT_POSITIONS: Record<Sector, [number, number, number]> = {
  body_front: [0, -0.06, 0.08],
  body_back: [0, -0.06, -0.06],
  sleeve_left: [-0.21, 0.08, 0],
  sleeve_right: [0.21, 0.08, 0],
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export const useStore = create<StoreState>((set) => ({
  shirtColor: '#cccccc',
  selectedSector: 'body_front',
  decals: {
    body_front: null,
    body_back: null,
    sleeve_left: null,
    sleeve_right: null,
  },
  isExporting: false,
  capturedImages: [],

  setShirtColor: (color) => set({ shirtColor: color }),

  setSelectedSector: (sector) => set({ selectedSector: sector }),

  addDecal: (sector, image) =>
    set((state) => ({
      decals: {
        ...state.decals,
        [sector]: {
          id: generateId(),
          image,
          position: DEFAULT_POSITIONS[sector],
          scale: 0.12,
          rotation: 0,
        },
      },
    })),

  updateDecalPosition: (sector, position) =>
    set((state) => {
      const existing = state.decals[sector]
      if (!existing) return state
      return {
        decals: {
          ...state.decals,
          [sector]: { ...existing, position },
        },
      }
    }),

  updateDecalScale: (sector, scale) =>
    set((state) => {
      const existing = state.decals[sector]
      if (!existing) return state
      return {
        decals: {
          ...state.decals,
          [sector]: { ...existing, scale },
        },
      }
    }),

  updateDecalRotation: (sector, rotation) =>
    set((state) => {
      const existing = state.decals[sector]
      if (!existing) return state
      return {
        decals: {
          ...state.decals,
          [sector]: { ...existing, rotation },
        },
      }
    }),

  removeDecal: (sector) =>
    set((state) => ({
      decals: {
        ...state.decals,
        [sector]: null,
      },
    })),

  setIsExporting: (value) => set({ isExporting: value }),

  setCapturedImages: (images) => set({ capturedImages: images }),

  reset: () =>
    set({
      shirtColor: '#cccccc',
      selectedSector: 'body_front',
      decals: {
        body_front: null,
        body_back: null,
        sleeve_left: null,
        sleeve_right: null,
      },
      isExporting: false,
      capturedImages: [],
    }),
}))
