import { useRef, useEffect, useState } from 'react'
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

const SECTIONS = [0, 1, 2, 3, 4]

export function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const [progress, setProgress] = useState(0)
  const [activeDot, setActiveDot] = useState(0)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.2,
    })
    lenisRef.current = lenis

    let snapTimer: number

    lenis.on('scroll', (e: { progress: number; velocity: number; direction: number }) => {
      scrollState.current = Math.max(0, Math.min(1, e.progress))
      scrollState.velocity = e.velocity
      scrollState.direction = e.direction
      const p = Math.max(0, Math.min(1, e.progress))
      setProgress(p)
      setActiveDot(Math.round(p * (SECTIONS.length - 1)))
      ScrollTrigger.update()

      window.clearTimeout(snapTimer)
      if (Math.abs(e.velocity) < 0.5) {
        snapTimer = window.setTimeout(() => {
          const sections = containerRef.current?.querySelectorAll('section')
          if (!sections) return
          let bestIdx = 0
          let bestDist = Infinity
          sections.forEach((s, i) => {
            const dist = Math.abs(s.getBoundingClientRect().top)
            if (dist < bestDist) { bestDist = dist; bestIdx = i; }
          })
          if (bestDist > 10) {
            lenis.scrollTo(sections[bestIdx], { duration: 0.3, easing: (t) => 1 - Math.pow(1 - t, 3) })
          }
        }, 120)
      }
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

  const scrollToSection = (i: number) => {
    const sections = containerRef.current?.querySelectorAll('section')
    if (sections?.[i]) lenisRef.current?.scrollTo(sections[i], { duration: 0.4, easing: (t) => 1 - Math.pow(1 - t, 3) })
  }

  return (
    <div ref={containerRef} className="relative bg-[#0A0807]">
      <ThreeBackground />

      <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-[#F5E6C8]/10">
        <div
          className="h-full bg-[#CC3333] transition-[width] duration-200 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <nav className="fixed right-3 sm:right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5" aria-label="Scroll navigation">
        {SECTIONS.map(i => (
          <button
            key={i}
            onClick={() => scrollToSection(i)}
            className="group relative flex items-center justify-center w-6 h-6"
            aria-label={`Go to section ${i + 1}`}
          >
            <span
              className={`rounded-full transition-all duration-500 ease-out ${
                i === activeDot
                  ? 'w-2.5 h-2.5 bg-[#F5E6C8] shadow-[0_0_8px_rgba(245,230,200,0.4)]'
                  : 'w-1.5 h-1.5 bg-[#F5E6C8]/25 group-hover:bg-[#F5E6C8]/50'
              }`}
            />
          </button>
        ))}
      </nav>

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
