import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function inspectGLB(filePath, label) {
  const buf = readFileSync(filePath)
  let offset = 12
  let json = null

  while (offset < buf.length) {
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    const chunkLen = dv.getUint32(offset, true)
    const chunkType = dv.getUint32(offset + 4, true)
    const chunkData = buf.slice(offset + 8, offset + 8 + chunkLen)
    if (chunkType === 0x4E4F534A) { json = JSON.parse(new TextDecoder().decode(chunkData)) }
    offset += 8 + chunkLen
    offset += (4 - (offset % 4)) % 4
  }

  console.log(`\n========== ${label} ==========\n`)
  console.log('Nodes:')
  json.nodes.forEach((node, i) => {
    const t = node.translation ? `trans=[${node.translation.map(v => v.toFixed(3))}]` : ''
    const r = node.rotation ? `rot=[${node.rotation.map(v => v.toFixed(3))}]` : ''
    const s = node.scale ? `scale=[${node.scale.map(v => v.toFixed(3))}]` : ''
    const m = node.matrix ? 'hasMatrix' : ''
    const meshRef = node.mesh !== undefined ? `mesh=${node.mesh}` : ''
    console.log(`  [${i}] "${node.name || '(unnamed)'}" ${t} ${r} ${s} ${m} ${meshRef}`)
  })

  console.log('\nMeshes:')
  json.meshes.forEach((mesh, i) => {
    const prim = mesh.primitives[0]
    const attrs = prim ? Object.keys(prim.attributes).join(',') : 'none'
    const matRef = prim && prim.material !== undefined ? `mat=${prim.material}` : ''
    console.log(`  [${i}] prims=${mesh.primitives.length} attrs=[${attrs}] ${matRef}`)
  })

  console.log('\nScene nodes order:')
  const scene = json.scenes[json.scene ?? 0]
  scene.nodes.forEach((n, i) => {
    const node = json.nodes[n]
    console.log(`  scene[${i}] -> node[${n}] "${node.name}" mesh=${node.mesh}`)
  })
}

  inspectGLB(resolve(__dirname, '..', 'public', 'assets', 'shirt_baked.glb'), 'public/assets/shirt_baked.glb')
