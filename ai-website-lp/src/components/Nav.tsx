import { Sparkles } from 'lucide-react'

const links = [
  { label: '特徴', href: '#feature' },
  { label: '作例', href: '#showcase' },
  { label: '使い方', href: '#steps' },
]

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
      <div className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-black/40 px-5 py-3 backdrop-blur-xl md:px-7">
        <a href="#top" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" strokeWidth={2.2} />
          <span className="text-sm font-semibold tracking-[0.2em] text-white/90">
            AI WEBSITE
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#cta"
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-ink transition-transform hover:scale-105"
        >
          はじめる
        </a>
      </div>
    </header>
  )
}
