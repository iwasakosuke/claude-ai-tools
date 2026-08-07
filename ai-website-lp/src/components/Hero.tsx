import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, PlayCircle } from 'lucide-react'
import { HERO_IMAGE } from '../content/images'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.15 }}
        transition={{ duration: 24, ease: 'linear', repeat: Infinity, repeatType: 'mirror' }}
      >
        <img src={HERO_IMAGE} alt="" className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/70"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          AIで、動くWebサイトをつくる
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="text-5xl font-bold leading-[1.15] tracking-tight text-white sm:text-6xl md:text-7xl"
        >
          考えを伝えるだけで、
          <br />
          サイトが<span className="text-accent">動きだす。</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-8 max-w-2xl text-lg text-white/70 md:text-xl"
        >
          デザインも、仕組みも、動きも。AIが言葉からWebサイトを組み上げる時代へ。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
        >
          <a
            href="#cta"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-ink transition-transform hover:scale-105"
          >
            はじめてみる
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#showcase"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white/80 transition-colors hover:border-white/40 hover:text-white"
          >
            <PlayCircle className="h-5 w-5" />
            作例を見る
          </a>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/40"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  )
}
