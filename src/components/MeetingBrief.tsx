import type { MeetingBrief as MeetingBriefData } from '../api/liveMatch';

interface MeetingBriefProps {
  brief: MeetingBriefData;
  source: 'openai' | 'fallback';
  model: string | null;
}

export function MeetingBrief({ brief, source, model }: MeetingBriefProps) {
  return (
    <div className="card" style={{ marginTop: 12, gap: 8, padding: 16, animation: 'noct-rise .3s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div className="card-kicker">AI prep · 15 sec</div>
        <span className={source === 'openai' ? 'tag tag-accent' : 'tag tag-neutral'} style={{ fontSize: 8, padding: '2px 6px' }}>
          {source === 'openai' ? model ?? 'OpenAI' : 'Fallback brief'}
        </span>
      </div>
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
