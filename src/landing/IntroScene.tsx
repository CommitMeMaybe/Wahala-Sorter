import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function IntroScene() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const fadeRef = useRef<HTMLDivElement>(null)

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
        { y: 80, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power2.out' },
        0
      )
      tl.fromTo(bodyRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        0.3
      )

      gsap.fromTo(parallaxRef.current,
        { y: -60 },
        { y: 60, duration: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.2 } }
      )

      gsap.fromTo(fadeRef.current,
        { scaleY: 0, opacity: 0, transformOrigin: 'bottom center' },
        { scaleY: 1, opacity: 1, duration: 1.2, ease: 'power2.inOut', scrollTrigger: { trigger: section, start: 'top bottom', end: 'center center', scrub: 1 } }
      )

      gsap.to(scrollRef.current, {
        opacity: 0.15,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })

      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
        onUpdate: (self) => {
          const maxBlur = window.innerWidth <= 700 ? 0.8 : 1.5
          const blur = self.progress * maxBlur
          section.style.setProperty('--cinematic-blur', `${blur}px`)
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
      style={{ filter: 'blur(var(--cinematic-blur, 0px))' }}
    >
      <div
        ref={parallaxRef}
        className="absolute inset-x-0 top-0 h-[120%]"
        style={{
          background: 'linear-gradient(180deg, rgba(160,120,44,0.08) 0%, transparent 60%)',
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(160,120,44,0.05) 0%, transparent 50%)`,
          pointerEvents: 'none',
        }}
      />

      <div
        ref={fadeRef}
        className="absolute inset-x-0 bottom-0 h-1/2 opacity-0"
        style={{
          background: 'linear-gradient(0deg, rgba(160,120,44,0.06) 0%, transparent 100%)',
          pointerEvents: 'none',
        }}
      />

      <div className="text-center max-w-4xl relative">
        <h1
          ref={textRef}
          className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-light tracking-tight text-[#F5E6C8] leading-none"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Every day
          <br />
          <span className="italic text-[#E8D5A8]/80">arrives with its own pile.</span>
        </h1>

        <p
          ref={bodyRef}
          className="mt-8 text-base sm:text-lg text-[#E8D5A8]/70 max-w-xl mx-auto leading-relaxed"
        >
          NEPA. Clients. Materials. Another run to the park.{' '}
          <span className="italic text-[#E8D5A8]/70">A loose thread waiting to be pinned.</span>
        </p>

        <div
          ref={scrollRef}
          className="mt-16 flex flex-col items-center gap-3 text-[#E8D5A8]/40 tracking-widest uppercase"
        >
          <span className="text-[11px] font-mono letter-spacing-[0.25em]">Scroll to unravel</span>
          <span className="block w-px h-10 bg-gradient-to-b from-[#E8D5A8]/40 to-transparent" />
        </div>
      </div>
    </section>
  )
}
