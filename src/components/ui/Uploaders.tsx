import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { SECTOR_LABELS } from '../../types'
import type { Sector } from '../../types'

interface UploadersProps {
  sector: Sector
}

const MAX_DECALS_PER_SECTOR: Record<Sector, number> = {
  body_front: 2,
  body_back: 2,
  sleeve_left: 1,
  sleeve_right: 1,
}

export function Uploaders({ sector }: UploadersProps) {
  const addDecal = useStore((s) => s.addDecal)
  const removeDecal = useStore((s) => s.removeDecal)
  const setSelectedDecalIndex = useStore((s) => s.setSelectedDecalIndex)
  const selectedDecalIndex = useStore((s) => s.selectedDecalIndex[sector])
  const existingDecals = useStore((s) => s.decals[sector])
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

  const canAddMore = existingDecals.length < MAX_DECALS_PER_SECTOR[sector]

  return (
    <div className="flex flex-col gap-2">
      {existingDecals.map((decal, index) => {
        const isActive = index === selectedDecalIndex

        return (
          <button
            key={decal.id}
            type="button"
            onClick={() => setSelectedDecalIndex(sector, index)}
            className={`relative rounded-xl overflow-hidden border bg-white group text-left ${
              isActive ? 'border-[#58aec9] ring-1 ring-[#58aec9]' : 'border-surface-border'
            }`}
          >
            <img
              src={decal.image}
              alt={`${SECTOR_LABELS[sector]} decal ${index + 1}`}
              className="w-full h-24 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeDecal(sector, decal.id)
                }}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1.5 rounded-full shadow-sm transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
            <div className="px-2 py-1 text-[10px] text-black/50 font-medium truncate">
              {SECTOR_LABELS[sector]} decal {index + 1}
            </div>
          </button>
        )
      })}

      {canAddMore && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
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
      )}
    </div>
  )
}
