import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'

const TEXT = 'アイデアが、そのまま動くサイトになる'

function GlowChar({
  char,
  range,
  progress,
}: {
  char: string
  range: [number, number]
  progress: MotionValue<number>
}) {
  const opacity = useTransform(progress, range, [0.15, 1])
  const color = useTransform(progress, range, ['#4b4b4b', '#ffffff'])
  const textShadow = useTransform(
    progress,
    range,
    ['0 0 0px rgba(255,107,61,0)', '0 0 24px rgba(255,107,61,0.85)'],
  )

  return (
    <motion.span style={{ opacity, color, textShadow }} className="inline-block">
      {char === ' ' ? ' ' : char}
    </motion.span>
  )
}

export default function GlowScrollText() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const chars = Array.from(TEXT)

  return (
    <section ref={containerRef} className="relative h-[300vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center px-6">
        <p className="max-w-4xl text-center text-3xl font-bold leading-relaxed tracking-wide sm:text-5xl md:text-6xl">
          {chars.map((char, i) => {
            const start = i / chars.length
            const end = (i + 1) / chars.length
            return (
              <GlowChar key={i} char={char} range={[start, end]} progress={scrollYProgress} />
            )
          })}
        </p>
      </div>
    </section>
  )
}
