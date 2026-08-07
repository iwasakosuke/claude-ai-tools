import Nav from './components/Nav'
import Hero from './components/Hero'
import ShowcaseMarquee from './components/ShowcaseMarquee'
import GlowScrollText from './components/GlowScrollText'
import StackCards from './components/StackCards'
import Steps from './components/Steps'
import FinalCTA from './components/FinalCTA'

export default function App() {
  return (
    <div className="min-h-screen bg-ink text-white">
      <Nav />
      <Hero />
      <ShowcaseMarquee />
      <GlowScrollText />
      <StackCards />
      <Steps />
      <FinalCTA />
    </div>
  )
}
