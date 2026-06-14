import { useCallback, useEffect, useState } from 'react'
import { Scene } from './components/canvas/Scene'
import { Sidebar } from './components/ui/Sidebar'
import { PreviewPanel } from './components/ui/PreviewPanel'
import { DecalControlsOverlay } from './components/ui/DecalControlsOverlay'
import { MobileIntroLoader } from './components/ui/MobileIntroLoader'
import { ViewportHints } from './components/ui/ViewportHints'
import { Button } from './components/shared/Button'
import { Layers3, Download } from 'lucide-react'
import * as THREE from 'three'

const MOBILE_INTRO_DURATION_MS = 7000

function App() {
  const [activeMobilePanel, setActiveMobilePanel] = useState<'customize' | 'export' | null>(null)
  const [isPortable, setIsPortable] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 1023px)').matches
  })
  const [hasDismissedHints, setHasDismissedHints] = useState(false)
  const [showMobileIntro, setShowMobileIntro] = useState(false)
  const [mobileIntroProgress, setMobileIntroProgress] = useState(0)
  const [rendererData, setRendererData] = useState<{
    gl: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
  } | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const handleChange = (event: MediaQueryListEvent) => setIsPortable(event.matches)

    setIsPortable(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (!isPortable) {
      setShowMobileIntro(false)
      setMobileIntroProgress(100)
      return
    }

    setShowMobileIntro(true)
    setMobileIntroProgress(0)

    const startedAt = Date.now()
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt
      const nextProgress = Math.min(100, Math.round((elapsed / MOBILE_INTRO_DURATION_MS) * 100))
      setMobileIntroProgress(nextProgress)

      if (elapsed >= MOBILE_INTRO_DURATION_MS) {
        window.clearInterval(interval)
        setShowMobileIntro(false)
      }
    }, 100)

    return () => window.clearInterval(interval)
  }, [isPortable])

  const openMobilePanel = useCallback((panel: 'customize' | 'export') => {
    setActiveMobilePanel(panel)
    setHasDismissedHints(true)
  }, [])

  const handleRendererReady = useCallback(
    (gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
      setRendererData({ gl, scene, camera })
    },
    []
  )

  const handleSceneInteraction = useCallback(() => {
    setHasDismissedHints(true)
  }, [])

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-surface lg:flex-row">
      <MobileIntroLoader visible={isPortable && showMobileIntro} progress={mobileIntroProgress} />
      <Sidebar
        isMobileOpen={activeMobilePanel === 'customize'}
        onCloseMobile={() => setActiveMobilePanel(null)}
      />
      <main className="relative flex-1 min-w-0">
        <Scene onRendererReady={handleRendererReady} onUserInteraction={handleSceneInteraction} />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 lg:hidden">
          <div className="pointer-events-auto rounded-[26px] border border-white/70 bg-white/92 p-3 shadow-[0_16px_48px_rgba(0,0,0,0.14)] backdrop-blur">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Iron Threads" className="h-10 w-auto shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-black">IRON THREADS</p>
                <p className="truncate text-[11px] text-black/45">Customizador 3D Iron Threads</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                size="sm"
                className="min-w-0 flex-1"
                icon={<Layers3 size={16} />}
                onClick={() => openMobilePanel('customize')}
              >
                Personalizar
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="min-w-0 flex-1"
                icon={<Download size={16} />}
                onClick={() => openMobilePanel('export')}
              >
                Exportar
              </Button>
            </div>
          </div>
        </div>
        <ViewportHints visible={isPortable && !showMobileIntro && !hasDismissedHints && activeMobilePanel === null} />
        <DecalControlsOverlay />
      </main>
      <PreviewPanel
        rendererData={rendererData}
        isMobileOpen={activeMobilePanel === 'export'}
        onCloseMobile={() => setActiveMobilePanel(null)}
      />
    </div>
  )
}

export default App
