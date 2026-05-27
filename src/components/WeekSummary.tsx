interface Props {
  weekStart: string;
  completed: number;
  added: number;
  streaks: number;
}

export function WeekSummaryCard({ weekStart, completed, added, streaks }: Props) {
  return (
    <div className="week-card">
      <div className="week-card-header">Week of {weekStart}</div>
      <div className="week-card-stats">
        <div className="week-stat"><span className="week-stat-value">{completed}</span><span className="week-stat-label">done</span></div>
        <div className="week-stat"><span className="week-stat-value">{added}</span><span className="week-stat-label">added</span></div>
        {streaks > 0 && <div className="week-stat"><span className="week-stat-value">{streaks}</span><span className="week-stat-label">day streak</span></div>}
      </div>
    </div>
  );
}
