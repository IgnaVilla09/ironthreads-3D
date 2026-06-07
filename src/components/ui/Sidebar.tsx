import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { SectorSelector } from '../shared/SectorSelector'
import { ColorPicker } from './ColorPicker'
import { Uploaders } from './Uploaders'
import { Slider } from '../shared/Slider'
import type { Sector } from '../../types'

export function Sidebar() {
  const selectedSector = useStore((s) => s.selectedSector)
  const setSelectedSector = useStore((s) => s.setSelectedSector)
  const decals = useStore((s) => s.decals)
  const updateDecalPosition = useStore((s) => s.updateDecalPosition)
  const updateDecalScale = useStore((s) => s.updateDecalScale)
  const updateDecalRotation = useStore((s) => s.updateDecalRotation)
  const reset = useStore((s) => s.reset)

  const currentDecal = decals[selectedSector]
  const hasDecal = currentDecal !== null
  const isSleeveSector = selectedSector === 'sleeve_left' || selectedSector === 'sleeve_right'
  const showPositionX = !isSleeveSector
  const showPositionZ = selectedSector !== 'body_front' && selectedSector !== 'body_back'

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-72 shrink-0 h-full overflow-y-auto border-r border-surface-border bg-white"
    >
      <div className="p-5 flex flex-col gap-6">
        {/* Header */}
        <div>
          <img
            src="/logo.png"
            alt="Iron Threads"
            className="h-16 w-auto"
          />
          <p className="text-xs text-black/40">Customizador 3D Iron Threads</p>
        </div>

        {/* Sector selector */}
        <section className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-black/50 uppercase tracking-wider">
            Sector
          </span>
          <SectorSelector
            selected={selectedSector}
            onSelect={setSelectedSector}
          />
        </section>

        {/* Upload */}
        <section className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-black/50 uppercase tracking-wider">
            Imagen
          </span>
          <Uploaders sector={selectedSector} />
        </section>

        {/* Decal controls */}
        {hasDecal && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <span className="text-xs font-semibold text-black/50 uppercase tracking-wider">
              Ajustes de imagen
            </span>

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
          </motion.section>
        )}

        {/* Shirt color */}
        <section>
          <ColorPicker />
        </section>

        {/* Reset */}
        <button
          onClick={reset}
          className="text-xs text-black/40 hover:text-red-500 transition-colors self-start"
        >
          Reiniciar todo
        </button>
      </div>
    </motion.aside>
  )
}
