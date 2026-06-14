import JSZip from 'jszip'
import type { WebGLRenderer } from 'three'
import { MODEL_GARMENT_MEASUREMENTS_CM, buildDecalFileSizeLabel, estimateDecalMeasurementsCm, formatCentimeters } from './decalMeasurements'
import { SECTOR_LABELS, SHIRT_MODEL_LABELS } from '../types'
import type { Sector, DecalsBySector, ShirtConfig, ShirtModel } from '../types'

export async function captureScreenshot(
  gl: WebGLRenderer | null
): Promise<string> {
  if (!gl) throw new Error('Renderer not available')
  const blob = await new Promise<Blob | null>((resolve) =>
    gl.domElement.toBlob(resolve, 'image/png')
  )
  if (!blob) throw new Error('Failed to capture screenshot')
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export function dataURLToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',')
  const mime = parts[0]?.match(/:(.*?);/)?.[1] ?? 'image/png'
  const raw = atob(parts[1] ?? '')
  const u8 = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) {
    u8[i] = raw.charCodeAt(i)
  }
  return new Blob([u8], { type: mime })
}

export function buildConfigJson(
  selectedModel: ShirtModel,
  shirtColor: string,
  decals: DecalsBySector,
  garmentWorldMeasurements: { width: number; height: number } | null
): ShirtConfig {
  const activeDecals: ShirtConfig['decals'] = {}
  for (const key of Object.keys(decals) as Sector[]) {
    const sectorDecals = decals[key as Sector]
    if (sectorDecals.length > 0) {
      activeDecals[key as Sector] = sectorDecals.map((decal) => ({
        ...decal,
        estimatedMeasurements: estimateDecalMeasurementsCm({
          decal,
          sector: key,
          selectedModel,
          garmentWorldMeasurements,
        }),
      }))
    }
  }
  return {
    selectedModel,
    shirtColor,
    garmentMeasurementsCm: MODEL_GARMENT_MEASUREMENTS_CM[selectedModel],
    decals: activeDecals,
  }
}

function buildMeasurementsText(config: ShirtConfig): string {
  const lines: string[] = [
    'MEDIDAS ESTIMADAS',
    `Modelo: ${SHIRT_MODEL_LABELS[config.selectedModel]}`,
    `Prenda: ${config.garmentMeasurementsCm.width} cm de ancho x ${config.garmentMeasurementsCm.height} cm de alto`,
    `Color: ${config.shirtColor}`,
    '',
  ]

  for (const key of Object.keys(config.decals) as Sector[]) {
    const sectorDecals = config.decals[key]
    if (!sectorDecals?.length) continue

    lines.push(`Sector: ${SECTOR_LABELS[key]}`)
    sectorDecals.forEach((decal, index) => {
      lines.push(
        `- Diseño ${index + 1}: ${formatCentimeters(decal.estimatedMeasurements.widthCm)} cm de ancho x ${formatCentimeters(decal.estimatedMeasurements.heightCm)} cm de alto`
      )
    })
    lines.push('')
  }

  return lines.join('\n').trim()
}

export async function exportToZip(params: {
  selectedModel: ShirtModel
  shirtColor: string
  decals: DecalsBySector
  capturedImages: string[]
  garmentWorldMeasurements: { width: number; height: number } | null
}): Promise<Blob> {
  const { selectedModel, shirtColor, decals, capturedImages, garmentWorldMeasurements } = params
  const zip = new JSZip()

  const config = buildConfigJson(selectedModel, shirtColor, decals, garmentWorldMeasurements)
  zip.file('config.json', JSON.stringify(config, null, 2))
  zip.file('medidas.txt', buildMeasurementsText(config))

  capturedImages.forEach((dataUrl, index) => {
    const blob = dataURLToBlob(dataUrl)
    const angleLabels = ['front', 'right', 'back', 'left']
    const label = angleLabels[index] ?? `angle_${index}`
    zip.file(`preview_${label}.png`, blob)
  })

  for (const key of Object.keys(decals) as Sector[]) {
    decals[key as Sector].forEach((decal, index) => {
      const blob = dataURLToBlob(decal.image)
      const estimatedMeasurements = estimateDecalMeasurementsCm({
        decal,
        sector: key,
        selectedModel,
        garmentWorldMeasurements,
      })
      const sizeLabel = buildDecalFileSizeLabel(estimatedMeasurements)
      zip.file(`diseno_${key as string}_${sizeLabel}_${index + 1}.png`, blob)
    })
  }

  return zip.generateAsync({ type: 'blob' })
}
