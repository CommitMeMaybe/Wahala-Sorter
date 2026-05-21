import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function HandAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const handRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

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

      if (!handRef.current || !cardRef.current) return

      gsap.set(handRef.current, { x: '-120%', y: '20%', opacity: 0, rotation: 10 })
      gsap.set(cardRef.current, { opacity: 0 })

      // Phase 1: Hand enters from left, reaches for card
      tl.to(handRef.current, {
        x: '0%',
        y: '0%',
        opacity: 1,
        rotation: 0,
        duration: 0.25,
      })
      // Phase 2: Hand grabs card
      .to(cardRef.current, {
        opacity: 1,
        scale: 1.05,
        duration: 0.1,
      }, '-=0.05')
      // Phase 3: Hand lifts card and moves it right
      .to(handRef.current, {
        x: '105%',
        y: '-5%',
        rotation: -5,
        duration: 0.4,
      }, '+=0.1')
      .to(cardRef.current, {
        x: '105%',
        y: '-5%',
        rotation: -3,
        duration: 0.4,
      }, '-=0.4')
      // Phase 4: Hand releases and exits
      .to(cardRef.current, {
        opacity: 0,
        duration: 0.08,
      })
      .to(handRef.current, {
        x: '140%',
        y: '15%',
        opacity: 0,
        rotation: 15,
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
      {/* Hand */}
      <div
        ref={handRef}
        className="absolute"
        style={{
          left: '30%',
          top: '45%',
          width: '80px',
          height: '100px',
        }}
      >
        <svg viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          {/* Palm */}
          <path
            d="M38 96C44 96 52 92 56 86C60 80 62 72 62 66V44C62 40 60 38 57 38C54 38 52 40 52 44V34C52 30 50 28 47 28C44 28 42 30 42 34V28C42 24 40 22 37 22C34 22 32 24 32 28V38C32 34 30 32 27 32C24 32 22 34 22 38V50C22 44 20 42 17 42C14 42 12 44 12 50V68C12 78 18 96 38 96Z"
            fill="#F5E6C8"
            stroke="#2C1810"
            strokeWidth="1.5"
            className="drop-shadow"
          />
          {/* Thumb */}
          <path
            d="M32 38C32 34 34 30 37 28C40 26 44 28 44 32V38"
            fill="#F5E6C8"
            stroke="#2C1810"
            strokeWidth="1.5"
          />
          {/* Finger lines */}
          <path d="M42 28V22" stroke="#D4A017" strokeWidth="0.5" opacity="0.4" />
          <path d="M47 28V20" stroke="#D4A017" strokeWidth="0.5" opacity="0.4" />
          <path d="M52 34V24" stroke="#D4A017" strokeWidth="0.5" opacity="0.4" />
          <path d="M57 38V30" stroke="#D4A017" strokeWidth="0.5" opacity="0.4" />
          {/* Sleeve */}
          <path
            d="M30 94L26 74C26 74 34 70 48 72L52 94Z"
            fill="#3A2A1E"
            stroke="#2C1810"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Card being dragged */}
      <div
        ref={cardRef}
        className="absolute"
        style={{
          left: '30%',
          top: '45%',
          width: '100px',
          height: '36px',
          background: '#F5E6C8',
          border: '1px solid #D4A017',
          borderRadius: '2px',
          padding: '4px 8px',
          fontSize: '8px',
          color: '#2C1810',
          fontFamily: 'Sora, sans-serif',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 30,
        }}
      >
        <span className="pin pin--yellow" style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', width: '8px', height: '8px' }} />
        NEPA don go
      </div>
    </div>
  )
}
