import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { SHOWCASE_IMAGES } from '../content/images'

interface CardData {
  tag: string
  title: string
  description: string
  image: string
}

const CARDS: CardData[] = [
  {
    tag: '予約サイト',
    title: '空き状況が、ひと目でわかる。',
    description: 'カレンダーの表示から予約フォームまで、AIが一体で組み立てます。',
    image: SHOWCASE_IMAGES[0],
  },
  {
    tag: 'ECサイト',
    title: '商品ページから決済まで、一気通貫。',
    description: '商品の見せ方も、購入までの導線も、AIが設計します。',
    image: SHOWCASE_IMAGES[1],
  },
  {
    tag: '会員サイト',
    title: 'ログインも、会員限定ページも。',
    description: '認証まわりの複雑な実装も、AIがまとめて組み込みます。',
    image: SHOWCASE_IMAGES[2],
  },
  {
    tag: '問い合わせ連携',
    title: '入力内容に応じて、自動で振り分け。',
    description: 'フォームの内容を判定し、対応まで自動でつなげます。',
    image: SHOWCASE_IMAGES[3],
  },
]

function Card({
  card,
  index,
  total,
  progress,
}: {
  card: CardData
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const targetScale = 1 - (total - index) * 0.06
  const range: [number, number] = [index / total, 1]
  const scale = useTransform(progress, range, [1, targetScale])

  return (
    <div
      className="sticky top-24 flex h-[80vh] items-center justify-center px-6"
      style={{ zIndex: index }}
    >
      <motion.div
        style={{ scale, top: index * 16 }}
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-2xl md:flex-row"
      >
        <div className="h-56 w-full md:h-auto md:w-1/2">
          <img src={card.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="flex w-full flex-col justify-center gap-4 p-8 md:w-1/2 md:p-12">
          <span className="inline-flex w-fit items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            {card.tag}
          </span>
          <h3 className="text-2xl font-bold leading-snug text-white md:text-3xl">
            {card.title}
          </h3>
          <p className="text-base text-white/60 md:text-lg">{card.description}</p>
        </div>
      </motion.div>
    </div>
  )
}

export default function StackCards() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section id="feature" ref={containerRef} className="relative py-32">
      <div className="mx-auto mb-20 max-w-3xl px-6 text-center">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-accent/80">Use Case</p>
        <h2 className="text-4xl font-bold text-white md:text-5xl">
          AIがつくる、動くサイトの例
        </h2>
      </div>
      {CARDS.map((card, i) => (
        <Card key={card.tag} card={card} index={i} total={CARDS.length} progress={scrollYProgress} />
      ))}
    </section>
  )
}
