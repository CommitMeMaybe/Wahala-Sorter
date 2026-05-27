import { useEffect, useRef } from 'react';

interface Props {
  active: boolean;
}

const COLORS = ['#CC3333', '#D4A017', '#3A6B9F', '#F5E6C8', '#6B4F3A'];

interface Particle {
  x: number; y: number; vx: number; vy: number; size: number; color: string; life: number; maxLife: number;
}

export function Confetti({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!active) { particlesRef.current = []; return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    for (let i = 0; i < 80; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 6,
        vy: 2 + Math.random() * 4,
        size: 4 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife: 80 + Math.random() * 60,
      });
    }

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.life < p.maxLife);
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.vy += 0.1;
        p.y += p.vy;
        p.life++;
        ctx.globalAlpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size * 0.6);
      }
      ctx.globalAlpha = 1;
      if (particlesRef.current.length) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  if (!active) return null;
  return <canvas ref={canvasRef} className="confetti-canvas" />;
}
