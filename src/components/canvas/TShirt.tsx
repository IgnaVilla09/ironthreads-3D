import { useEffect, useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Decal, useTexture, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store/useStore'
import { SECTOR_TO_NODE } from '../../types'
import type { Sector, DecalConfig, ShirtModel } from '../../types'
import { estimateDecalMeasurementsCm, HOODIE_SECTOR_BASE_SCALE } from '../../utils/decalMeasurements'

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

function createRulerTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const context = canvas.getContext('2d')

  if (!context) {
    return new THREE.CanvasTexture(canvas)
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = 'rgba(88, 174, 201, 0.55)'
  context.lineWidth = 6
  context.strokeRect(24, 24, canvas.width - 48, canvas.height - 48)

  context.strokeStyle = 'rgba(88, 174, 201, 0.3)'
  context.lineWidth = 3

  const steps = 10
  for (let index = 1; index < steps; index += 1) {
    const x = 24 + ((canvas.width - 48) * index) / steps
    const y = 24 + ((canvas.height - 48) * index) / steps

    context.beginPath()
    context.moveTo(x, 24)
    context.lineTo(x, index % 5 === 0 ? 72 : 54)
    context.moveTo(x, canvas.height - 24)
    context.lineTo(x, index % 5 === 0 ? canvas.height - 72 : canvas.height - 54)
    context.stroke()

    context.beginPath()
    context.moveTo(24, y)
    context.lineTo(index % 5 === 0 ? 72 : 54, y)
    context.moveTo(canvas.width - 24, y)
    context.lineTo(index % 5 === 0 ? canvas.width - 72 : canvas.width - 54, y)
    context.stroke()
  }

  context.setLineDash([10, 10])
  context.strokeStyle = 'rgba(88, 174, 201, 0.18)'
  context.beginPath()
  context.moveTo(canvas.width / 2, 24)
  context.lineTo(canvas.width / 2, canvas.height - 24)
  context.moveTo(24, canvas.height / 2)
  context.lineTo(canvas.width - 24, canvas.height / 2)
  context.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
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
  isActive,
  garmentWorldMeasurements,
  rulerTexture,
}: {
  decal: DecalConfig
  sector: Sector
  selectedModel: ShirtModel
  isActive: boolean
  garmentWorldMeasurements: { width: number; height: number } | null
  rulerTexture: THREE.Texture
}) {
  const texture = useTexture(decal.image)
  const isHoodie = selectedModel === 'hoodie'
  const base = isHoodie ? HOODIE_SECTOR_BASE_ROTATION[sector] : SECTOR_BASE_ROTATION[sector]
  const rotation: [number, number, number] = [base[0], base[1], base[2] + decal.rotation]
  const position = getDecalPosition(decal.position, sector, selectedModel)
  const projectionScale: [number, number, number] = isHoodie
    ? HOODIE_SECTOR_BASE_SCALE[sector].map((value, index) => {
        if (index === 2) return value

        const multiplier = index === 0
          ? decal.scaleX / DEFAULT_DECAL_SCALE
          : decal.scaleY / DEFAULT_DECAL_SCALE

        return value * multiplier
      }) as [number, number, number]
    : [decal.scaleX * 2, decal.scaleY * 2, 0.25]
  const estimatedSize = estimateDecalMeasurementsCm({
    decal,
    sector,
    selectedModel,
    garmentWorldMeasurements,
  })
  const rulerScale: [number, number, number] = [projectionScale[0] * 1.05, projectionScale[1] * 1.05, projectionScale[2]]

  return (
    <>
      <Decal
        map={texture}
        position={position}
        rotation={rotation}
        scale={projectionScale}
        depthTest={true}
        polygonOffsetFactor={-1}
      />
      {isActive && estimatedSize.widthCm > 0 && estimatedSize.heightCm > 0 && (
        <Decal
          map={rulerTexture}
          position={position}
          rotation={rotation}
          scale={rulerScale}
          depthTest={true}
          polygonOffsetFactor={-2}
        >
          <meshBasicMaterial
            transparent
            opacity={0.28}
            alphaTest={0.01}
            depthWrite={false}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </Decal>
      )}
    </>
  )
})

export function TShirt() {
  const selectedModel = useStore((s) => s.selectedModel)
  const gltf = useGLTF(MODEL_URLS[selectedModel])
  const shirtColor = useStore((s) => s.shirtColor)
  const decals = useStore((s) => s.decals)
  const selectedSector = useStore((s) => s.selectedSector)
  const selectedDecalIndex = useStore((s) => s.selectedDecalIndex)
  const garmentWorldMeasurements = useStore((s) => s.garmentWorldMeasurements)
  const setGarmentWorldMeasurements = useStore((s) => s.setGarmentWorldMeasurements)
  const nodeToSectors = useMemo(
    () => createNodeToSectorsMap(MODEL_SECTOR_TO_NODE[selectedModel] ?? SECTOR_TO_NODE),
    [selectedModel]
  )
  const rulerTexture = useMemo(() => createRulerTexture(), [])

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

  useEffect(() => {
    if (!gltf.scene) return

    gltf.scene.updateWorldMatrix(true, false)
    const bounds = new THREE.Box3().setFromObject(gltf.scene)
    const size = new THREE.Vector3()
    bounds.getSize(size)

    if (size.x > 0 && size.y > 0) {
      setGarmentWorldMeasurements({ width: size.x, height: size.y })
      return
    }

    setGarmentWorldMeasurements(null)
  }, [gltf.scene, selectedModel, setGarmentWorldMeasurements])

  useEffect(() => () => {
    rulerTexture.dispose()
  }, [rulerTexture])

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
            <DecalOnMesh
              key={decal.id}
              decal={decal}
              sector={sector}
              selectedModel={selectedModel}
              isActive={sector === selectedSector && decals[sector][selectedDecalIndex[sector]]?.id === decal.id}
              garmentWorldMeasurements={garmentWorldMeasurements}
              rulerTexture={rulerTexture}
            />
          ))}
        </mesh>
      ))}
    </group>
  )
}

useGLTF.preload(MODEL_URLS.shirt_nuevo)
useGLTF.preload(MODEL_URLS.hoodie)
