import { motion } from 'framer-motion'
import { SECTOR_LIST, SECTOR_LABELS } from '../../types'
import type { Sector } from '../../types'

interface SectorSelectorProps {
  selected: Sector
  onSelect: (sector: Sector) => void
  sectors?: Sector[]
}

export function SectorSelector({ selected, onSelect, sectors = SECTOR_LIST }: SectorSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {sectors.map((sector) => {
        const isActive = sector === selected
        return (
          <motion.button
            key={sector}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(sector)}
            className={`
              px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150
              ${
                isActive
                  ? 'bg-accent text-white shadow-sm ring-1 ring-accent'
                  : 'bg-white text-black/70 border border-surface-border hover:border-accent/40 hover:text-black'
              }
            `}
          >
            {SECTOR_LABELS[sector]}
          </motion.button>
        )
      })}
    </div>
  )
}
