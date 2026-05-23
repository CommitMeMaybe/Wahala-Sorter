import { useRef, useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ThreeBackground } from './landing/ThreeBackground'
import { scrollState } from './landing/scrollState'
import { IntroScene } from './landing/IntroScene'
import { ChaosScene } from './landing/ChaosScene'
import { SortingScene } from './landing/SortingScene'
import { ShowcaseScene } from './landing/ShowcaseScene'
import { FinalScene } from './landing/FinalScene'

gsap.registerPlugin(ScrollTrigger)

export function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 2.0,
      easing: (t) => {
        const c = 1.70158
        const c3 = c + 1
        return 1 + c3 * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)
      },
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.2,
    })

    lenis.on('scroll', (e: { progress: number; velocity: number; direction: number }) => {
      scrollState.current = Math.max(0, Math.min(1, e.progress))
      scrollState.velocity = e.velocity
      scrollState.direction = e.direction
      ScrollTrigger.update()
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div ref={containerRef} className="relative bg-[#0A0807]">
      <ThreeBackground />

      <div className="relative z-10">
        <IntroScene />
        <ChaosScene />
        <SortingScene />
        <ShowcaseScene />
        <FinalScene onEnterApp={onEnterApp} />
      </div>
    </div>
  )
}
