import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Camera, Check, X } from 'lucide-react'
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
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

interface PreviewContentProps {
  previewUrls: string[]
  status: 'idle' | 'capturing' | 'exported'
  isExporting: boolean
  rendererData: PreviewPanelProps['rendererData']
  canExport: boolean
  onCapture: () => void
  onExport: () => void
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

function PreviewContent({
  previewUrls,
  status,
  isExporting,
  rendererData,
  canExport,
  onCapture,
  onExport,
}: PreviewContentProps) {
  return (
    <div className="flex flex-col gap-5 p-4 pb-6 sm:p-5">
      <div>
        <h2 className="text-sm font-bold">Exportar</h2>
        <p className="text-xs text-black/40">Capturar y descargar</p>
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {previewUrls.map((url, i) => {
            const labels = ['Front', 'Right', 'Back', 'Left']
            return (
              <div
                key={i}
                className="overflow-hidden rounded-lg border border-surface-border"
              >
                <img
                  src={url}
                  alt={labels[i] ?? `Angle ${i}`}
                  className="aspect-square w-full object-cover"
                />
                <div className="px-1.5 py-1 text-center text-[9px] font-medium text-black/50">
                  {labels[i]}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="secondary"
          size="md"
          icon={<Camera size={16} />}
          onClick={onCapture}
          loading={status === 'capturing'}
          disabled={isExporting || !rendererData}
          className="w-full"
        >
          {status === 'capturing' ? 'Capturando...' : 'Capturar angulos'}
        </Button>

        <Button
          variant="primary"
          size="md"
          icon={status === 'exported' ? <Check size={16} /> : <Download size={16} />}
          onClick={onExport}
          loading={isExporting && status !== 'capturing'}
          disabled={isExporting || !canExport}
          className="w-full"
        >
          {status === 'exported' ? 'Exportado' : 'Descargar ZIP'}
        </Button>
      </div>

      <p className="text-[10px] leading-relaxed text-black/30">
        Primero captura los 4 angulos del proyecto. Cuando las vistas esten listas,
        podras descargar el ZIP con configuracion, previews e imagenes originales.
      </p>
    </div>
  )
}

export function PreviewPanel({ rendererData, isMobileOpen = false, onCloseMobile }: PreviewPanelProps) {
  const shirtColor = useStore((s) => s.shirtColor)
  const decals = useStore((s) => s.decals)
  const capturedImages = useStore((s) => s.capturedImages)
  const setCapturedImages = useStore((s) => s.setCapturedImages)
  const setIsExporting = useStore((s) => s.setIsExporting)
  const isExporting = useStore((s) => s.isExporting)

  const [status, setStatus] = useState<'idle' | 'capturing' | 'exported'>('idle')
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const canExport = capturedImages.length === CAPTURE_ANGLES.length

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
    if (!rendererData || !canExport) return

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
  }, [rendererData, canExport, capturedImages, shirtColor, decals, setIsExporting])

  return (
    <>
      <aside className="hidden h-full w-64 shrink-0 overflow-y-auto border-l border-surface-border bg-white lg:block">
        <PreviewContent
          previewUrls={previewUrls}
          status={status}
          isExporting={isExporting}
          rendererData={rendererData}
          canExport={canExport}
          onCapture={handleCapture}
          onExport={handleExport}
        />
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/35 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ y: '100%', opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="fixed inset-x-0 bottom-0 top-28 z-40 overflow-y-auto rounded-t-[28px] border border-surface-border bg-white shadow-[0_-18px_60px_rgba(0,0,0,0.18)] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-black">Exportacion</p>
                  <p className="text-xs text-black/45">Capturas y descarga del ZIP</p>
                </div>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="rounded-full border border-surface-border p-2 text-black/60 transition-colors hover:bg-surface-alt"
                >
                  <X size={18} />
                </button>
              </div>

              <PreviewContent
                previewUrls={previewUrls}
                status={status}
                isExporting={isExporting}
                rendererData={rendererData}
                canExport={canExport}
                onCapture={handleCapture}
                onExport={handleExport}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
