import { useRef, useEffect, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { IntroScene } from './landing/IntroScene'
import { FlowScene } from './landing/FlowScene'
import { DetailScene } from './landing/DetailScene'
import { FinalScene } from './landing/FinalScene'

gsap.registerPlugin(ScrollTrigger)

export function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    })

    lenis.on('scroll', (e: { progress: number }) => {
      setProgress(Math.max(0, Math.min(1, e.progress)))
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return (
    <div ref={containerRef} className="relative" style={{ background: '#0C0C0C' }}>
      <div className="fixed top-0 left-0 right-0 z-50 h-[1px]" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full transition-[width] duration-300 ease-out"
          style={{ width: `${progress * 100}%`, background: '#CC3333' }}
        />
      </div>

      <div className="relative">
        <IntroScene />
        <FlowScene />
        <DetailScene />
        <FinalScene onEnterApp={onEnterApp} />
      </div>
    </div>
  )
}
