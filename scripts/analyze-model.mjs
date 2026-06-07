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

  // Map mesh index to node names
  const meshToNodes = {}
  json.nodes.forEach((node, i) => {
    if (node.mesh !== undefined) {
      if (!meshToNodes[node.mesh]) meshToNodes[node.mesh] = []
      meshToNodes[node.mesh].push({ nodeIdx: i, name: node.name })
    }
  })

  console.log('Mesh → Node mapping:')
  Object.entries(meshToNodes).forEach(([meshIdx, nodes]) => {
    console.log(`  mesh[${meshIdx}] → ${nodes.map(n => `node[${n.nodeIdx}] "${n.name}"`).join(', ')}`)
  })

  console.log('\nPrimitives (accessor indices):')
  json.meshes.forEach((mesh, i) => {
    const names = meshToNodes[i]?.map(n => n.name).join(', ') || '(orphaned)'
    console.log(`  mesh[${i}] (${names})`)
    mesh.primitives.forEach((prim, p) => {
      const attrs = Object.entries(prim.attributes).map(([k, v]) => `${k}=${v}`).join(', ')
      console.log(`    prim[${p}]: ${attrs} mat=${prim.material} mode=${prim.mode ?? 'triangles'}`)
    })
  })

  console.log('\nAccessor bounds:')
  json.accessors.forEach((acc, i) => {
    const pos = acc.type === 'VEC3' && acc.componentType === 5126 && acc.min ? 
      ` min=[${acc.min.map(v => v.toFixed(3))}] max=[${acc.max.map(v => v.toFixed(3))}]` : ''
    console.log(`  [${i}] type=${acc.type} count=${acc.count}${pos}`)
  })

  console.log('\nMaterials:')
  json.materials.forEach((mat, i) => {
    console.log(`  [${i}] ${JSON.stringify(mat)}`)
  })
}

  analyze(resolve(__dirname, '..', 'public', 'assets', 'shirt_baked.glb'))
