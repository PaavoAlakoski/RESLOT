import type { ApiVc } from '../../api/liveMatch';
import { CalendarSlot } from '../CalendarSlot';

interface FounderAlertProps {
  clock: string;
  join: () => void;
  skip: () => void;
  cancelledVc: ApiVc | null;
  nextVc: ApiVc | null;
}

export function FounderAlert({ clock, join, skip, cancelledVc, nextVc }: FounderAlertProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'noct-rise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
        <span style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'color-mix(in srgb, #e9e9ed 50%, transparent)' }}>
          14:30 slot
        </span>
        <span className="tag tag-outline">starts in {clock}</span>
      </div>
      <h3 style={{ margin: '0 0 16px', fontSize: 27 }}>Your 14:30 meeting was cancelled.</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <CalendarSlot
          time="14:30"
          status="Cancelled"
          tone="cancelled"
          title={cancelledVc ? cancelledVc.partner : 'Loading…'}
          subtitle={cancelledVc ? `${cancelledVc.role} · ${cancelledVc.firmName}` : undefined}
        />
        <CalendarSlot
          time="15:30"
          status="Next"
          tone="accent"
          title={nextVc ? nextVc.partner : 'Loading…'}
          subtitle={nextVc ? `${nextVc.role} · ${nextVc.firmName}` : undefined}
        />
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-block" style={{ height: 48, fontSize: 15 }} onClick={join}>
          Find new meeting for 14:30
        </button>
        <button className="btn btn-ghost" style={{ alignSelf: 'center' }} onClick={skip}>
          Keep the slot free
        </button>
      </div>
    </div>
  );
}
