import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { TShirt } from './TShirt'
import { Environment } from './Environment'

const DESKTOP_CAMERA_POSITION: [number, number, number] = [0, 9, 20]
const PORTABLE_CAMERA_POSITION: [number, number, number] = [0, 9, 40]

function useIsPortableDevice() {
  const [isPortable, setIsPortable] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(max-width: 1023px)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(max-width: 1023px)')
    const handleChange = (event: MediaQueryListEvent) => setIsPortable(event.matches)

    setIsPortable(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return isPortable
}

function LoaderFallback() {
  return null
}

export function Scene({
  onRendererReady,
  onUserInteraction,
}: {
  onRendererReady: (gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void
  onUserInteraction?: () => void
}) {
  const isPortable = useIsPortableDevice()
  const cameraPosition = isPortable ? PORTABLE_CAMERA_POSITION : DESKTOP_CAMERA_POSITION

  return (
    <Canvas
      key={isPortable ? 'portable' : 'desktop'}
      camera={{
        position: cameraPosition,
        fov: 45,
        near: 0.1,
        far: 100,
      }}
      gl={{
        preserveDrawingBuffer: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1,
      }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl, scene, camera }) => {
        onRendererReady(gl, scene, camera as THREE.PerspectiveCamera)
      }}
    >
      <Suspense fallback={<LoaderFallback />}>
        <TShirt />
        <Environment />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={isPortable ? 8 : 5}
        maxDistance={60}
        target={[0, 9, 0]}
        onStart={onUserInteraction}
      />
    </Canvas>
  )
}
