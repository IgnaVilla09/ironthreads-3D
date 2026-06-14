import { create } from 'zustand'
import type { Sector, DecalConfig, DecalsBySector, ShirtModel } from '../types'

interface GarmentWorldMeasurements {
  width: number
  height: number
}

const DEFAULT_DECAL_POSITIONS: Record<ShirtModel, Record<Sector, [number, number, number]>> = {
  shirt_nuevo: {
    body_front: [0, -0.06, 0.08],
    body_back: [0, -0.06, -0.06],
    sleeve_left: [-0.21, 0.08, 0],
    sleeve_right: [0.21, 0.08, 0],
  },
  oversize: {
    body_front: [0, -0.06, 0.08],
    body_back: [0, -0.06, -0.06],
    sleeve_left: [-0.21, 0.08, 0],
    sleeve_right: [-0.21, 0.08, 0],
  },
  croptop: {
    body_front: [0, 0.05, 0.08],
    body_back: [0, 0.05, -0.06],
    sleeve_left: [-0.21, 0.08, 0],
    sleeve_right: [0.21, 0.08, 0],
  },
  longtop: {
    body_front: [0, 0.05, 0.08],
    body_back: [0, 0.05, -0.06],
    sleeve_left: [-0.21, 0.08, 0],
    sleeve_right: [0.21, 0.08, 0],
  },
  hoodie: {
    body_front: [0, 0, 0],
    body_back: [0, 0, 0],
    sleeve_left: [0, 0, 0],
    sleeve_right: [0, 0, 0],
  },
}

const MAX_DECALS_PER_SECTOR: Record<Sector, number> = {
  body_front: 2,
  body_back: 2,
  sleeve_left: 1,
  sleeve_right: 1,
}

const EMPTY_DECALS: DecalsBySector = {
  body_front: [],
  body_back: [],
  sleeve_left: [],
  sleeve_right: [],
}

const DEFAULT_SELECTED_DECAL_INDEX: Record<Sector, number> = {
  body_front: 0,
  body_back: 0,
  sleeve_left: 0,
  sleeve_right: 0,
}

function adaptDecalsForModel(
  decals: DecalsBySector,
  previousModel: ShirtModel,
  model: ShirtModel
): DecalsBySector {
  if (previousModel === model) return decals

  const adaptSector = (sector: Sector, preserveAxes: boolean) =>
    decals[sector].map((decal) => ({
      ...decal,
      position: preserveAxes
        ? ([
            DEFAULT_DECAL_POSITIONS[model][sector][0],
            decal.position[1],
            decal.position[2],
          ] as [number, number, number])
        : ([...DEFAULT_DECAL_POSITIONS[model][sector]] as [number, number, number]),
    }))

  if (
    model === 'croptop' ||
    previousModel === 'croptop' ||
    model === 'longtop' ||
    previousModel === 'longtop' ||
    model === 'hoodie' ||
    previousModel === 'hoodie'
  ) {
    return {
      body_front: adaptSector('body_front', false),
      body_back: adaptSector('body_back', false),
      sleeve_left: adaptSector('sleeve_left', false),
      sleeve_right: adaptSector('sleeve_right', false),
    }
  }

  return {
    body_front: decals.body_front,
    body_back: decals.body_back,
    sleeve_left: adaptSector('sleeve_left', true),
    sleeve_right: adaptSector('sleeve_right', true),
  }
}

function getClampedSelectedIndex(length: number, index: number): number {
  return Math.max(0, Math.min(index, Math.max(0, length - 1)))
}

function updateActiveDecal(
  decals: DecalsBySector,
  selectedDecalIndex: Record<Sector, number>,
  sector: Sector,
  updater: (decal: DecalConfig) => DecalConfig
): DecalsBySector {
  const activeIndex = decals[sector][selectedDecalIndex[sector]] ? selectedDecalIndex[sector] : 0
  const existing = decals[sector][activeIndex]
  if (!existing) return decals

  return {
    ...decals,
    [sector]: decals[sector].map((decal, index) => (index === activeIndex ? updater(decal) : decal)),
  }
}

interface StoreState {
  selectedModel: ShirtModel
  shirtColor: string
  selectedSector: Sector
  selectedDecalIndex: Record<Sector, number>
  decals: DecalsBySector
  isExporting: boolean
  capturedImages: string[]
  garmentWorldMeasurements: GarmentWorldMeasurements | null

  setSelectedModel: (model: ShirtModel) => void
  setShirtColor: (color: string) => void
  setSelectedSector: (sector: Sector) => void
  setSelectedDecalIndex: (sector: Sector, index: number) => void
  addDecal: (sector: Sector, image: string, imageWidth: number, imageHeight: number) => void
  updateDecalPosition: (sector: Sector, position: [number, number, number]) => void
  updateDecalScale: (sector: Sector, scale: number) => void
  updateDecalRotation: (sector: Sector, rotation: number) => void
  removeDecal: (sector: Sector, id: string) => void
  setIsExporting: (value: boolean) => void
  setCapturedImages: (images: string[]) => void
  setGarmentWorldMeasurements: (value: GarmentWorldMeasurements | null) => void
  reset: () => void
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export const useStore = create<StoreState>((set) => ({
  selectedModel: 'shirt_nuevo',
  shirtColor: '#cccccc',
  selectedSector: 'body_front',
  selectedDecalIndex: DEFAULT_SELECTED_DECAL_INDEX,
  decals: EMPTY_DECALS,
  isExporting: false,
  capturedImages: [],
  garmentWorldMeasurements: null,

  setSelectedModel: (selectedModel) =>
    set((state) => ({
      selectedModel,
      decals: adaptDecalsForModel(state.decals, state.selectedModel, selectedModel),
    })),

  setShirtColor: (color) => set({ shirtColor: color }),

  setSelectedSector: (sector) => set({ selectedSector: sector }),

  setSelectedDecalIndex: (sector, index) =>
    set((state) => ({
      selectedDecalIndex: {
        ...state.selectedDecalIndex,
        [sector]: getClampedSelectedIndex(state.decals[sector].length, index),
      },
    })),

  addDecal: (sector, image, imageWidth, imageHeight) =>
    set((state) => {
      const currentSectorDecals = state.decals[sector]
      if (currentSectorDecals.length >= MAX_DECALS_PER_SECTOR[sector]) {
        return state
      }

      const nextSectorDecals = [
        ...currentSectorDecals,
        {
          id: generateId(),
          image,
          imageWidth,
          imageHeight,
          position: [...DEFAULT_DECAL_POSITIONS[state.selectedModel][sector]] as [number, number, number],
          scale: 0.12,
          rotation: 0,
        },
      ]

      return {
        decals: {
          ...state.decals,
          [sector]: nextSectorDecals,
        },
        selectedDecalIndex: {
          ...state.selectedDecalIndex,
          [sector]: nextSectorDecals.length - 1,
        },
      }
    }),

  updateDecalPosition: (sector, position) =>
    set((state) => ({
      decals: updateActiveDecal(state.decals, state.selectedDecalIndex, sector, (decal) => ({ ...decal, position })),
    })),

  updateDecalScale: (sector, scale) =>
    set((state) => ({
      decals: updateActiveDecal(state.decals, state.selectedDecalIndex, sector, (decal) => ({ ...decal, scale })),
    })),

  updateDecalRotation: (sector, rotation) =>
    set((state) => ({
      decals: updateActiveDecal(state.decals, state.selectedDecalIndex, sector, (decal) => ({ ...decal, rotation })),
    })),

  removeDecal: (sector, id) =>
    set((state) => {
      const nextSectorDecals = state.decals[sector].filter((decal) => decal.id !== id)

      return {
        decals: {
          ...state.decals,
          [sector]: nextSectorDecals,
        },
        selectedDecalIndex: {
          ...state.selectedDecalIndex,
          [sector]: getClampedSelectedIndex(nextSectorDecals.length, state.selectedDecalIndex[sector]),
        },
      }
    }),

  setIsExporting: (value) => set({ isExporting: value }),

  setCapturedImages: (images) => set({ capturedImages: images }),

  setGarmentWorldMeasurements: (value) => set({ garmentWorldMeasurements: value }),

  reset: () =>
    set({
      selectedModel: 'shirt_nuevo',
      shirtColor: '#cccccc',
      selectedSector: 'body_front',
      selectedDecalIndex: DEFAULT_SELECTED_DECAL_INDEX,
      decals: EMPTY_DECALS,
      isExporting: false,
      capturedImages: [],
      garmentWorldMeasurements: null,
    }),
}))
