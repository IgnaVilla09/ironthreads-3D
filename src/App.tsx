import { useCallback, useRef, useState } from 'react'
import { Scene } from './components/canvas/Scene'
import { Sidebar } from './components/ui/Sidebar'
import { PreviewPanel } from './components/ui/PreviewPanel'
import { DecalControlsOverlay } from './components/ui/DecalControlsOverlay'
import * as THREE from 'three'

function App() {
  const [rendererData, setRendererData] = useState<{
    gl: THREE.WebGLRenderer
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
  } | null>(null)

  const handleRendererReady = useCallback(
    (gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => {
      setRendererData({ gl, scene, camera })
    },
    []
  )

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 relative">
        <Scene onRendererReady={handleRendererReady} />
        <DecalControlsOverlay />
      </main>
      <PreviewPanel rendererData={rendererData} />
    </div>
  )
}

export default App
