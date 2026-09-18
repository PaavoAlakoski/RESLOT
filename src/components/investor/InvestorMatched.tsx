import type { Meeting } from '../../api/liveMatch';
import { MeetingBrief } from '../MeetingBrief';

interface InvestorMatchedProps {
  clock: string;
  iProfile: boolean;
  iProfileLabel: string;
  toggleIProfile: () => void;
  meeting: Meeting | null;
}

export function InvestorMatched({ clock, iProfile, iProfileLabel, toggleIProfile, meeting }: InvestorMatchedProps) {
  if (!meeting) return null;

  const endMinute = Number(meeting.slot.split(':')[1]) + meeting.durationMinutes;
  const endTime = `${meeting.slot.split(':')[0]}:${String(endMinute).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', animation: 'noct-rise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <span className="tag tag-accent">Meeting confirmed</span>
        <span style={{ fontSize: 11, color: 'color-mix(in srgb, #e9e9ed 50%, transparent)' }}>in {clock}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <span style={{ width: 62, height: 62, flex: 'none', borderRadius: '50%', background: 'var(--color-accent-800)', color: 'var(--color-accent-100)', display: 'grid', placeItems: 'center', fontSize: 20, fontFamily: 'var(--font-heading)' }}>
          {meeting.startup.initials}
        </span>
        <div>
          <h4 style={{ margin: '0 0 2px' }}>{meeting.startup.founder}</h4>
          <div style={{ fontSize: 13, color: 'color-mix(in srgb, #e9e9ed 60%, transparent)' }}>{meeting.startup.role} · {meeting.startup.companyName}</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--color-divider)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ background: 'var(--color-surface)', padding: 16 }}>
          <div className="card-kicker">Table</div>
          <div style={{ fontSize: 30, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{meeting.location.table}</div>
          <div className="card-meta" style={{ marginTop: 4 }}>{meeting.location.hall}</div>
        </div>
        <div style={{ background: 'var(--color-surface)', padding: 16 }}>
          <div className="card-kicker">Time</div>
          <div style={{ fontSize: 30, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>{meeting.slot}</div>
          <div className="card-meta" style={{ marginTop: 4 }}>until {endTime}</div>
        </div>
      </div>
      <div style={{ marginTop: 16, paddingBottom: 8 }}>
        <button className="btn btn-secondary btn-block" onClick={toggleIProfile}>{iProfileLabel}</button>
        {iProfile && <MeetingBrief brief={meeting.briefs.investor} />}
      </div>
    </div>
  );
}
