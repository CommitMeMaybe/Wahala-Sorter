import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function HandAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const handRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const liftGlowRef = useRef<HTMLDivElement>(null)
  const tapBurstRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 60%',
          end: 'bottom 40%',
          scrub: 1.5,
        },
        defaults: { ease: 'power2.inOut' },
      })

      if (!handRef.current || !cardRef.current || !liftGlowRef.current || !tapBurstRef.current) return

      gsap.set(handRef.current, { x: '0%', y: '-80%', opacity: 0, rotation: -5 })
      gsap.set(cardRef.current, { opacity: 0, scale: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' })
      gsap.set(liftGlowRef.current, { opacity: 0, scale: 0.8 })
      gsap.set(tapBurstRef.current, { opacity: 0, scale: 0 })

      // Phase 1: Hand enters from above
      tl.to(handRef.current, {
        y: '0%',
        opacity: 1,
        rotation: 0,
        duration: 0.2,
      })
      // Phase 2: Hand presses down (long-press) — card lifts
      .to(cardRef.current, {
        opacity: 1,
        duration: 0.05,
      }, '-=0.05')
      .to(liftGlowRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
      }, '-=0.1')
      .to(cardRef.current, {
        scale: 1.12,
        boxShadow: '0 12px 40px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.2)',
        duration: 0.25,
        ease: 'back.out(1.5)',
      }, '-=0.15')
      .to(handRef.current, {
        y: '-6%',
        duration: 0.15,
      }, '-=0.1')
      // Phase 3: Hand + card slide right to next column
      .to(handRef.current, {
        x: '90%',
        y: '-8%',
        rotation: -3,
        duration: 0.35,
      }, '+=0.15')
      .to(cardRef.current, {
        x: '90%',
        y: '-8%',
        scale: 1.08,
        duration: 0.35,
      }, '-=0.35')
      // Phase 4: Tap-burst at destination, card releases
      .to(tapBurstRef.current, {
        opacity: 1,
        scale: 1.5,
        duration: 0.12,
      })
      .to(cardRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.1,
      }, '-=0.1')
      .to(tapBurstRef.current, {
        opacity: 0,
        duration: 0.1,
      })
      .to(liftGlowRef.current, {
        opacity: 0,
        duration: 0.05,
      }, '-=0.05')
      // Phase 5: Hand exits right
      .to(handRef.current, {
        x: '130%',
        y: '10%',
        opacity: 0,
        rotation: 8,
        duration: 0.15,
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {/* Lift glow behind card */}
      <div
        ref={liftGlowRef}
        className="absolute rounded-full"
        style={{
          left: 'calc(30% + 50px - 30px)',
          top: 'calc(45% + 18px - 30px)',
          width: '60px',
          height: '60px',
          background: 'radial-gradient(circle, rgba(212,160,23,0.25) 0%, transparent 70%)',
          zIndex: 25,
          pointerEvents: 'none',
        }}
      />

      {/* Hand */}
      <div
        ref={handRef}
        className="absolute"
        style={{
          left: '30%',
          top: '45%',
          width: 'clamp(50px, 8vw, 80px)',
          height: 'clamp(62px, 10vw, 100px)',
        }}
      >
        <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          <path
            d="M38 96C44 96 52 92 56 86C60 80 62 72 62 66V44C62 40 60 38 57 38C54 38 52 40 52 44V34C52 30 50 28 47 28C44 28 42 30 42 34V28C42 24 40 22 37 22C34 22 32 24 32 28V38C32 34 30 32 27 32C24 32 22 34 22 38V50C22 44 20 42 17 42C14 42 12 44 12 50V68C12 78 18 96 38 96Z"
            fill="#F5E6C8"
            stroke="#2C1810"
            strokeWidth="1.5"
            className="drop-shadow"
          />
          <path
            d="M32 38C32 34 34 30 37 28C40 26 44 28 44 32V38"
            fill="#F5E6C8"
            stroke="#2C1810"
            strokeWidth="1.5"
          />
          <path d="M42 28V22" stroke="#D4A017" strokeWidth="0.5" opacity="0.4" />
          <path d="M47 28V20" stroke="#D4A017" strokeWidth="0.5" opacity="0.4" />
          <path d="M52 34V24" stroke="#D4A017" strokeWidth="0.5" opacity="0.4" />
          <path d="M57 38V30" stroke="#D4A017" strokeWidth="0.5" opacity="0.4" />
          <path
            d="M30 94L26 74C26 74 34 70 48 72L52 94Z"
            fill="#3A2A1E"
            stroke="#2C1810"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Card being long-pressed and moved */}
      <div
        ref={cardRef}
        className="absolute flex items-center justify-center"
        style={{
          left: '30%',
          top: '45%',
          width: 'clamp(70px, 12vw, 100px)',
          height: 'clamp(28px, 4.5vw, 36px)',
          background: '#F5E6C8',
          border: '1px solid #D4A017',
          borderRadius: '2px',
          padding: '4px 8px',
          fontSize: 'clamp(6px, 1vw, 8px)',
          color: '#2C1810',
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          zIndex: 30,
        }}
      >
        <span className="pin pin--yellow" style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px' }} />
        NEPA don go
      </div>

      {/* Tap burst indicator at destination */}
      <div
        ref={tapBurstRef}
        className="absolute rounded-full"
        style={{
          left: 'calc(30% + 90% - 15px)',
          top: 'calc(45% - 8% + 18px - 15px)',
          width: '30px',
          height: '30px',
          border: '3px solid #D4A017',
          zIndex: 35,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
