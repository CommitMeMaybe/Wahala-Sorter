import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

export function FinalScene({ onEnterApp }: { onEnterApp: () => void }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

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
      tl.fromTo(btnRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        0.4
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ paddingTop: '80px', paddingBottom: '80px' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(204,51,51,0.04) 0%, transparent 60%)',
        }}
      />

      <div ref={textRef} className="text-center max-w-2xl">
        <h2
          className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight leading-none"
          style={{ fontFamily: "var(--font-heading)", color: '#F0EDE8' }}
        >
          Put the weight down.
          <br />
          <span style={{ color: 'rgba(240, 237, 232, 0.4)' }}>Pick up your peace.</span>
        </h2>
        <p
          className="mt-6 text-base sm:text-lg max-w-md mx-auto leading-relaxed"
          style={{ color: 'rgba(240, 237, 232, 0.4)', fontFamily: "var(--font-body)" }}
        >
          Three columns. No accounts. No setup. Just what needs your attention.
        </p>

        <button
          ref={btnRef}
          onClick={onEnterApp}
          style={{
            marginTop: '48px',
            padding: '16px 40px',
            background: '#CC3333',
            color: '#F0EDE8',
            border: 'none',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background 0.3s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#AA2222')}
          onMouseLeave={e => (e.currentTarget.style.background = '#CC3333')}
        >
          Start sorting
        </button>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          fontSize: '10px',
          color: 'rgba(240, 237, 232, 0.1)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-body)',
        }}
      >
        Free. No sign-up. Just sort.
      </div>
    </section>
  )
}
