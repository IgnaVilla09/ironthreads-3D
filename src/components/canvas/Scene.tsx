import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { TShirt } from './TShirt'
import { Environment } from './Environment'

const CAMERA_POSITION: [number, number, number] = [0, 9, 20]

function LoaderFallback() {
  return null
}

export function Scene({
  onRendererReady,
}: {
  onRendererReady: (gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) => void
}) {
  return (
    <Canvas
      camera={{
        position: CAMERA_POSITION,
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
        minDistance={5}
        maxDistance={60}
        target={[0, 9, 0]}
      />
    </Canvas>
  )
}
