import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Download, Camera, Check } from 'lucide-react'
import { Button } from '../shared/Button'
import { useStore } from '../../store/useStore'
import { captureScreenshot, exportToZip } from '../../utils/export'
import * as THREE from 'three'

const CAPTURE_DELAY_MS = 300
const CAPTURE_ANGLES = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]

interface PreviewPanelProps {
  rendererData: {
    gl: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
  } | null
}

function padNumber(value: number): string {
  return value.toString().padStart(2, '0')
}

function buildExportFileName(color: string, now = new Date()): string {
  const sanitizedColor = color.replace('#', '')
  const day = padNumber(now.getDate())
  const month = padNumber(now.getMonth() + 1)
  const year = now.getFullYear()
  const hours = padNumber(now.getHours())
  const minutes = padNumber(now.getMinutes())

  return `${sanitizedColor}-${day}-${month}-${year}-${hours}-${minutes}.zip`
}

export function PreviewPanel({ rendererData }: PreviewPanelProps) {
  const shirtColor = useStore((s) => s.shirtColor)
  const decals = useStore((s) => s.decals)
  const capturedImages = useStore((s) => s.capturedImages)
  const setCapturedImages = useStore((s) => s.setCapturedImages)
  const setIsExporting = useStore((s) => s.setIsExporting)
  const isExporting = useStore((s) => s.isExporting)

  const [status, setStatus] = useState<'idle' | 'capturing' | 'exported'>('idle')
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const handleCapture = useCallback(async () => {
    if (!rendererData) return
    const { gl, scene, camera } = rendererData
    setStatus('capturing')
    setIsExporting(true)

    const originalPos = camera.position.clone()
    const center = new THREE.Vector3(0, 9, 0)
    const offset = originalPos.clone().sub(center)
    const radius = offset.length()
    const captures: string[] = []

    try {
      for (const angle of CAPTURE_ANGLES) {
        camera.position.set(
          center.x + radius * Math.sin(angle),
          center.y,
          center.z + radius * Math.cos(angle)
        )
        camera.lookAt(center)
        camera.updateProjectionMatrix()

        await new Promise((r) => setTimeout(r, CAPTURE_DELAY_MS))

        const dataUrl = await captureScreenshot(gl)
        captures.push(dataUrl)
      }

      camera.position.copy(originalPos)
      camera.lookAt(center)
      camera.updateProjectionMatrix()

      setCapturedImages(captures)
      setPreviewUrls(captures)
      setStatus('idle')
    } catch (err) {
      console.error('Capture failed:', err)
      camera.position.copy(originalPos)
      camera.lookAt(center)
      camera.updateProjectionMatrix()
      setStatus('idle')
    } finally {
      setIsExporting(false)
    }
  }, [rendererData, setCapturedImages, setIsExporting])

  const handleExport = useCallback(async () => {
    if (!rendererData) return

    if (capturedImages.length === 0) {
      await handleCapture()
    }

    setIsExporting(true)
    try {
      const blob = await exportToZip({
        shirtColor,
        decals,
        capturedImages,
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = buildExportFileName(shirtColor)
      a.click()
      URL.revokeObjectURL(url)

      setStatus('exported')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }, [rendererData, capturedImages, shirtColor, decals, handleCapture, setIsExporting])

  return (
    <motion.aside
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 shrink-0 h-full overflow-y-auto border-l border-surface-border bg-white"
    >
      <div className="p-5 flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-bold">Exportar</h2>
          <p className="text-xs text-black/40">Capturar y descargar</p>
        </div>

        {/* Capture previews */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {previewUrls.map((url, i) => {
              const labels = ['Front', 'Right', 'Back', 'Left']
              return (
                <div
                  key={i}
                  className="rounded-lg overflow-hidden border border-surface-border"
                >
                  <img
                    src={url}
                    alt={labels[i] ?? `Angle ${i}`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="px-1.5 py-1 text-[9px] text-black/50 font-medium text-center">
                    {labels[i]}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            size="md"
            icon={<Camera size={16} />}
            onClick={handleCapture}
            loading={status === 'capturing'}
            disabled={isExporting || !rendererData}
              className="w-full"
            >
              {status === 'capturing' ? 'Capturando...' : 'Capturar angulos'}
            </Button>

          <Button
            variant="primary"
            size="md"
            icon={
              status === 'exported' ? (
                <Check size={16} />
              ) : (
                <Download size={16} />
              )
            }
            onClick={handleExport}
            loading={isExporting && status !== 'capturing'}
              disabled={isExporting}
              className="w-full"
            >
              {status === 'exported' ? 'Exportado' : 'Descargar ZIP'}
            </Button>
          </div>

          <p className="text-[10px] text-black/30 leading-relaxed">
          Captura 4 angulos y empaqueta tu diseno en un ZIP con configuracion,
          vistas previas e imagenes originales.
          </p>
      </div>
    </motion.aside>
  )
}
