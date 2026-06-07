import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { Blob as NodeBlob } from 'buffer'

globalThis.FileReader = class FileReader {
  onload = null
  onloadend = null
  result = null
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then(buf => {
      this.result = buf
      if (this.onloadend) this.onloadend({ target: this })
      if (this.onload) this.onload({ target: this })
    })
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then(buf => {
      const bytes = new Uint8Array(buf)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      this.result = 'data:application/octet-stream;base64,' + btoa(binary)
      if (this.onloadend) this.onloadend({ target: this })
      if (this.onload) this.onload({ target: this })
    })
  }
}

globalThis.Blob = NodeBlob

const __dirname = dirname(fileURLToPath(import.meta.url))

function createBodyShape() {
  const s = new THREE.Shape()
  s.moveTo(0, 4.8)
  s.bezierCurveTo(-1, 5.1, -2.2, 4.8, -2.8, 4.3)
  s.lineTo(-3.8, 3.5)
  s.bezierCurveTo(-4.3, 2.5, -4.1, 1, -3.8, 0.4)
  s.lineTo(-3.3, -4.5)
  s.lineTo(-3.3, -5.8)
  s.bezierCurveTo(-1.8, -6.2, 1.8, -6.2, 3.3, -5.8)
  s.lineTo(3.8, -4.5)
  s.lineTo(4.3, 0.4)
  s.bezierCurveTo(4.6, 1, 4.8, 2.5, 4.3, 3.5)
  s.lineTo(3.3, 4.3)
  s.bezierCurveTo(2.5, 4.8, 1.2, 5.1, 0, 4.8)
  return s
}

function createSleeveShape() {
  const s = new THREE.Shape()
  const w = 1.8
  const h = 2.2
  const r = 0.6
  s.moveTo(-w + r, -h)
  s.lineTo(w - r, -h)
  s.quadraticCurveTo(w, -h, w, -h + r)
  s.lineTo(w, h - r)
  s.quadraticCurveTo(w, h, w - r, h)
  s.lineTo(-w + r, h)
  s.quadraticCurveTo(-w, h, -w, h - r)
  s.lineTo(-w, -h + r)
  s.quadraticCurveTo(-w, -h, -w + r, -h)
  return s
}

function makeMesh(name, shape, pos, rot) {
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth: 0.3,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.04,
    bevelSegments: 6,
  })
  geom.center()
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
    metalness: 0.05,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geom, mat)
  mesh.name = name
  mesh.position.set(...pos)
  mesh.rotation.set(...rot)
  return mesh
}

const scene = new THREE.Scene()
scene.add(makeMesh('body_front', createBodyShape(), [0, 0, 0.15], [0, 0, 0]))
scene.add(makeMesh('body_back', createBodyShape(), [0, 0, -0.15], [0, Math.PI, 0]))
scene.add(makeMesh('sleeve_left', createSleeveShape(), [-4.2, 1.8, 0], [0, 0, -0.25]))
scene.add(makeMesh('sleeve_right', createSleeveShape(), [4.2, 1.8, 0], [0, 0, 0.25]))

const exporter = new GLTFExporter()

const glbBuf = await new Promise((resolve, reject) => {
  exporter.parse(
    scene,
    (result) => resolve(result),
    (error) => reject(error),
    { binary: true }
  )
})

const outPath = resolve(__dirname, '..', 'src', 'assets', 'tshirt.glb')
const dir = dirname(outPath)
if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

writeFileSync(outPath, Buffer.from(glbBuf))
console.log('GLB generated:', outPath)
console.log('Size:', (glbBuf.byteLength / 1024).toFixed(1), 'KB')
