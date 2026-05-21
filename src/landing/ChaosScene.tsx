import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const CHAOS_TASKS = [
  'NEPA don go', 'Reply client', 'Pickup at Ojota',
  'Send invoice', 'Fix Figma', 'Call mechanic',
  'Buy cement', 'Mr. Adebayo', 'Pay generator',
  'Order tiles', 'Confirm delivery', 'Water tank',
  'Submit report', 'Traffic jam', 'Oyingbo parts',
]

const NOTE_COLORS = ['#F5E6C8', '#E8D5A8', '#F0E0C0', '#EDDFC5', '#F2E4C5']

export function ChaosScene() {
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
          gsap.to(textRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
        },
      })

      if (boardRef.current) {
        const notes = boardRef.current.querySelectorAll('.chaos-note')
        notes.forEach((el, i) => {
          gsap.set(el, {
            x: gsap.utils.random(-120, 120),
            y: gsap.utils.random(-100, 100),
            rotation: gsap.utils.random(-12, 12),
            opacity: 0,
          })
          gsap.to(el, {
            opacity: 1,
            duration: 0.5,
            delay: i * 0.06,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top center',
              end: 'center center',
            },
          })
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      <div ref={boardRef} className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse at center, rgba(160,120,44,0.06) 0%, transparent 70%)`,
      }}>
        {CHAOS_TASKS.map((task, i) => (
          <div
            key={task}
            className="chaos-note absolute"
            style={{
              left: `${8 + (i * 6) % 84}%`,
              top: `${12 + (i * 8) % 76}%`,
              background: NOTE_COLORS[i % NOTE_COLORS.length],
              padding: '6px 10px',
              transform: `rotate(${(i * 7) % 12 - 6}deg)`,
              fontSize: i % 3 === 0 ? '9px' : '7px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#2C1810',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: i % 2 === 0 ? 700 : 400,
              boxShadow: '1px 2px 6px rgba(0,0,0,0.15)',
              opacity: 0,
            }}
          >
            <span style={{
              display: 'block',
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: '#CC3333',
              margin: '-10px auto 4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }} />
            {task}
          </div>
        ))}
      </div>

      <div className="text-center max-w-3xl relative">
        <h2
          ref={textRef}
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#F5E6C8] opacity-0 translate-y-12"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Too many leads.<br />
          <span className="italic text-[#CC3333]">Not enough order.</span>
        </h2>
        <p className="mt-8 text-base sm:text-lg text-[#E8D5A8]/40 max-w-lg mx-auto leading-relaxed">
          Pinned everywhere. No system. Every scrap of paper is a loose end. The board needs sorting.
        </p>

        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 border border-[#CC3333]/20 bg-[#1A0F0A]/40 backdrop-blur-sm">
            <span className="text-[10px] tracking-[0.15em] uppercase text-[#CC3333]/50 font-mono">Evidence scattered</span>
            <span className="w-1 h-4 bg-[#CC3333]" />
            <span className="text-[10px] tracking-[0.15em] uppercase text-[#E8D5A8]/30 font-mono">{CHAOS_TASKS.length} items</span>
          </div>
        </div>
      </div>
    </section>
  )
}
