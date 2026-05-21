import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function IntroScene() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => {
          gsap.to(textRef.current, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
          gsap.fromTo(boardRef.current,
            { scaleY: 0, opacity: 0 },
            { scaleY: 1, opacity: 1, duration: 1.5, ease: 'power3.inOut', delay: 0.3 }
          )
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      <div
        ref={boardRef}
        className="absolute inset-x-0 top-0 h-full origin-top opacity-0"
        style={{
          background: 'linear-gradient(180deg, rgba(160,120,44,0.08) 0%, transparent 60%)',
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(160,120,44,0.05) 0%, transparent 50%)`,
        }}
      />

      <div className="text-center max-w-4xl relative">
        <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 border border-[#CC3333]/30 bg-[#1A0F0A]/60 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#CC3333] animate-pulse" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-[#CC3333]/70 font-mono">Evidence Board</span>
        </div>

        <h1
          ref={textRef}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-[#F5E6C8] opacity-0 translate-y-12"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Every day starts<br />with wahala.
        </h1>

        <p className="mt-8 text-base sm:text-lg text-[#E8D5A8]/60 max-w-xl mx-auto leading-relaxed">
          The morning list. NEPA. Clients. Traffic. Another pickup at the park.{' '}
          <span className="italic">Pile them on the board.</span>
        </p>

        <div className="mt-12 flex justify-center gap-2 text-[#E8D5A8]/20 text-sm tracking-widest uppercase animate-pulse">
          <span className="inline-block w-2 h-2 rounded-full bg-[#CC3333]" />
          <span>Scroll to investigate</span>
        </div>
      </div>
    </section>
  )
}
