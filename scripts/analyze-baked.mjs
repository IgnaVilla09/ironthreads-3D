import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function analyze(path) {
  const buf = readFileSync(path)
  let offset = 12, json = null
  while (offset < buf.length) {
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
    const len = dv.getUint32(offset, true), typ = dv.getUint32(offset + 4, true)
    const data = buf.slice(offset + 8, offset + 8 + len)
    if (typ === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(data))
    offset += 8 + len; offset += (4 - (offset % 4)) % 4
  }

  console.log(`\n=== ${path.split('\\').pop()} ===\n`)

  // Node hierarchy
  console.log('Nodes:')
  json.nodes.forEach((node, i) => {
    const mesh = node.mesh !== undefined ? `mesh=${node.mesh}` : ''
    const t = node.translation ? `trans=[${node.translation.map(v => v.toFixed(3))}]` : ''
    const r = node.rotation ? `rot=[${node.rotation.map(v => v.toFixed(3))}]` : ''
    const s = node.scale ? `scale=[${node.scale.map(v => v.toFixed(3))}]` : ''
    console.log(`  [${i}] "${node.name || '(unnamed)'}" ${t} ${r} ${s} ${mesh}`)
  })

  console.log('\nMeshes:')
  json.meshes.forEach((mesh, i) => {
    const prims = mesh.primitives.map(p => `attrs=${Object.keys(p.attributes).join(',')} mat=${p.material}`).join(', ')
    console.log(`  [${i}] prims=${mesh.primitives.length} ${prims}`)
  })

  console.log('\nScene nodes:', json.scenes[json.scene ?? 0].nodes)
  console.log('Extensions used:', json.extensionsUsed || 'none')
}

analyze(resolve(__dirname, '..', 'public', 'assets', 'shirt_baked.glb'))
