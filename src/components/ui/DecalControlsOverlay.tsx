import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { SECTOR_LABELS } from '../../types'
import { Slider } from '../shared/Slider'

export function DecalControlsOverlay() {
  const selectedModel = useStore((s) => s.selectedModel)
  const selectedSector = useStore((s) => s.selectedSector)
  const selectedDecalIndex = useStore((s) => s.selectedDecalIndex)
  const decals = useStore((s) => s.decals)
  const updateDecalPosition = useStore((s) => s.updateDecalPosition)
  const updateDecalScale = useStore((s) => s.updateDecalScale)
  const updateDecalRotation = useStore((s) => s.updateDecalRotation)

  const currentDecal = decals[selectedSector][selectedDecalIndex[selectedSector]] ?? decals[selectedSector][0] ?? null

  if (!currentDecal) return null

  const isSleeveSector = selectedSector === 'sleeve_left' || selectedSector === 'sleeve_right'
  const isHoodie = selectedModel === 'hoodie'
  const showPositionX = isHoodie || !isSleeveSector
  const showPositionZ = !isHoodie && selectedSector !== 'body_front' && selectedSector !== 'body_back'
  const showDecalIndex = decals[selectedSector].length > 1

  return (
    <AnimatePresence>
      <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center px-3 sm:bottom-6 sm:px-4 lg:px-0">
        <motion.section
          key={`${selectedSector}-${currentDecal.id}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="w-full max-w-[320px] rounded-2xl border border-white/70 bg-white/92 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.16)] backdrop-blur lg:w-[320px] lg:max-w-none"
        >
          <div className="mb-4 flex items-start gap-3">
            <div className="mt-0.5 rounded-xl bg-[#58aec9]/10 p-2 text-[#58aec9]">
              <SlidersHorizontal size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black">Ajustes de imagen</p>
              <p className="text-xs text-black/45">
                {SECTOR_LABELS[selectedSector]}
                {showDecalIndex ? ` · Decal ${selectedDecalIndex[selectedSector] + 1}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {showPositionX && (
              <Slider
                label="Posicion X"
                min={-0.35}
                max={0.35}
                step={0.005}
                value={currentDecal.position[0]}
                onChange={(val) => {
                  const pos: [number, number, number] = [val, currentDecal.position[1], currentDecal.position[2]]
                  updateDecalPosition(selectedSector, pos)
                }}
              />
            )}
            <Slider
              label="Posicion Y"
              min={-0.35}
              max={0.35}
              step={0.005}
              value={currentDecal.position[1]}
              onChange={(val) => {
                const pos: [number, number, number] = [currentDecal.position[0], val, currentDecal.position[2]]
                updateDecalPosition(selectedSector, pos)
              }}
            />
            {showPositionZ && (
              <Slider
                label={isSleeveSector ? 'Posicion X' : 'Posicion Z'}
                min={-0.15}
                max={0.15}
                step={0.005}
                value={currentDecal.position[2]}
                onChange={(val) => {
                  const pos: [number, number, number] = [currentDecal.position[0], currentDecal.position[1], val]
                  updateDecalPosition(selectedSector, pos)
                }}
              />
            )}
            <Slider
              label="Escala"
              min={0.01}
              max={0.35}
              step={0.0025}
              value={currentDecal.scale}
              onChange={(val) => updateDecalScale(selectedSector, val)}
            />
            <Slider
              label="Rotacion"
              min={-Math.PI}
              max={Math.PI}
              step={0.05}
              value={currentDecal.rotation}
              onChange={(val) => updateDecalRotation(selectedSector, val)}
            />
          </div>
        </motion.section>
      </div>
    </AnimatePresence>
  )
}
