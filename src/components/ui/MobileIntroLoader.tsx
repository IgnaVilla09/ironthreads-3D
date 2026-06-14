import { AnimatePresence, motion } from 'framer-motion'
import { Laptop, TabletSmartphone } from 'lucide-react'

interface MobileIntroLoaderProps {
  visible: boolean
  progress: number
}

export function MobileIntroLoader({ visible, progress }: MobileIntroLoaderProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#dfeef4]/42 p-4 backdrop-blur-xl lg:hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(88,174,201,0.2),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(255,255,255,0.8),_transparent_35%)]" />

          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-sm rounded-[32px] border border-white/70 bg-white/45 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.16)] backdrop-blur-2xl"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl border border-white/70 bg-white/55 px-3 py-2 shadow-sm">
                <img src="/logo.png" alt="Iron Threads" className="h-10 w-auto" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-[0.24em] text-black">IRON THREADS</p>
                <p className="text-xs text-black/45">Preparando experiencia 3D</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xl font-semibold leading-tight text-black">
                Cargando visor interactivo
              </p>
              <p className="mt-2 text-sm leading-relaxed text-black/55">
                Recomendamos usar el sistema en computadora, notebook o tablet en horizontal para una experiencia más cómoda y precisa.
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-white/70 bg-white/40 p-4">
              <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-black/45">
                <span>Inicializando</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/60">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#58aec9] via-[#7ac4db] to-[#3d94af]"
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.25 }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/70 bg-white/35 p-3 text-black/60">
                <Laptop size={18} className="mb-2 text-[#58aec9]" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em]">Computadora</p>
                <p className="mt-1 text-[11px] leading-relaxed">Mayor área de trabajo y mejor control del visor.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/35 p-3 text-black/60">
                <TabletSmartphone size={18} className="mb-2 text-[#58aec9]" />
                <p className="text-xs font-semibold uppercase tracking-[0.14em]">Tablet horizontal</p>
                <p className="mt-1 text-[11px] leading-relaxed">Mejor equilibrio entre vista, zoom y personalización.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
