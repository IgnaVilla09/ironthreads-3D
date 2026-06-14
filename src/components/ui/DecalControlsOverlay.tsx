import { useState } from 'react'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import { ChevronDown, ChevronUp, GripHorizontal, Link2, Link2Off, SlidersHorizontal } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { SECTOR_LABELS } from '../../types'
import { Slider } from '../shared/Slider'
import { buildDecalSizeLabel, estimateDecalMeasurementsCm } from '../../utils/decalMeasurements'

export function DecalControlsOverlay() {
  const [isMinimized, setIsMinimized] = useState(false)
  const dragControls = useDragControls()
  const selectedModel = useStore((s) => s.selectedModel)
  const selectedSector = useStore((s) => s.selectedSector)
  const selectedDecalIndex = useStore((s) => s.selectedDecalIndex)
  const decals = useStore((s) => s.decals)
  const updateDecalPosition = useStore((s) => s.updateDecalPosition)
  const updateDecalScaleX = useStore((s) => s.updateDecalScaleX)
  const updateDecalScaleY = useStore((s) => s.updateDecalScaleY)
  const toggleDecalScaleLink = useStore((s) => s.toggleDecalScaleLink)
  const updateDecalRotation = useStore((s) => s.updateDecalRotation)
  const garmentWorldMeasurements = useStore((s) => s.garmentWorldMeasurements)

  const currentDecal = decals[selectedSector][selectedDecalIndex[selectedSector]] ?? decals[selectedSector][0] ?? null

  if (!currentDecal) return null

  const isSleeveSector = selectedSector === 'sleeve_left' || selectedSector === 'sleeve_right'
  const isHoodie = selectedModel === 'hoodie'
  const showPositionX = isHoodie || !isSleeveSector
  const showPositionZ = !isHoodie && selectedSector !== 'body_front' && selectedSector !== 'body_back'
  const showDecalIndex = decals[selectedSector].length > 1
  const estimatedSize = estimateDecalMeasurementsCm({
    decal: currentDecal,
    sector: selectedSector,
    selectedModel,
    garmentWorldMeasurements,
  })

  return (
    <AnimatePresence>
      <div className="pointer-events-none absolute inset-0 z-10">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          drag
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
          dragMomentum={false}
          dragElastic={0.08}
          className="pointer-events-auto absolute bottom-5 left-1/2 w-[calc(100%-24px)] max-w-[320px] -translate-x-1/2 rounded-2xl border border-white/70 bg-white/92 shadow-[0_20px_60px_rgba(0,0,0,0.16)] backdrop-blur sm:bottom-6 sm:w-[320px] lg:left-auto lg:right-6 lg:translate-x-0"
        >
          <div
            className="flex cursor-grab items-start gap-3 border-b border-black/5 px-4 py-3 active:cursor-grabbing"
            onPointerDown={(event) => dragControls.start(event)}
          >
            <div className="mt-0.5 rounded-xl bg-[#58aec9]/10 p-2 text-[#58aec9]">
              <SlidersHorizontal size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black">Ajustes de imagen</p>
                <p className="text-xs text-black/45">
                  {SECTOR_LABELS[selectedSector]}
                 {showDecalIndex ? ` · Diseño ${selectedDecalIndex[selectedSector] + 1}` : ''}
                </p>
              <p className="mt-1 text-[11px] font-medium text-[#58aec9]">
                Medida estimada: {buildDecalSizeLabel(estimatedSize)}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1 pl-2 text-black/45">
              <GripHorizontal size={16} />
              <button
                type="button"
                onClick={() => setIsMinimized((value) => !value)}
                className="rounded-full p-1.5 transition-colors hover:bg-black/5 hover:text-black"
                aria-label={isMinimized ? 'Expandir ajustes de imagen' : 'Minimizar ajustes de imagen'}
              >
                {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>
          </div>

          {!isMinimized && (
            <div className="flex flex-col gap-3 p-4">
              {showPositionX && (
                <Slider
                  label="Posición X"
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
                label="Posición Y"
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
                  label={isSleeveSector ? 'Posición X' : 'Posición Z'}
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
              <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface/70 px-3 py-2">
                <div>
                  <p className="text-xs font-medium text-black/75">Mantener proporción</p>
                  <p className="text-[11px] text-black/45">Vincula la escala horizontal y vertical.</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDecalScaleLink(selectedSector)}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                    currentDecal.isScaleLinked
                      ? 'bg-[#58aec9]/12 text-[#58aec9]'
                      : 'bg-black/5 text-black/55'
                  }`}
                >
                  {currentDecal.isScaleLinked ? <Link2 size={13} /> : <Link2Off size={13} />}
                  {currentDecal.isScaleLinked ? 'Vinculado' : 'Libre'}
                </button>
              </div>
              <Slider
                label="Escala X"
                min={0.01}
                max={0.35}
                step={0.0025}
                value={currentDecal.scaleX}
                onChange={(val) => updateDecalScaleX(selectedSector, val)}
              />
              <Slider
                label="Escala Y"
                min={0.01}
                max={0.35}
                step={0.0025}
                value={currentDecal.scaleY}
                onChange={(val) => updateDecalScaleY(selectedSector, val)}
              />
              <Slider
                label="Rotación"
                min={-Math.PI}
                max={Math.PI}
                step={0.05}
                value={currentDecal.rotation}
                onChange={(val) => updateDecalRotation(selectedSector, val)}
              />
            </div>
          )}
        </motion.section>
      </div>
    </AnimatePresence>
  )
}
