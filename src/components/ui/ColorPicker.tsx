import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { Palette } from 'lucide-react'

const PRESET_COLORS = [
  '#ffffff',
  '#f5f5f5',
  '#e8e8e8',
  '#1a1a1a',
  '#2b2b2b',
  '#3d3d3d',
  '#dc2626',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#16a34a',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#ec4899',
  '#58aec9',
  '#4a90d9',
]

export function ColorPicker() {
  const shirtColor = useStore((s) => s.shirtColor)
  const setShirtColor = useStore((s) => s.setShirtColor)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-black/60" />
          <span className="text-sm font-medium">Shirt Color</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-accent hover:text-accent-dark font-medium"
        >
          {isOpen ? 'Less' : 'More'}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={shirtColor}
            onChange={(e) => setShirtColor(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-10 h-10 rounded-xl border-2 border-surface-border shadow-sm cursor-pointer"
            style={{ backgroundColor: shirtColor }}
          />
        </div>
        <span className="text-xs font-mono text-black/50 uppercase">
          {shirtColor}
        </span>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex flex-wrap gap-2"
        >
          {PRESET_COLORS.map((color) => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShirtColor(color)}
              className={`
                w-7 h-7 rounded-lg transition-all duration-150
                ${
                  shirtColor === color.toLowerCase()
                    ? 'ring-2 ring-offset-1 ring-accent scale-110'
                    : 'ring-1 ring-black/10'
                }
              `}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
