import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function FinalScene({ onEnterApp }: { onEnterApp: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          gsap.to(textRef.current, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
          gsap.to(btnRef.current, { opacity: 1, y: 0, duration: 1, delay: 0.4, ease: 'power3.out' })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(204,51,51,0.04) 0%, transparent 60%)',
      }} />

      <div className="text-center max-w-2xl relative">
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 border border-[#3A6B9F]/30 bg-[#1A0F0A]/60 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#3A6B9F]" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#3A6B9F]/60 font-mono">Case Closed</span>
        </div>

        <h2
          ref={textRef}
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#F5E6C8] opacity-0 translate-y-12"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Less noise.<br />
          <span className="italic text-[#E8D5A8]/70">More focus.</span>
        </h2>

        <p className="mt-8 text-base sm:text-lg text-[#E8D5A8]/40 max-w-md mx-auto leading-relaxed">
          Every lead sorted. Every pin in place. Stop carrying the casefile in your head — pin it to the board.
        </p>

        <button
          ref={btnRef}
          onClick={onEnterApp}
          className="mt-12 px-10 py-4 bg-[#CC3333] text-[#F5E6C8] text-sm font-semibold tracking-wider uppercase opacity-0 translate-y-8 hover:bg-[#AA2222] transition-colors duration-300 inline-flex items-center gap-3"
        >
          <span className="pin pin--yellow" style={{ width: '10px', height: '10px' }} />
          Start Sorting
        </button>
      </div>

      <p className="absolute bottom-8 text-[10px] text-[#E8D5A8]/10 tracking-widest uppercase font-mono">
        Pinned for the builders of Lagos
      </p>
    </section>
  )
}
