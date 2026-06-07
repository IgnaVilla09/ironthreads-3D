import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { SECTOR_LABELS } from '../../types'
import type { Sector } from '../../types'

interface UploadersProps {
  sector: Sector
}

export function Uploaders({ sector }: UploadersProps) {
  const addDecal = useStore((s) => s.addDecal)
  const removeDecal = useStore((s) => s.removeDecal)
  const existingDecal = useStore((s) => s.decals[sector])
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFile = (file: File) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp']
    if (!allowed.includes(file.type)) {
      alert('Usa imagenes PNG, JPEG o WebP.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('El tamano maximo es 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        addDecal(sector, reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  if (existingDecal) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-surface-border bg-white group">
        <img
          src={existingDecal.image}
          alt={`${SECTOR_LABELS[sector]} decal`}
          className="w-full h-24 object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <button
            onClick={() => removeDecal(sector)}
            className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1.5 rounded-full transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
        <div className="px-2 py-1 text-[10px] text-black/50 font-medium truncate">
          {SECTOR_LABELS[sector]} decal
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative flex flex-col items-center justify-center gap-2
        h-24 rounded-xl border-2 border-dashed cursor-pointer
        transition-all duration-150
        ${
          isDragOver
            ? 'border-accent bg-accent/5'
            : 'border-surface-border hover:border-accent/50 hover:bg-surface-alt'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleChange}
        className="hidden"
      />
      <motion.div
        animate={isDragOver ? { scale: 1.1 } : { scale: 1 }}
        className="flex flex-col items-center gap-1"
      >
        {isDragOver ? (
          <Upload size={20} className="text-accent" />
        ) : (
          <ImageIcon size={20} className="text-black/30" />
        )}
        <span className="text-[10px] text-black/40 font-medium">
          {isDragOver ? 'Suelta la imagen' : `Subir ${SECTOR_LABELS[sector].toLowerCase()}`}
        </span>
      </motion.div>
    </div>
  )
}
