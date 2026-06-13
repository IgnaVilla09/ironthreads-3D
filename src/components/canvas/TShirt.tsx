import { useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Decal, useTexture, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { SECTOR_TO_NODE } from '../../types'
import type { Sector, DecalConfig, ShirtModel } from '../../types'

const SECTOR_BASE_ROTATION: Record<Sector, readonly [number, number, number]> = {
  body_front: [0, 0, 0],
  body_back: [0, Math.PI, 0],
  sleeve_left: [0, -Math.PI / 2, 0],
  sleeve_right: [0, Math.PI / 2, 0],
}

const HOODIE_SECTOR_BASE_ROTATION: Record<Sector, readonly [number, number, number]> = {
  body_front: [-Math.PI / 2, 0, 0],
  body_back: [-Math.PI / 2, Math.PI, 0],
  sleeve_left: [-Math.PI / 2, -Math.PI / 2, 0],
  sleeve_right: [-Math.PI / 2, Math.PI / 2, 0],
}

const HOODIE_SECTOR_BASE_SCALE: Record<Sector, readonly [number, number, number]> = {
  body_front: [0.42, 0.52, 0.28],
  body_back: [0.42, 0.52, 0.28],
  sleeve_left: [0.44, 0.24, 0.28],
  sleeve_right: [0.44, 0.24, 0.28],
}

const HOODIE_SECTOR_POSITION_ANCHOR: Record<Sector, readonly [number, number, number]> = {
  body_front: [0, 0.04, -1.32],
  body_back: [0, -0.08, -1.32],
  sleeve_left: [0.29, -0.02, -1.26],
  sleeve_right: [-0.29, -0.02, -1.26],
}

const DEFAULT_DECAL_SCALE = 0.12

function getDecalPosition(position: [number, number, number], sector: Sector, selectedModel: ShirtModel): [number, number, number] {
  if (selectedModel !== 'hoodie') return position

  const [editorX, editorY] = position
  const [anchorX, anchorY, anchorZ] = HOODIE_SECTOR_POSITION_ANCHOR[sector]

  return [anchorX + editorX, anchorY, anchorZ - editorY]
}

const MODEL_URLS: Record<ShirtModel, string> = {
  shirt_nuevo: '/assets/shirt_nuevo.glb',
  oversize: new URL('../../assets/oversize.glb', import.meta.url).href,
  croptop: new URL('../../assets/croptop.glb', import.meta.url).href,
  longtop: new URL('../../assets/longtop.glb', import.meta.url).href,
  hoodie: new URL('../../assets/menhoodie.glb', import.meta.url).href,
}

const EXCLUDED_MESH_NAMES: Partial<Record<ShirtModel, Set<string>>> = {
  croptop: new Set(['Object_4.008']),
  longtop: new Set(['Object_4.008']),
}

const MODEL_SECTOR_TO_NODE: Partial<Record<ShirtModel, Record<Sector, string>>> = {
  hoodie: {
    body_front: 'body_front',
    body_back: 'body_back',
    sleeve_left: 'sleeve_left',
    sleeve_right: 'sleeve_right',
  },
}

function createNodeToSectorsMap(mapping: Record<Sector, string>): Record<string, Sector[]> {
  return Object.entries(mapping).reduce<Record<string, Sector[]>>((acc, [sector, nodeName]) => {
    const typedSector = sector as Sector
    const sectors = acc[nodeName] ?? []
    sectors.push(typedSector)
    acc[nodeName] = sectors
    return acc
  }, {})
}

function getMeshSector(mesh: THREE.Mesh, nodeToSectors: Record<string, Sector[]>): Sector | null {
  const sectors = nodeToSectors[mesh.name]
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

const DecalOnMesh = memo(function DecalOnMesh({
  decal,
  sector,
  selectedModel,
}: {
  decal: DecalConfig
  sector: Sector
  selectedModel: ShirtModel
}) {
  const texture = useTexture(decal.image)
  const isHoodie = selectedModel === 'hoodie'
  const base = isHoodie ? HOODIE_SECTOR_BASE_ROTATION[sector] : SECTOR_BASE_ROTATION[sector]
  const rotation: [number, number, number] = [base[0], base[1], base[2] + decal.rotation]
  const position = getDecalPosition(decal.position, sector, selectedModel)
  const projectionScale: [number, number, number] = isHoodie
    ? HOODIE_SECTOR_BASE_SCALE[sector].map((value, index) => {
        const multiplier = decal.scale / DEFAULT_DECAL_SCALE
        return index === 2 ? value : value * multiplier
      }) as [number, number, number]
    : [decal.scale * 2, decal.scale * 2, 0.25]

  return (
    <Decal
      map={texture}
      position={position}
      rotation={rotation}
      scale={projectionScale}
      depthTest={true}
      polygonOffsetFactor={-1}
    />
  )
})

export function TShirt() {
  const selectedModel = useStore((s) => s.selectedModel)
  const gltf = useGLTF(MODEL_URLS[selectedModel])
  const shirtColor = useStore((s) => s.shirtColor)
  const decals = useStore((s) => s.decals)
  const nodeToSectors = useMemo(
    () => createNodeToSectorsMap(MODEL_SECTOR_TO_NODE[selectedModel] ?? SECTOR_TO_NODE),
    [selectedModel]
  )

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

    if (selectedModel === 'hoodie') {
      gltf.scene.updateWorldMatrix(true, false)

      const result: {
        key: string
        geometry: THREE.BufferGeometry
        sector: Sector | null
        matrix: THREE.Matrix4
      }[] = []

      gltf.scene.traverse((child) => {
        if (!(child as THREE.Mesh).isMesh) return

        const mesh = child as THREE.Mesh
        const sector = (mesh.name in MODEL_SECTOR_TO_NODE.hoodie!)
          ? (mesh.name as Sector)
          : null

        result.push({
          key: mesh.uuid,
          geometry: mesh.geometry,
          sector,
          matrix: mesh.matrixWorld.clone(),
        })
      })

      return result
    }

    gltf.scene.updateWorldMatrix(true, false)
    const result: { key: string; geometry: THREE.BufferGeometry; sector: Sector; matrix: THREE.Matrix4 }[] = []
    const excludedMeshNames = EXCLUDED_MESH_NAMES[selectedModel]
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (excludedMeshNames?.has(mesh.name)) return
        const sector = getMeshSector(mesh, nodeToSectors)
        if (sector) {
          result.push({
            key: mesh.uuid,
            geometry: mesh.geometry,
            sector,
            matrix: mesh.matrixWorld.clone(),
          })
        }
      }
    })
    return result
  }, [gltf.scene, nodeToSectors, selectedModel])

  if (meshData.length === 0) return null

  return (
    <group>
      {meshData.map(({ key, geometry, sector, matrix }) => (
        <mesh key={key} geometry={geometry} material={material} matrix={matrix} matrixAutoUpdate={false}>
          {sector && decals[sector].map((decal) => (
            <DecalOnMesh key={decal.id} decal={decal} sector={sector} selectedModel={selectedModel} />
          ))}
        </mesh>
      ))}
    </group>
  )
}

useGLTF.preload(MODEL_URLS.shirt_nuevo)
useGLTF.preload(MODEL_URLS.hoodie)
