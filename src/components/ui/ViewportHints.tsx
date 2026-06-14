import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'

interface ViewportHintsProps {
  visible: boolean
}

function HintCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: ReactNode
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.28, delay }}
      className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/75 bg-white/88 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur"
    >
      <motion.div
        animate={{ y: [0, -3, 0], rotate: [0, -4, 4, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay }}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#58aec9]/12 text-[#58aec9]"
      >
        {icon}
      </motion.div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/65">{title}</p>
        <p className="text-xs leading-relaxed text-black/45">{description}</p>
      </div>
    </motion.div>
  )
}

export function ViewportHints({ visible }: ViewportHintsProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none absolute inset-x-0 bottom-36 z-20 px-3 sm:bottom-40 lg:hidden"
        >
          <div className="mx-auto flex max-w-md flex-col gap-2.5">
            <HintCard
              delay={0}
              icon={
                <div className="relative h-5 w-5">
                  <motion.div
                    animate={{ x: [-3, -6, -3] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-0 top-0"
                  >
                    <ZoomOut size={18} />
                  </motion.div>
                  <motion.div
                    animate={{ x: [3, 6, 3] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute right-0 top-0"
                  >
                    <ZoomIn size={18} />
                  </motion.div>
                </div>
              }
              title="Acercar"
              description="Haz pellizco para acercar o alejar el modelo."
            />
            <HintCard
              delay={0.08}
              icon={<RotateCcw size={18} />}
              title="Rotación"
              description="Desliza sobre el visor para girar la prenda en 3D."
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
