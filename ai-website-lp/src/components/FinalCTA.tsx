import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function FinalCTA() {
  return (
    <section id="cta" className="relative overflow-hidden py-40 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mx-auto max-w-3xl px-6"
      >
        <h2 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
          さあ、動くWebサイトを。
        </h2>
        <p className="mt-6 text-lg text-white/60 md:text-xl">
          アイデアを言葉にするところから、はじめましょう。
        </p>
        <a
          href="#top"
          className="group mt-12 inline-flex items-center gap-2 rounded-full bg-accent px-10 py-5 text-lg font-semibold text-ink transition-transform hover:scale-105"
        >
          はじめてみる
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </a>
      </motion.div>

      <p className="relative z-10 mt-24 text-sm text-white/30">© 2026 AI Website</p>
    </section>
  )
}
