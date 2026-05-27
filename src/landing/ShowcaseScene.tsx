import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function ShowcaseScene() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
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
      tl.fromTo(boardRef.current,
        { y: 50, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
        0.1
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
          section.style.setProperty('--cinematic-blur', `${blur}px`)
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const columns = [
    {
      label: 'Now', color: '#CC3333',
      items: [
        { title: 'Call electrician about NEPA', time: '5m ago' },
        { title: 'Buy cement from Mike\'s depot', time: '15m ago' },
      ],
    },
    {
      label: 'Soon', color: '#3A6B9F',
      items: [
        { title: 'Reply Mr. Adebayo about the quote', time: '2h ago' },
      ],
    },
    {
      label: 'Later', color: '#6B4F3A',
      items: [
        { title: 'Pick up plumbing parts at Oyingbo', time: '5h ago' },
      ],
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32 overflow-hidden"
      style={{ filter: 'blur(var(--cinematic-blur, 0px))' }}
    >
      <div
        ref={parallaxRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(160,120,44,0.04) 0%, transparent 60%)',
        }}
      />

      <h2
        ref={textRef}
        className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#F5E6C8] text-center mb-6"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        Everything has a peg.
        <br />
        <span className="text-[#E8D5A8]/60">Everything has a place.</span>
      </h2>

      <p
        ref={bodyRef}
        className="text-base sm:text-lg text-[#E8D5A8]/70 max-w-lg mx-auto text-center leading-relaxed mb-12"
      >
        Now. Soon. Later. Three slots, no guilt, nothing lost in the pile. Pin it where it belongs and watch the noise settle.
      </p>

      <div ref={boardRef} className="w-full max-w-4xl board-frame p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#F5E6C8]/10">
          <div className="flex items-center gap-3">
            <span className="pin pin--red" />
            <span className="text-xs text-[#F5E6C8]/50 tracking-wider uppercase font-mono">Wahala Sorter</span>
          </div>
          <span className="text-[10px] text-[#F5E6C8]/20 tracking-widest uppercase font-mono">The Board</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {columns.map((col) => (
            <div key={col.label} className="bg-[#1A0F0A]/60 backdrop-blur-sm border border-[#F5E6C8]/10 p-4 min-h-[220px]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F5E6C8]/10">
                <span className="pin pin--red" style={{ width: '10px', height: '10px' }} />
                <span className="text-xs font-semibold text-[#F5E6C8] tracking-wider uppercase">{col.label}</span>
              </div>
              <div className="space-y-2">
                {col.items.map((item) => (
                  <div key={item.title} className="sticky-note text-xs" style={{ '--rot': `${(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF - 0.5) * 1}deg`, padding: '10px 12px', color: '#2C1810' } as React.CSSProperties}>
                    <span className="pin pin--yellow" style={{ position: 'absolute', top: '-7px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px' }} />
                    <p className="relative z-10 leading-relaxed">{item.title}</p>
                    <p className="relative z-10 text-[10px] text-[#6B4F3A]/60 mt-1">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-[#F5E6C8]/10 text-center">
          <span className="text-[10px] text-[#F5E6C8]/20 tracking-widest uppercase font-mono">
            Now &bull; Soon &bull; Later
          </span>
        </div>
      </div>
    </section>
  )
}
