import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HandAnimation } from './HandAnimation'

gsap.registerPlugin(ScrollTrigger)

export function SortingScene() {
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

          if (boardRef.current) {
            const cols = boardRef.current.querySelectorAll('.evidence-col')
            gsap.fromTo(cols,
              { y: 60, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out', delay: 0.3 }
            )

            const notes = boardRef.current.querySelectorAll('.evidence-note')
            gsap.fromTo(notes,
              { x: gsap.utils.random(-60, 60), y: gsap.utils.random(-40, 40), opacity: 0, rotation: gsap.utils.random(-10, 10) },
              { x: 0, y: 0, opacity: 1, rotation: gsap.utils.random(-1.5, 1.5), duration: 0.5, stagger: 0.05, ease: 'back.out(1.5)', delay: 0.7 }
            )
          }
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const columns = [
    {
      label: 'Now', color: '#CC3333',
      tasks: ['Call electrician about NEPA', 'Buy cement from Mike\'s depot', 'Reply Mr. Adebayo'],
    },
    {
      label: 'Soon', color: '#3A6B9F',
      tasks: ['Pick up plumbing parts at Oyingbo', 'Send invoice to client', 'Fix Figma export'],
    },
    {
      label: 'Later', color: '#6B4F3A',
      tasks: ['Order tiles for kitchen', 'Pay generator mechanic', 'Water tank repair'],
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32"
      aria-labelledby="sorting-heading"
    >
      <h2
        id="sorting-heading"
        ref={textRef}
        className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-[#F5E6C8] text-center opacity-0 translate-y-12 mb-16"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Sort the evidence.<br />
        <span className="italic text-[#3A6B9F]">Close the case.</span>
      </h2>

      <div ref={boardRef} className="w-full max-w-4xl grid grid-cols-3 gap-3 sm:gap-4 px-4 relative">
        {columns.map((col, ci) => (
          <div
            key={col.label}
            className="evidence-col opacity-0"
            style={{ transform: `rotate(${(ci - 1) * 0.5}deg)` }}
            role="region"
            aria-label={`${col.label} column`}
          >
            <div className="border border-[#F5E6C8]/10 bg-[#1A0F0A]/40 backdrop-blur-sm p-4 min-h-[300px]">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#F5E6C8]/10">
                <span className="pin pin--red" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-[#F5E6C8] tracking-wider uppercase m-0" style={{ fontFamily: "var(--font-heading)" }}>
                  {col.label}
                </h3>
                <span className="ml-auto text-[10px] text-[#E8D5A8]/30 font-mono" aria-label={`${col.tasks.length} items`}>
                  {col.tasks.length}
                </span>
              </div>
              <div className="space-y-3">
                {col.tasks.map((task) => (
                  <div
                    key={task}
                    className="evidence-note sticky-note text-xs sm:text-sm"
                    style={{
                      '--rot': `${(Math.random() - 0.5) * 1.5}deg`,
                      padding: '10px 12px',
                    } as React.CSSProperties}
                    role="listitem"
                  >
                    <span
                      className="pin pin--yellow"
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '12px',
                        height: '12px',
                      }}
                      aria-hidden="true"
                    />
                    <span className="relative z-10">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <HandAnimation />
      </div>
    </section>
  )
}
