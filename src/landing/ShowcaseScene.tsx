import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function ShowcaseScene() {
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
          gsap.fromTo(boardRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
          )
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
    <section ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 py-32">
      <h2
        ref={textRef}
        className="text-3xl sm:text-5xl md:text-6xl font-light tracking-tight text-[#F5E6C8] text-center opacity-0 translate-y-12 mb-12"
        style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      >
        One board.<br />
        <span className="text-[#E8D5A8]/60">Three pinned sections. Solved.</span>
      </h2>

      <div ref={boardRef} className="w-full max-w-4xl board-frame p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-[#F5E6C8]/10">
          <div className="flex items-center gap-3">
            <span className="pin pin--red" />
            <span className="text-xs text-[#F5E6C8]/50 tracking-wider uppercase font-mono">Wahala Sorter</span>
          </div>
          <span className="text-[10px] text-[#F5E6C8]/20 tracking-widest uppercase font-mono">Case File</span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {columns.map((col) => (
            <div key={col.label} className="bg-[#1A0F0A]/60 backdrop-blur-sm border border-[#F5E6C8]/10 p-4 min-h-[220px]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F5E6C8]/10">
                <span className="pin pin--red" style={{ width: '10px', height: '10px' }} />
                <span className="text-xs font-semibold text-[#F5E6C8] tracking-wider uppercase">{col.label}</span>
              </div>
              <div className="space-y-2">
                {col.items.map((item) => (
                  <div key={item.title} className="sticky-note text-xs" style={{ '--rot': `${(Math.random() - 0.5) * 1}deg`, padding: '10px 12px', color: '#2C1810' } as React.CSSProperties}>
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
            Pin &bull; Drag &bull; Solve
          </span>
        </div>
      </div>
    </section>
  )
}
