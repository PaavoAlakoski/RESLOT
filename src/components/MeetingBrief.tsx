import type { MeetingBrief as MeetingBriefData } from '../api/liveMatch';

interface MeetingBriefProps {
  brief: MeetingBriefData;
}

export function MeetingBrief({ brief }: MeetingBriefProps) {
  return (
    <div className="card" style={{ marginTop: 12, gap: 8, padding: 16, animation: 'noct-rise .3s ease both' }}>
      <div className="card-kicker">AI prep · 15 sec</div>
      <p className="card-body" style={{ margin: 0 }}><strong>Why:</strong> {brief.why}</p>
      <p className="card-body" style={{ margin: 0 }}><strong>Focus:</strong> {brief.focus}</p>
      <p className="card-body" style={{ margin: 0 }}><strong>Validate:</strong> {brief.concern}</p>
      <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: 8 }}>
        <div className="card-kicker" style={{ marginBottom: 4 }}>Open with</div>
        <p className="card-body" style={{ margin: 0, color: 'var(--color-accent-300)' }}>“{brief.opener}”</p>
      </div>
    </div>
  );
}
