import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

const COLORS = ['#CC3333', '#3A6B9F', '#6B4F3A']

const COLUMNS = [
  {
    label: 'Now',
    tasks: [
      'Review Q2 budget proposal',
      'Call electrician about NEPA',
      'Reply to Mr. Adebayo',
      'Submit weekly report',
    ],
    color: COLORS[0],
  },
  {
    label: 'Soon',
    tasks: [
      'Pick up parts at Oyingbo',
      'Send invoice to client',
      'Fix Figma export bug',
    ],
    color: COLORS[1],
  },
  {
    label: 'Later',
    tasks: [
      'Order tiles for kitchen',
      'Pay generator mechanic',
      'Water tank maintenance',
    ],
    color: COLORS[2],
  },
]

const TASK_TIMES = ['2m ago', '15m ago', '1h ago', '3h ago', '5h ago']

export function IntroScene() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        0
      )
      tl.fromTo(boardRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' },
        0.3
      )

      gsap.to(scrollRef.current, {
        opacity: 0.2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
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
          background: 'radial-gradient(ellipse at 50% 30%, rgba(204,51,51,0.03) 0%, transparent 60%)',
        }}
      />

      <div ref={textRef} className="text-center max-w-3xl mb-16">
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-light tracking-tight leading-none"
          style={{ fontFamily: "var(--font-heading)", color: '#F0EDE8' }}
        >
          Understand what matters
          <br />
          <span style={{ color: 'rgba(240, 237, 232, 0.5)' }}>before it becomes a problem.</span>
        </h1>
        <p
          className="mt-6 text-base sm:text-lg max-w-lg mx-auto leading-relaxed"
          style={{ color: 'rgba(240, 237, 232, 0.5)', fontFamily: "var(--font-body)" }}
        >
          A priority board that surfaces what needs your attention. Three columns. No noise.
        </p>
      </div>

      <div ref={boardRef} className="w-full max-w-4xl landing-demo">
        <div className="flex items-center gap-3 mb-4 px-1">
          <span className="demo-activity">
            <span className="demo-activity-dot" />
            All systems operational
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: 'rgba(240,237,232,0.2)', fontFamily: 'var(--font-body)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
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
                    style={{
                      borderLeft: `2px solid ${col.color}${ti === 0 ? '40' : '15'}`,
                    }}
                  >
                    <div style={{ fontWeight: ti === 0 ? 500 : 400 }}>{task}</div>
                    <div className="demo-task-meta">
                      <span className="demo-task-dot" style={{ background: col.color, opacity: ti === 0 ? 0.6 : 0.2 }} />
                      <span className="demo-task-time">{TASK_TIMES[(ci * col.tasks.length + ti) % TASK_TIMES.length]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="demo-scroll" style={{ marginTop: '80px' }}>
        <span style={{ fontSize: '10px', color: 'rgba(240,237,232,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-body)' }}>
          Scroll
        </span>
        <div className="demo-scroll-line" />
      </div>
    </section>
  )
}
