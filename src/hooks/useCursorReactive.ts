import { useRef, useEffect, useCallback } from 'react'

export interface CursorConfig {
  intensity: number
  glowRadius: number
  parallaxStrength: number
  enableNoise: boolean
  noiseOpacity: number
  activationMode: 'viewport' | 'always'
  easing: number
  colorAccent: string
  blendMode: string
}

const DEFAULT_CONFIG: CursorConfig = {
  intensity: 0.05,
  glowRadius: 120,
  parallaxStrength: 0.03,
  enableNoise: true,
  noiseOpacity: 0.04,
  activationMode: 'viewport',
  easing: 0.12,
  colorAccent: '#ffffff',
  blendMode: 'soft-light',
}

let supportsTouch = false
if (typeof window !== 'undefined') {
  supportsTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

let prefersReduced = false
if (typeof window !== 'undefined') {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReduced = mq.matches
  mq.addEventListener('change', (e) => { prefersReduced = e.matches })
}

let lowPerf = false
if (typeof window !== 'undefined' && 'navigator' in window) {
  const conn = (navigator as any).connection
  if (conn) {
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') lowPerf = true
  }
}

export function useCursorReactive<T extends HTMLElement>(config?: Partial<CursorConfig>) {
  const ref = useRef<T>(null)
  const cfg = { ...DEFAULT_CONFIG, ...config }

  const pos = useRef({ x: 0.5, y: 0.5 })
  const target = useRef({ x: 0.5, y: 0.5 })
  const activeRef = useRef(false)

  const handleMouse = useCallback((e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    target.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
    if (!activeRef.current) activeRef.current = true
  }, [])

  const handleLeave = useCallback(() => {
    activeRef.current = false
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (supportsTouch || prefersReduced || lowPerf) {
      el.style.setProperty('--cursor-active', '0')
      return
    }

    el.addEventListener('mousemove', handleMouse)
    el.addEventListener('mouseleave', handleLeave)

    if (cfg.activationMode === 'always') {
      activeRef.current = true
    }

    let raf: number
    const tick = () => {
      const ease = cfg.easing
      pos.current.x += (target.current.x - pos.current.x) * ease
      pos.current.y += (target.current.y - pos.current.y) * ease

      const p = pos.current

      if (el) {
        el.style.setProperty('--mx', String(p.x))
        el.style.setProperty('--my', String(p.y))
        el.style.setProperty('--glow-x', `${p.x * 100}%`)
        el.style.setProperty('--glow-y', `${p.y * 100}%`)
        el.style.setProperty('--cursor-active', activeRef.current ? '1' : '0')
        el.style.setProperty('--parallax-x', `${(p.x - 0.5) * cfg.parallaxStrength * 100}px`)
        el.style.setProperty('--parallax-y', `${(p.y - 0.5) * cfg.parallaxStrength * 100}px`)
        el.style.setProperty('--spotlight-radius', `${cfg.glowRadius}px`)
        el.style.setProperty('--spotlight-color', cfg.colorAccent)
        el.style.setProperty('--spotlight-blend', cfg.blendMode)
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      el.removeEventListener('mousemove', handleMouse)
      el.removeEventListener('mouseleave', handleLeave)
      cancelAnimationFrame(raf)
    }
  }, [handleMouse, handleLeave, cfg.easing, cfg.parallaxStrength, cfg.glowRadius, cfg.colorAccent, cfg.blendMode, cfg.activationMode])

  return { ref }
}
