import { useState } from 'react';

interface Props {
  open: boolean;
  onDone: () => void;
}

const STEPS = [
  { title: 'Welcome to the Board', body: 'Your brain is already full. That\'s what this board is for. Now, Soon, Later — three columns to pin the noise and find the signal.' },
  { title: 'Now. Soon. Later.', body: 'Now is burning. Soon is coming up. Later is distant but not forgotten. Drag tasks between columns as things change.' },
  { title: 'Time & Repeat', body: 'Set due dates, repeat weekly tasks, add checklists. The board works around your life — not the other way.' },
  { title: 'Find Anything', body: 'Search, filter by project, tag with keywords. Even with fifty tasks, you\'ll never lose one again.' },
];

export function OnboardingOverlay({ open, onDone }: Props) {
  const [step, setStep] = useState(0);

  if (!open) return null;
  const s = STEPS[step];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-steps">{STEPS.map((_, i) => <div key={i} className={`onboarding-dot ${i === step ? 'onboarding-dot--active' : ''} ${i < step ? 'onboarding-dot--done' : ''}`} />)}</div>
        <h2 className="onboarding-title">{s.title}</h2>
        <p className="onboarding-body">{s.body}</p>
        <div className="onboarding-actions">
          {step > 0 && <button className="onboarding-btn onboarding-btn--outline" onClick={() => setStep(s => s - 1)}>Back</button>}
          <div className="onboarding-spacer" />
          {step < STEPS.length - 1 ? (
            <button className="onboarding-btn" onClick={() => setStep(s => s + 1)}>Next</button>
          ) : (
            <button className="onboarding-btn" onClick={onDone}>Start sorting</button>
          )}
        </div>
      </div>
    </div>
  );
}
