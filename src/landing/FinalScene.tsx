import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function FinalScene({ onEnterApp }: { onEnterApp: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current
      if (!section) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2,
        },
      })

      tl.fromTo(textRef.current,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power2.out' },
        0
      )
      tl.fromTo(bodyRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        0.2
      )
      tl.fromTo(btnRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        0.4
      )

      gsap.fromTo(parallaxRef.current,
        { y: -40 },
        { y: 40, duration: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.2 } }
      )

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
        onUpdate: (self) => {
          const maxBlur = window.innerWidth <= 700 ? 0.8 : 1.5
          const blur = self.progress * maxBlur
          if (blur > 0) section.style.setProperty('filter', `blur(${blur}px)`)
          else section.style.removeProperty('filter')
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 overflow-hidden"
    >
      <div
        ref={parallaxRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(204,51,51,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="text-center max-w-2xl relative">
        <h2
          ref={textRef}
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#F5E6C8]"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Stop juggling everything.
          <br />
          <span className="italic text-[#E8D5A8]/70">Sort your day into Now, Soon, and Later.</span>
        </h2>

        <p
          ref={bodyRef}
          className="mt-8 text-base sm:text-lg text-[#E8D5A8]/70 max-w-md mx-auto leading-relaxed"
        >
          A simple board where you drop tasks, drag them between columns, and clear your head. No accounts, no setup, no noise.
        </p>

        <button
          ref={btnRef}
          onClick={onEnterApp}
          className="mt-12 px-10 py-4 bg-[#CC3333] text-[#F5E6C8] text-sm font-semibold tracking-wider uppercase hover:bg-[#AA2222] transition-colors duration-300 inline-flex items-center gap-3"
        >
          <span className="pin pin--yellow" style={{ width: '10px', height: '10px' }} />
          Start sorting
        </button>
      </div>

      <p className="absolute bottom-8 text-[10px] text-[#E8D5A8]/10 tracking-widest uppercase font-mono">
        Free. No sign-up. Just sort.
      </p>
    </section>
  )
}
