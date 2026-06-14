import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, RotateCcw, X } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { SectorSelector } from '../shared/SectorSelector'
import { ColorPicker } from './ColorPicker'
import { Uploaders } from './Uploaders'
import { Button } from '../shared/Button'
import { SHIRT_MODEL_LABELS, SHIRT_MODEL_LIST } from '../../types'
import type { Sector } from '../../types'

interface SidebarProps {
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

interface SidebarContentProps {
  selectedModel: ReturnType<typeof useStore.getState>['selectedModel']
  setSelectedModel: ReturnType<typeof useStore.getState>['setSelectedModel']
  selectedSector: Sector
  setSelectedSector: ReturnType<typeof useStore.getState>['setSelectedSector']
  availableSectors?: Sector[]
  onReset: () => void
}

function SidebarContent({
  selectedModel,
  setSelectedModel,
  selectedSector,
  setSelectedSector,
  availableSectors,
  onReset,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col gap-5 p-4 pb-6 sm:p-5 lg:gap-6">
      <div>
        <img src="/logo.png" alt="Iron Threads" className="h-12 w-auto sm:h-14 lg:h-16" />
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
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:border-red-400 hover:bg-red-100 sm:px-6 sm:py-5"
      >
        <RotateCcw size={18} />
        Reiniciar todo
      </button>
    </div>
  )
}

export function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
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
      <aside className="sidebar-scrollbar hidden h-full w-72 shrink-0 overflow-y-auto border-r border-surface-border bg-white lg:block">
        <SidebarContent
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          selectedSector={selectedSector}
          setSelectedSector={setSelectedSector}
          availableSectors={availableSectors}
          onReset={() => setShowResetConfirm(true)}
        />
      </aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30 bg-black/35 lg:hidden"
              onClick={onCloseMobile}
            />
            <motion.aside
              initial={{ y: '100%', opacity: 0.9 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.9 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="sidebar-scrollbar fixed inset-x-0 bottom-0 top-28 z-40 flex flex-col overflow-y-auto rounded-t-[28px] border border-surface-border bg-white shadow-[0_-18px_60px_rgba(0,0,0,0.18)] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-black">Personalizacion</p>
                  <p className="text-xs text-black/45">Configura modelo, sector e imagen</p>
                </div>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="rounded-full border border-surface-border p-2 text-black/60 transition-colors hover:bg-surface-alt"
                >
                  <X size={18} />
                </button>
              </div>

              <SidebarContent
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                selectedSector={selectedSector}
                setSelectedSector={setSelectedSector}
                availableSectors={availableSectors}
                onReset={() => setShowResetConfirm(true)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

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
