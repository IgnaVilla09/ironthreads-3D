import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { SectorSelector } from '../shared/SectorSelector'
import { ColorPicker } from './ColorPicker'
import { Uploaders } from './Uploaders'
import { Button } from '../shared/Button'
import { SHIRT_MODEL_LABELS, SHIRT_MODEL_LIST } from '../../types'
import type { Sector } from '../../types'

export function Sidebar() {
  const selectedModel = useStore((s) => s.selectedModel)
  const setSelectedModel = useStore((s) => s.setSelectedModel)
  const selectedSector = useStore((s) => s.selectedSector)
  const setSelectedSector = useStore((s) => s.setSelectedSector)
  const reset = useStore((s) => s.reset)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const isSleeveSector = selectedSector === 'sleeve_left' || selectedSector === 'sleeve_right'
  const isHoodie = selectedModel === 'hoodie'
  const availableSectors: Sector[] | undefined = isHoodie ? ['body_front', 'body_back'] : undefined

  useEffect(() => {
    if (isHoodie && isSleeveSector) {
      setSelectedSector('body_front')
    }
  }, [isHoodie, isSleeveSector, setSelectedSector])

  return (
    <>
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="sidebar-scrollbar w-72 shrink-0 h-full overflow-y-auto border-r border-surface-border bg-white"
      >
        <div className="p-5 flex flex-col gap-6">
          <div>
            <img src="/logo.png" alt="Iron Threads" className="h-16 w-auto" />
            <p className="text-xs text-black/40">Customizador 3D Iron Threads</p>
          </div>

          <section className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-black/50 uppercase tracking-wider">Modelo</span>
            <div className="grid grid-cols-2 gap-2">
              {SHIRT_MODEL_LIST.map((model) => {
                const isActive = model === selectedModel

                return (
                  <button
                    key={model}
                    type="button"
                    onClick={() => setSelectedModel(model)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-[#58aec9] bg-[#58aec9]/10 text-[#58aec9]'
                        : 'border-surface-border bg-surface-alt text-black/70 hover:border-[#58aec9]/40 hover:text-black'
                    }`}
                  >
                    {SHIRT_MODEL_LABELS[model]}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-black/50 uppercase tracking-wider">Sector</span>
            <SectorSelector selected={selectedSector} onSelect={setSelectedSector} sectors={availableSectors} />
          </section>

          <section className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-black/50 uppercase tracking-wider">Imagen</span>
            <Uploaders sector={selectedSector} />
          </section>

          <section>
            <ColorPicker />
          </section>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300 bg-red-50 px-6 py-5 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:border-red-400 hover:bg-red-100"
          >
            <RotateCcw size={18} />
            Reiniciar todo
          </button>
        </div>
      </motion.aside>

      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              className="w-full max-w-sm rounded-3xl border border-red-100 bg-white p-7 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
            >
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-2xl bg-red-100 p-2 text-red-600">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-black">Reiniciar personalizacion</h3>
                  <p className="mt-1 text-sm text-black/50">
                    Se perderan color, decals y ajustes actuales. Esta accion no se puede deshacer.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  className="flex-1 border border-red-700/10 shadow-sm"
                  onClick={() => {
                    reset()
                    setShowResetConfirm(false)
                  }}
                >
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
