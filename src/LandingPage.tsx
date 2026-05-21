import { useRef, useEffect } from 'react'
import Lenis from 'lenis'
import { ThreeBackground } from './landing/ThreeBackground'
import { scrollState } from './landing/scrollState'
import { IntroScene } from './landing/IntroScene'
import { ChaosScene } from './landing/ChaosScene'
import { SortingScene } from './landing/SortingScene'
import { ShowcaseScene } from './landing/ShowcaseScene'
import { FinalScene } from './landing/FinalScene'

export function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    })

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    lenis.on('scroll', (e: { progress: number }) => {
      scrollState.current = Math.max(0, Math.min(1, e.progress))
    })

    return () => {
      cancelAnimationFrame(rafId)
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
