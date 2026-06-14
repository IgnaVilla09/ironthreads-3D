import type { DecalConfig, EstimatedDecalMeasurements, Sector, ShirtModel } from '../types'

export const MODEL_GARMENT_MEASUREMENTS_CM: Record<ShirtModel, { height: number; width: number }> = {
  shirt_nuevo: { height: 74, width: 55 },
  oversize: { height: 76, width: 65 },
  croptop: { height: 40, width: 45 },
  longtop: { height: 50, width: 45 },
  hoodie: { height: 82, width: 70 },
}

export const HOODIE_SECTOR_BASE_SCALE: Record<Sector, readonly [number, number, number]> = {
  body_front: [0.42, 0.52, 0.28],
  body_back: [0.42, 0.52, 0.28],
  sleeve_left: [0.44, 0.24, 0.28],
  sleeve_right: [0.44, 0.24, 0.28],
}

export interface GarmentWorldMeasurements {
  width: number
  height: number
}

const DECAL_ESTIMATE_CALIBRATION_FACTOR = 40

function roundToSingleDecimal(value: number): number {
  return Math.round(value * 10) / 10
}

export function formatCentimeters(value: number): string {
  return roundToSingleDecimal(value).toFixed(1)
}

export function getDecalImageAspectRatio(decal: DecalConfig): number {
  if (decal.imageWidth <= 0 || decal.imageHeight <= 0) return 1
  return decal.imageWidth / decal.imageHeight
}

function getProjectedDecalBoundsWorld(
  decal: DecalConfig,
  selectedModel: ShirtModel,
  sector: Sector
): { width: number; height: number } {
  if (selectedModel === 'hoodie') {
    const multiplier = decal.scale / 0.12

    return {
      width: HOODIE_SECTOR_BASE_SCALE[sector][0] * multiplier,
      height: HOODIE_SECTOR_BASE_SCALE[sector][1] * multiplier,
    }
  }

  return {
    width: decal.scale * 2,
    height: decal.scale * 2,
  }
}

function containWithinBounds(
  maxWidth: number,
  maxHeight: number,
  aspectRatio: number
): { width: number; height: number } {
  if (aspectRatio >= 1) {
    return {
      width: maxWidth,
      height: maxWidth / aspectRatio,
    }
  }

  return {
    width: maxHeight * aspectRatio,
    height: maxHeight,
  }
}

export function estimateDecalMeasurementsCm(params: {
  decal: DecalConfig
  sector: Sector
  selectedModel: ShirtModel
  garmentWorldMeasurements: GarmentWorldMeasurements | null
}): EstimatedDecalMeasurements {
  const { decal, sector, selectedModel, garmentWorldMeasurements } = params
  if (!garmentWorldMeasurements || garmentWorldMeasurements.width <= 0 || garmentWorldMeasurements.height <= 0) {
    return { widthCm: 0, heightCm: 0 }
  }

  const garmentMeasurements = MODEL_GARMENT_MEASUREMENTS_CM[selectedModel]
  const projectedBounds = getProjectedDecalBoundsWorld(decal, selectedModel, sector)
  const containedSize = containWithinBounds(
    projectedBounds.width,
    projectedBounds.height,
    getDecalImageAspectRatio(decal)
  )

  return {
    widthCm: roundToSingleDecimal(
      ((containedSize.width / garmentWorldMeasurements.width) * garmentMeasurements.width) * DECAL_ESTIMATE_CALIBRATION_FACTOR
    ),
    heightCm: roundToSingleDecimal(
      ((containedSize.height / garmentWorldMeasurements.height) * garmentMeasurements.height) * DECAL_ESTIMATE_CALIBRATION_FACTOR
    ),
  }
}

export function buildDecalSizeLabel(size: EstimatedDecalMeasurements): string {
  return `${formatCentimeters(size.widthCm)} x ${formatCentimeters(size.heightCm)} cm`
}

export function buildDecalFileSizeLabel(size: EstimatedDecalMeasurements): string {
  return `${formatCentimeters(size.heightCm)}x${formatCentimeters(size.widthCm)}cm`
}
