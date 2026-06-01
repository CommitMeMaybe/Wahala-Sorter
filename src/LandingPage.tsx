import { useRef, useEffect, useState } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCursorReactive, type CursorConfig } from './hooks/useCursorReactive'

gsap.registerPlugin(ScrollTrigger)

const SECTIONS: { name: string; cursor: Partial<CursorConfig> }[] = [
  {
    name: 'hero',
    cursor: { intensity: 0.08, glowRadius: 200, parallaxStrength: 0.05, easing: 0.1, colorAccent: '#E8780C', blendMode: 'soft-light', enableNoise: true, noiseOpacity: 0.04 },
  },
  {
    name: 'mockup',
    cursor: { intensity: 0.04, glowRadius: 140, parallaxStrength: 0.02, easing: 0.12, colorAccent: '#FBF3E8', blendMode: 'soft-light', enableNoise: false, noiseOpacity: 0 },
  },
  {
    name: 'features',
    cursor: { intensity: 0.05, glowRadius: 160, parallaxStrength: 0.03, easing: 0.1, colorAccent: '#E8780C', blendMode: 'soft-light', enableNoise: true, noiseOpacity: 0.03 },
  },
  {
    name: 'columns',
    cursor: { intensity: 0.04, glowRadius: 140, parallaxStrength: 0.02, easing: 0.12, colorAccent: '#FBF3E8', blendMode: 'soft-light', enableNoise: false, noiseOpacity: 0 },
  },
  {
    name: 'social',
    cursor: { intensity: 0.03, glowRadius: 120, parallaxStrength: 0.02, easing: 0.14, colorAccent: '#E8780C', blendMode: 'soft-light', enableNoise: false, noiseOpacity: 0 },
  },
  {
    name: 'cta',
    cursor: { intensity: 0.02, glowRadius: 100, parallaxStrength: 0.01, easing: 0.15, colorAccent: '#1A0F0A', blendMode: 'soft-light', enableNoise: false, noiseOpacity: 0 },
  },
]

function Section({ children, className, cursor, style, ...rest }: {
  children: React.ReactNode; className?: string; cursor: Partial<CursorConfig>; style?: React.CSSProperties; [key: string]: any
}) {
  const { ref } = useCursorReactive<HTMLDivElement>(cursor)
  return (
    <div ref={ref} className={`lp-section ${className || ''}`} style={style} {...rest}>
      <div className="lp-spotlight" />
      {cursor.enableNoise && <div className="lp-noise" />}
      {children}
    </div>
  )
}

const TASKS_DATA = [
  { col: 'Now', count: 3, color: '#F5A040', tasks: [
    { title: 'Reply to that client email from yesterday', tag: 'Urgent', tagClass: 'tag-urgent' },
    { title: 'Fix the checkout bug in production', tag: 'Work', tagClass: 'tag-work' },
    { title: 'Pay electricity bill — last notice', tag: 'Life', tagClass: 'tag-life' },
  ]},
  { col: 'Soon', count: 2, color: '#B89070', tasks: [
    { title: 'Write the weekly team update', tag: 'Work', tagClass: 'tag-work' },
    { title: 'Grocery run — running low on everything', tag: 'Life', tagClass: 'tag-life' },
  ]},
  { col: 'Later', count: 3, color: '#6A5040', tasks: [
    { title: 'Redesign the personal portfolio', tag: 'Someday', tagClass: 'tag-later' },
    { title: 'Read that book on sleep hygiene', tag: 'Someday', tagClass: 'tag-later' },
    { title: 'Learn how to cook jollof properly', tag: 'Someday', tagClass: 'tag-later' },
  ]},
]

const FEATURES = [
  { icon: '⟳', name: 'Drag & Drop', desc: 'Grab any task and drop it into the right column. Priorities shift — your board should too, in a single motion.' },
  { icon: '≡', name: 'Three Lanes Only', desc: 'Now, Soon, Later. No sub-tasks, no statuses, no rabbit holes. The constraint is the feature.' },
  { icon: '◎', name: 'Zero Distraction UI', desc: 'Dark, warm, focused. The interface disappears so your thinking can take over.' },
  { icon: '↯', name: 'Instant to Start', desc: 'No account. No onboarding wizard. No subscription wall. Open the link and sort your first wahala in under 10 seconds.' },
  { icon: '⊕', name: 'Nigerian at Heart', desc: 'Wahala isn\'t just a name. It\'s a mindset — built for the kind of organised chaos that West African hustle demands.' },
  { icon: '◈', name: 'Works on Any Device', desc: 'Responsive by design. Whether you\'re at a desk or on the go, your board moves with you.' },
]

const COLUMN_BLOCKS = [
  { num: '01', title: 'Now', subtitle: 'Do it today', body: 'The things that truly need your attention right now. Urgent, time-sensitive, can\'t wait.', pill: 'High Priority', pillClass: 'pill-red' },
  { num: '02', title: 'Soon', subtitle: 'This week\'s work', body: 'Important but not screaming for attention. These belong on your radar without cluttering your immediate focus.', pill: 'Medium Priority', pillClass: 'pill-amber' },
  { num: '03', title: 'Later', subtitle: 'Someday maybe', body: 'Ideas, goals, things you don\'t want to forget but don\'t need to act on yet. Parked, not forgotten.', pill: 'Low Priority', pillClass: 'pill-green' },
]

export function LandingPage({ onEnterApp }: { onEnterApp: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    })

    lenis.on('scroll', (e: { progress: number }) => {
      setProgress(Math.max(0, Math.min(1, e.progress)))
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      SECTIONS.forEach(({ name }) => {
        const el = document.querySelector(`[data-section="${name}"]`)
        if (!el) return
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 40%', toggleActions: 'play none none reverse' },
          }
        )

        const inner = el.querySelector('.lp-content')
        if (inner) {
          gsap.fromTo(inner,
            { y: 30, opacity: 0 },
            {
              y: 0, opacity: 1, duration: 1, ease: 'power2.out', delay: 0.15,
              scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 40%', toggleActions: 'play none none reverse' },
            }
          )
        }
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef}>
      <div className="lp-progress-bar">
        <div className="lp-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <Section cursor={SECTIONS[0].cursor} className="lp-hero" data-section="hero">
        <div className="lp-grid-bg" />
        <nav className="lp-nav">
          <div className="lp-logo">Wahala<span>Sorter</span></div>
          <div className="lp-badge">Priority Board</div>
        </nav>
        <div className="lp-hero-body">
          <div className="lp-eyebrow">
            <span className="lp-eyebrow-line" />
            Stop drowning in to-dos
            <span className="lp-eyebrow-line" />
          </div>
          <h1 className="lp-headline">Sort your<span className="lp-accent">wahala.</span></h1>
          <p className="lp-hero-sub">A priority board that cuts through the noise. Drag your tasks into <strong>Now, Soon,</strong> or <strong>Later</strong> — and actually know what to do next.</p>
          <div className="lp-ctas">
            <a href="https://wahalasorter1.vercel.app/#/app" className="lp-btn-primary" onClick={(e) => { e.preventDefault(); onEnterApp() }}>Open the Board →</a>
          </div>
        </div>
        <div className="lp-scroll-hint">
          <span className="lp-scroll-line" />
          <span className="lp-scroll-text">scroll</span>
          <span className="lp-scroll-line" />
        </div>
      </Section>

      <div className="lp-divider" />

      <Section cursor={SECTIONS[1].cursor} className="lp-mockup" data-section="mockup">
        <div className="lp-content">
          <div className="lp-section-label">The Interface</div>
          <h2 className="lp-section-title">Every wahala in its lane.</h2>
          <div className="lp-app-frame">
            <div className="lp-app-bar">
              <span className="lp-dot lp-dot-r" /><span className="lp-dot lp-dot-y" /><span className="lp-dot lp-dot-g" />
              <span className="lp-app-bar-title">wahalasorter1.vercel.app — Priority Board</span>
            </div>
            <div className="lp-app-board">
              {TASKS_DATA.map(col => (
                <div key={col.col} className={`lp-col lp-col-${col.col.toLowerCase()}`}>
                  <div className="lp-col-header">
                    <span>{col.col}</span>
                    <span className="lp-col-count">{col.count}</span>
                  </div>
                  {col.tasks.map(task => (
                    <div key={task.title} className="lp-task-card">
                      <div className="lp-task-title">{task.title}</div>
                      <span className={`lp-task-tag ${task.tagClass}`}>{task.tag}</span>
                    </div>
                  ))}
                  <button className="lp-add-btn">+ Add task</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <div className="lp-divider" />

      <Section cursor={SECTIONS[2].cursor} className="lp-features" data-section="features">
        <div className="lp-content">
          <div className="lp-section-header">
            <div className="lp-section-label lp-label-dark">Why it works</div>
            <h2 className="lp-features-headline">Built for clarity, not complexity.</h2>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map(f => (
              <div key={f.name} className="lp-feature-tile" data-hover>
                <div className="lp-feature-icon"><span>{f.icon}</span></div>
                <div className="lp-feature-name">{f.name}</div>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="lp-divider" />

      <Section cursor={SECTIONS[3].cursor} className="lp-columns" data-section="columns">
        <div className="lp-content lp-columns-inner">
          <div className="lp-section-header lp-columns-header">
            <div className="lp-section-label">The System</div>
            <h2 className="lp-columns-headline">Three columns.<br /><em>One clear head.</em></h2>
          </div>
          <div className="lp-three-cols">
            {COLUMN_BLOCKS.map(b => (
              <div key={b.num} className="lp-col-block">
                <div className="lp-col-number">{b.num}</div>
                <div className="lp-col-title">{b.title}</div>
                <div className="lp-col-subtitle">{b.subtitle}</div>
                <p className="lp-col-body">{b.body}</p>
                <span className={`lp-col-pill ${b.pillClass}`}>{b.pill}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <div className="lp-divider" />

      <Section cursor={SECTIONS[4].cursor} className="lp-social" data-section="social">
        <div className="lp-content">
          <div className="lp-section-header">
            <div className="lp-section-label lp-label-dark">Social & Campaign Assets</div>
            <h2 className="lp-social-headline">Ready to share.</h2>
          </div>
          <div className="lp-social-grid">
            <div className="lp-tweet-card">
              <div className="lp-tweet-header">
                <div className="lp-tweet-avatar">WS</div>
                <div>
                  <div className="lp-tweet-name">Wahala Sorter</div>
                  <div className="lp-tweet-handle">@wahalasorter</div>
                </div>
              </div>
              <p className="lp-tweet-body">Stop writing to-do lists that stress you out more than the tasks themselves.<br /><br /><strong>Now. Soon. Later.</strong><br /><br />That's it. That's the whole system. Sort your wahala at wahalasorter1.vercel.app 🔥</p>
              <div className="lp-tweet-meta"><span>♥ 2.4K</span><span>↺ 841</span><span>💬 312</span></div>
            </div>
            <div className="lp-ig-card">
              <div className="lp-ig-bg-number">3</div>
              <div className="lp-ig-top">
                <div className="lp-ig-eyebrow">Productivity · Free Tool</div>
                <div className="lp-ig-quote">Stop overthinking.<br />Sort your<br />wahala.</div>
              </div>
              <div className="lp-ig-bottom">
                <div className="lp-ig-source">wahalasorter1.vercel.app</div>
                <div className="lp-ig-logo">WS</div>
              </div>
            </div>
            <div className="lp-tagline-card">
              <div className="lp-tagline-overline">The priority board that just works</div>
              <div className="lp-tagline-text">No logins. No fluff.<br />Just results.</div>
              <div className="lp-tagline-sub">Open. Add tasks. Drag them to Now, Soon, or Later. Done. Your most productive day starts here.</div>
            </div>
            <div className="lp-tweet-card">
              <div className="lp-tweet-header">
                <div className="lp-tweet-avatar">👤</div>
                <div>
                  <div className="lp-tweet-name">Temi Adeyemi</div>
                  <div className="lp-tweet-handle">@temidevelops</div>
                </div>
              </div>
              <p className="lp-tweet-body">I've tried Notion, Trello, Asana, Linear, plain notes...<br /><br />Nothing came close to <strong>@wahalasorter</strong> for actually knowing what to do first.<br /><br />The constraint is the genius.</p>
              <div className="lp-tweet-meta"><span>♥ 5.1K</span><span>↺ 1.2K</span><span>💬 479</span></div>
            </div>
            <div className="lp-behance-card">
              <div className="lp-behance-left">
                <div className="lp-behance-title">Wahala Sorter — Priority Board</div>
                <div className="lp-behance-tags">
                  <span className="lp-btag">UI Design</span>
                  <span className="lp-btag">Product</span>
                  <span className="lp-btag">Web App</span>
                  <span className="lp-btag">African Tech</span>
                </div>
                <p className="lp-behance-desc">Wahala Sorter is a focused, no-account priority board built for clarity. Three columns, drag-and-drop, dark warm palette. Nothing more, nothing less. Built to help you cut through the noise and surface what actually matters today.</p>
              </div>
              <div className="lp-behance-right">
                <div className="lp-behance-stats">
                  <div><div className="lp-b-stat-val">3</div><div className="lp-b-stat-sep" /><div className="lp-b-stat-label">Columns</div></div>
                  <div><div className="lp-b-stat-val">0</div><div className="lp-b-stat-sep" /><div className="lp-b-stat-label">Accounts needed</div></div>
                  <div><div className="lp-b-stat-val">∞</div><div className="lp-b-stat-sep" /><div className="lp-b-stat-label">Wahala sorted</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <div className="lp-divider" />

      <Section cursor={SECTIONS[5].cursor} className="lp-cta" data-section="cta">
        <div className="lp-eyebrow lp-cta-eyebrow">Free. No sign-up. Always.</div>
        <h2 className="lp-cta-headline">Your wahala<br />won't sort itself.</h2>
        <p className="lp-cta-sub">Open the board, add your first task, and move it to Now. Takes 30 seconds. Changes how your whole day feels.</p>
        <button className="lp-btn-dark" onClick={onEnterApp}>Sort Your Wahala →</button>
        <div className="lp-cta-url">wahalasorter1.vercel.app</div>
      </Section>

      <footer className="lp-footer">
        <div className="lp-footer-logo">Wahala<span>Sorter</span></div>
        <div className="lp-footer-copy">Drag · Drop · Done. — Priority Board for Real Life</div>
      </footer>
    </div>
  )
}
