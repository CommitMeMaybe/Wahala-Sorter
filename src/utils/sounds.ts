let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch { /* audio not available */ }
}

export function playTaskComplete() {
  const c = getCtx();
  const now = c.currentTime;
  [523, 659, 784].forEach((f, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f, now + i * 0.1);
    gain.gain.setValueAtTime(0.15, now + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now + i * 0.1);
    osc.stop(now + i * 0.1 + 0.3);
  });
}

export function playTaskDelete() {
  playTone(400, 0.2, 'sawtooth', 0.08);
  setTimeout(() => playTone(300, 0.25, 'sawtooth', 0.06), 80);
}

export function playTaskMove() {
  playTone(660, 0.1, 'sine', 0.1);
}

export function playTaskAdd() {
  playTone(440, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(550, 0.08, 'sine', 0.08), 60);
}
