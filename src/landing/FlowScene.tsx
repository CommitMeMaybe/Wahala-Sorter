import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const COLORS = ['#CC3333', '#3A6B9F', '#6B4F3A']

const COLUMNS = [
  {
    label: 'Now',
    color: COLORS[0],
    tasks: [
      'Review Q2 budget proposal',
      'Call electrician about NEPA',
    ],
  },
  {
    label: 'Soon',
    color: COLORS[1],
    tasks: [
      'Send invoice to client',
      'Fix Figma export bug',
    ],
  },
  {
    label: 'Later',
    color: COLORS[2],
    tasks: [
      'Order tiles for kitchen',
      'Water tank maintenance',
    ],
  },
]

export function FlowScene() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current
      const card = cardRef.current
      const glow = glowRef.current
      if (!section || !card || !glow) return

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      })

      tl.fromTo(textRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        0
      )

      tl.fromTo(boardRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        0.2
      )

      gsap.set(card, { opacity: 0, scale: 1 })
      gsap.set(glow, { opacity: 0 })

      tl.to(card, { opacity: 1, duration: 0.3 }, 0.6)
        .to(card, { scale: 1.08, duration: 0.4, ease: 'power2.out' }, 0.65)
        .to(glow, { opacity: 1, scale: 1.2, duration: 0.4 }, 0.65)
        .to(card, { x: '92%', duration: 0.8, ease: 'power2.inOut' }, 1.1)
        .to(glow, { x: '92%', duration: 0.8, ease: 'power2.inOut' }, 1.1)
        .to(card, { scale: 0.95, opacity: 0, duration: 0.2 }, 1.9)
        .to(glow, { opacity: 0, duration: 0.2 }, 1.9)
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ paddingTop: '100px', paddingBottom: '100px' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(58,107,159,0.03) 0%, transparent 60%)',
        }}
      />

      <div ref={textRef} className="text-center max-w-3xl mb-16">
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-none"
          style={{ fontFamily: "var(--font-heading)", color: '#F0EDE8' }}
        >
          Operate across multiple initiatives
          <br />
          <span style={{ color: 'rgba(240, 237, 232, 0.5)' }}>without losing context.</span>
        </h2>
        <p
          className="mt-6 text-base sm:text-lg max-w-lg mx-auto leading-relaxed"
          style={{ color: 'rgba(240, 237, 232, 0.5)', fontFamily: "var(--font-body)" }}
        >
          Drag tasks between columns as priorities shift. Everything else waits its turn.
        </p>
      </div>

      <div ref={boardRef} className="w-full max-w-4xl landing-demo relative">
        <div className="demo-board">
          {COLUMNS.map((col, ci) => (
            <div key={col.label} className="demo-column" style={{ borderTop: `2px solid ${col.color}20` }}>
              <div className="demo-column-header">
                <span
                  style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: col.color, flexShrink: 0,
                  }}
                />
                <span className="demo-column-title">{col.label}</span>
                <span className="demo-column-count">{col.tasks.length}</span>
              </div>
              <div className="demo-column-body">
                {col.tasks.map((task, ti) => (
                  <div
                    key={task}
                    className="demo-task"
                    style={{ borderLeft: `2px solid ${col.color}20` }}
                  >
                    <div style={{ fontWeight: ti === 0 ? 500 : 400, fontSize: '0.72rem' }}>{task}</div>
                    <div className="demo-task-meta">
                      <span className="demo-task-dot" style={{ background: col.color, opacity: 0.3 }} />
                      <span className="demo-task-time">Just now</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          ref={glowRef}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, rgba(204,51,51,0.12) 0%, transparent 70%)',
            top: '50%',
            left: '18%',
            transform: 'translateY(-50%)',
          }}
        />

        <div
          ref={cardRef}
          className="absolute pointer-events-none"
          style={{
            top: '50%',
            left: '18%',
            transform: 'translateY(-50%)',
            width: 'clamp(120px, 20vw, 180px)',
          }}
        >
          <div
            className="demo-task"
            style={{
              borderLeft: '2px solid #CC3333',
              padding: '12px 14px',
            }}
          >
            <div style={{ fontWeight: 500, fontSize: '0.75rem' }}>Call electrician</div>
            <div className="demo-task-meta">
              <span className="demo-task-dot" style={{ background: '#CC3333', opacity: 0.6 }} />
              <span className="demo-task-time">Now moving...</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-12 text-center"
        style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(240,237,232,0.2)', letterSpacing: '0.05em' }}
      >
        Now &rarr; Soon &rarr; Later
      </div>
    </section>
  )
}
