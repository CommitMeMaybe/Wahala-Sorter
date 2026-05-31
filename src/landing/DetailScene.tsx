import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

export function DetailScene() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const subtaskRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)
  const tagRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const section = sectionRef.current
      if (!section) return

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
      tl.fromTo(visualRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        0.2
      )
      tl.fromTo(subtaskRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        0.6
      )
      tl.fromTo(dateRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        0.75
      )
      tl.fromTo(tagRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        0.9
      )
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
          background: 'radial-gradient(ellipse at 50% 60%, rgba(107,79,58,0.03) 0%, transparent 60%)',
        }}
      />

      <div ref={textRef} className="text-center max-w-3xl mb-16">
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-none"
          style={{ fontFamily: "var(--font-heading)", color: '#F0EDE8' }}
        >
          Every detail has its place.
        </h2>
        <p
          className="mt-6 text-base sm:text-lg max-w-lg mx-auto leading-relaxed"
          style={{ color: 'rgba(240, 237, 232, 0.5)', fontFamily: "var(--font-body)" }}
        >
          Dates, recurrence, subtasks, notes — all inline. Nothing hidden in menus.
        </p>
      </div>

      <div ref={visualRef} className="w-full max-w-2xl landing-demo">
        <div className="demo-detail">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 500, color: '#F0EDE8', marginBottom: '4px', fontFamily: 'var(--font-heading)' }}>
              Review Q2 budget proposal
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(240,237,232,0.3)', fontFamily: 'var(--font-body)' }}>
              15m ago &middot; Now column
            </div>
          </div>

          <div ref={subtaskRef}>
            <div className="demo-detail-row">
              <span className="demo-detail-label">Subtasks</span>
              <div style={{ flex: 1 }}>
                {['Gather Q2 revenue data', 'Compile expense report'].map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 0', fontSize: '0.72rem', color: 'rgba(240,237,232,0.55)', fontFamily: 'var(--font-body)' }}>
                    <span style={{ width: '14px', height: '14px', borderRadius: '3px', border: '1.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {i === 0 && <span style={{ width: '6px', height: '6px', borderRadius: '1px', background: '#CC3333' }} />}
                    </span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div ref={dateRef}>
            <div className="demo-detail-row">
              <span className="demo-detail-label">Due date</span>
              <span className="demo-detail-value">May 31, 2026</span>
            </div>
            <div className="demo-detail-row" style={{ borderBottom: 'none' }}>
              <span className="demo-detail-label">Repeats</span>
              <span className="demo-detail-value">Weekly</span>
            </div>
          </div>

          <div ref={tagRef} style={{ paddingTop: '12px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(240,237,232,0.3)', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>
              Tags
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['Finance', 'Q2', 'Budget'].map(t => (
                <span key={t} className="demo-chip" style={{ borderColor: t === 'Finance' ? '#CC3333' : 'rgba(255,255,255,0.1)', color: t === 'Finance' ? '#CC3333' : 'rgba(240,237,232,0.5)' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '16px', marginTop: '12px' }}>
            <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(240,237,232,0.3)', marginBottom: '6px', fontFamily: 'var(--font-body)' }}>
              Notes
            </div>
            <div
              style={{
                fontSize: '0.72rem', color: 'rgba(240,237,232,0.4)', fontFamily: 'var(--font-body)',
                padding: '10px 12px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
              }}
            >
              Waiting for final numbers from accounting before presenting to the board.
            </div>
          </div>
        </div>
      </div>

      <div
        className="mt-12 text-center"
        style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(240,237,232,0.2)', letterSpacing: '0.05em' }}
      >
        Add context without leaving the board
      </div>
    </section>
  )
}
