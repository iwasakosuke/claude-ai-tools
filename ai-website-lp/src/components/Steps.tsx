import { motion } from 'framer-motion'
import { MessageSquareText, Sparkles, Rocket } from 'lucide-react'

const STEPS = [
  {
    icon: MessageSquareText,
    number: '01',
    title: '伝える',
    description: 'つくりたいサイトのイメージを、言葉でAIに伝えます。',
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'AIが組み立てる',
    description: 'デザインから機能の実装まで、AIが自動で組み上げます。',
  },
  {
    icon: Rocket,
    number: '03',
    title: '公開する',
    description: '動きを確認したら、そのまま公開。すぐに使いはじめられます。',
  },
]

export default function Steps() {
  return (
    <section id="steps" className="bg-paper py-32 text-ink">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-20 text-center">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-accent">How it works</p>
          <h2 className="text-4xl font-bold md:text-5xl">はじめかたは、3ステップ。</h2>
        </div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="flex flex-col items-start gap-5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink/5">
                  <step.icon className="h-7 w-7 text-accent" strokeWidth={1.8} />
                </div>
                <span className="text-sm font-semibold text-ink/30">{step.number}</span>
              </div>
              <h3 className="text-2xl font-bold">{step.title}</h3>
              <p className="text-lg leading-relaxed text-ink/60">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
