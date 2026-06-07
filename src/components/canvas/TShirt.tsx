import { useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Decal, useTexture, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { SECTOR_TO_NODE } from '../../types'
import type { Sector, DecalConfig } from '../../types'

const SECTOR_NAMES: Sector[] = ['body_front', 'body_back', 'sleeve_left', 'sleeve_right']

const SECTOR_BASE_ROTATION: Record<Sector, readonly [number, number, number]> = {
  body_front: [0, 0, 0],
  body_back: [0, Math.PI, 0],
  sleeve_left: [0, -Math.PI / 2, 0],
  sleeve_right: [0, Math.PI / 2, 0],
}

const NODE_TO_SECTORS = Object.entries(SECTOR_TO_NODE).reduce<Record<string, Sector[]>>(
  (acc, [sector, nodeName]) => {
    const typedSector = sector as Sector
    const sectors = acc[nodeName] ?? []
    sectors.push(typedSector)
    acc[nodeName] = sectors
    return acc
  },
  {}
)

function getMeshSector(mesh: THREE.Mesh): Sector | null {
  const sectors = NODE_TO_SECTORS[mesh.name]
  if (sectors?.length === 1) return sectors[0] ?? null

  const box = new THREE.Box3().setFromObject(mesh)
  const center = new THREE.Vector3()
  box.getCenter(center)

  if (!sectors?.length) {
    if (Math.abs(center.x) > Math.abs(center.z)) {
      return center.x > 0 ? 'sleeve_right' : 'sleeve_left'
    }

    return center.z > 0 ? 'body_front' : 'body_back'
  }

  return center.x > 0 ? 'sleeve_right' : 'sleeve_left'
}

const DecalOnMesh = memo(function DecalOnMesh({ decal, sector }: { decal: DecalConfig; sector: Sector }) {
  const texture = useTexture(decal.image)
  const base = SECTOR_BASE_ROTATION[sector]
  const rotation: [number, number, number] = [base[0], base[1], base[2] + decal.rotation]
  const projectionScale: [number, number, number] = [decal.scale * 2, decal.scale * 2, 0.25]

  return (
    <Decal
      map={texture}
      position={decal.position}
      rotation={rotation}
      scale={projectionScale}
      depthTest={true}
      polygonOffsetFactor={-1}
    />
  )
})

export function TShirt() {
  const gltf = useGLTF('/assets/shirt_nuevo.glb')
  const shirtColor = useStore((s) => s.shirtColor)
  const decals = useStore((s) => s.decals)

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.9,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
    []
  )

  useFrame(() => {
    material.color.set(shirtColor)
  })

  const meshData = useMemo(() => {
    if (!gltf.scene) return []
    gltf.scene.updateWorldMatrix(true, false)
    const result: { geometry: THREE.BufferGeometry; sector: Sector; matrix: THREE.Matrix4 }[] = []
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        const sector = getMeshSector(mesh)
        if (sector) {
          result.push({
            geometry: mesh.geometry,
            sector,
            matrix: mesh.matrixWorld.clone(),
          })
        }
      }
    })
    return result
  }, [gltf.scene])

  if (meshData.length === 0) return null

  return (
    <group>
      {meshData.map(({ geometry, sector, matrix }) => (
        <mesh key={sector} geometry={geometry} material={material} matrix={matrix} matrixAutoUpdate={false}>
          {decals[sector] && <DecalOnMesh decal={decals[sector]} sector={sector} />}
        </mesh>
      ))}
    </group>
  )
}
