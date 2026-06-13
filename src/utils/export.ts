import JSZip from 'jszip'
import type { WebGLRenderer } from 'three'
import type { Sector, DecalsBySector, ShirtConfig } from '../types'

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
  shirtColor: string,
  decals: DecalsBySector
): ShirtConfig {
  const activeDecals: ShirtConfig['decals'] = {}
  for (const key of Object.keys(decals) as Sector[]) {
    const sectorDecals = decals[key as Sector]
    if (sectorDecals.length > 0) {
      activeDecals[key as Sector] = sectorDecals
    }
  }
  return {
    shirtColor,
    decals: activeDecals,
  }
}

export async function exportToZip(params: {
  shirtColor: string
  decals: DecalsBySector
  capturedImages: string[]
}): Promise<Blob> {
  const { shirtColor, decals, capturedImages } = params
  const zip = new JSZip()

  const config = buildConfigJson(shirtColor, decals)
  zip.file('config.json', JSON.stringify(config, null, 2))

  capturedImages.forEach((dataUrl, index) => {
    const blob = dataURLToBlob(dataUrl)
    const angleLabels = ['front', 'right', 'back', 'left']
    const label = angleLabels[index] ?? `angle_${index}`
    zip.file(`preview_${label}.png`, blob)
  })

  for (const key of Object.keys(decals) as Sector[]) {
    decals[key as Sector].forEach((decal, index) => {
      const blob = dataURLToBlob(decal.image)
      zip.file(`decal_${key as string}_${index + 1}.png`, blob)
    })
  }

  return zip.generateAsync({ type: 'blob' })
}
