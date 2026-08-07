import { motion } from 'framer-motion'
import { SHOWCASE_IMAGES } from '../content/images'

const items = [...SHOWCASE_IMAGES, ...SHOWCASE_IMAGES]

export default function ShowcaseMarquee() {
  return (
    <section id="showcase" className="relative border-y border-white/10 bg-black/40 py-16">
      <p className="mb-8 text-center text-sm uppercase tracking-[0.3em] text-white/40">
        Showcase
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
        <motion.div
          className="flex gap-6"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, ease: 'linear', repeat: Infinity }}
        >
          {items.map((src, i) => (
            <div
              key={i}
              className="h-56 w-80 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 md:h-72 md:w-[26rem]"
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
