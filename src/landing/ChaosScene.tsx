import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const CHAOS_TASKS = [
  'NEPA don go', 'Reply client', 'Pickup at Ojota',
  'Send invoice', 'Fix Figma', 'Call mechanic',
  'Buy cement', 'Mr. Adebayo', 'Pay generator',
  'Order tiles', 'Confirm delivery', 'Water tank',
  'Submit report', 'Traffic jam', 'Oyingbo parts',
]

const NOTE_COLORS = ['#F5E6C8', '#E8D5A8', '#F0E0C0', '#EDDFC5', '#F2E4C5']

interface PhysicsState {
  x: number
  y: number
  vx: number
  vy: number
  mass: number
  springK: number
  damping: number
  rot: number
  rotV: number
}

export function ChaosScene() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const parallaxRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const cursorRef = useRef({ x: -9999, y: -9999, active: false })
  const physicsRef = useRef<PhysicsState[]>([])
  const noteElsRef = useRef<HTMLDivElement[]>([])
  const noteCentersRef = useRef<{ x: number; y: number }[]>([])
  const baseRotRef = useRef<number[]>([])

  useEffect(() => {
    const section = sectionRef.current
    const board = boardRef.current
    if (!section || !board) return

    const notes = Array.from(board.querySelectorAll<HTMLDivElement>('.chaos-note'))
    noteElsRef.current = notes
    const count = notes.length

    baseRotRef.current = notes.map((_, i) => (i * 7) % 12 - 6)
    noteCentersRef.current = new Array(count).fill({ x: 0, y: 0 })

    const rng = () => (crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF)
    const initialOffsets = notes.map(() => ({
      x: (rng() - 0.5) * 240,
      y: (rng() - 0.5) * 200,
    }))

    physicsRef.current = notes.map((_, i) => ({
      x: initialOffsets[i].x,
      y: initialOffsets[i].y,
      vx: 0,
      vy: 0,
      mass: 0.8 + rng() * 0.6,
      springK: 0.008 + rng() * 0.004,
      damping: 0.88 + rng() * 0.06,
      rot: baseRotRef.current[i],
      rotV: 0,
    }))

    const updateCenters = () => {
      notes.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        const sr = section.getBoundingClientRect()
        noteCentersRef.current[i] = {
          x: r.left - sr.left + r.width / 2,
          y: r.top - sr.top + r.height / 2,
        }
      })
    }

    updateCenters()

    let floatPhase = 0

    const tick = () => {
      const bodies = physicsRef.current
      const cx = cursorRef.current.x
      const cy = cursorRef.current.y
      const active = cursorRef.current.active
      floatPhase += 0.015

      for (let i = 0; i < count; i++) {
        const b = bodies[i]
        const center = noteCentersRef.current[i]
        if (!center) continue

        b.vx *= b.damping
        b.vy *= b.damping

        const springX = -b.springK * b.x
        const springY = -b.springK * b.y
        b.vx += springX / b.mass
        b.vy += springY / b.mass

        const ambientX = Math.sin(floatPhase + i * 2.7) * 0.04
        const ambientY = Math.cos(floatPhase * 0.7 + i * 1.3) * 0.04
        b.vx += ambientX
        b.vy += ambientY

        if (active) {
          const dx = center.x - cx
          const dy = center.y - cy
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 260) {
            const strength = Math.max(0, (260 - dist) / 260)
            const force = strength * strength * 2.2
            const nx = dx / Math.max(dist, 1)
            const ny = dy / Math.max(dist, 1)
            b.vx += (nx * force) / b.mass
            b.vy += (ny * force) / b.mass

            b.rotV += (nx * strength * 0.06) / b.mass
          }
        }

        b.rotV *= 0.92
        b.rot += b.rotV

        b.x += b.vx
        b.y += b.vy

        const wobble = Math.sin(floatPhase * 1.3 + i * 3.1) * 0.08
        notes[i].style.transform = `translate(${b.x}px, ${b.y}px) rotate(${b.rot + wobble}deg)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    const getPos = (clientX: number, clientY: number) => {
      const sr = section.getBoundingClientRect()
      cursorRef.current = {
        x: clientX - sr.left,
        y: clientY - sr.top,
        active: true,
      }
    }

    const handleMouse = (e: MouseEvent) => {
      getPos(e.clientX, e.clientY)
      updateCenters()
    }

    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      getPos(t.clientX, t.clientY)
      updateCenters()
    }

    const handleLeave = () => {
      cursorRef.current.active = false
    }

    const handleResize = () => updateCenters()
    window.addEventListener('resize', handleResize)

    section.addEventListener('mousemove', handleMouse)
    section.addEventListener('mouseleave', handleLeave)
    section.addEventListener('touchmove', handleTouch, { passive: true })
    section.addEventListener('touchend', handleLeave)

    rafRef.current = requestAnimationFrame(tick)

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

      gsap.fromTo(parallaxRef.current,
        { y: -40 },
        { y: 40, duration: 1, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.2 } }
      )

      notes.forEach((el, i) => {
        gsap.set(el, { opacity: 0 })
        gsap.to(el, {
          opacity: 1,
          duration: 0.5,
          delay: i * 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'center center',
            scrub: 0.5,
          },
        })
      })

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

    return () => {
      ctx.revert()
      window.removeEventListener('resize', handleResize)
      section.removeEventListener('mousemove', handleMouse)
      section.removeEventListener('mouseleave', handleLeave)
      section.removeEventListener('touchmove', handleTouch)
      section.removeEventListener('touchend', handleLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
    >
      <div
        ref={parallaxRef}
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(160,120,44,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div ref={boardRef} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        {CHAOS_TASKS.map((task, i) => (
          <div
            key={task}
            className="chaos-note absolute cursor-default select-none"
            style={{
              left: `${6 + (i * 6) % 88}%`,
              top: `${10 + (i * 7) % 80}%`,
              background: NOTE_COLORS[i % NOTE_COLORS.length],
              padding: '6px 10px',
              willChange: 'transform',
                  fontSize: i % 3 === 0 ? '11px' : '10px',
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

      <div className="text-center max-w-3xl relative pointer-events-none">
        <h2
          ref={textRef}
          className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#F5E6C8]"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          It all lands on you.
          <br />
          <span className="italic text-[#CC3333]">The board catches everything.</span>
        </h2>
        <p
          ref={bodyRef}
          className="mt-8 text-base sm:text-lg text-[#E8D5A8]/70 max-w-lg mx-auto leading-relaxed"
        >
          NEPA. WhatsApp. The mechanic. The client. Fifteen loose ends before your coffee gets cold. Stop holding it all in your head — drop it on the board instead.
        </p>
      </div>
    </section>
  )
}
