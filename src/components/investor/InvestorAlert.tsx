import type { ApiStartup } from '../../api/liveMatch';
import { CalendarSlot } from '../CalendarSlot';

interface InvestorAlertProps {
  clock: string;
  browse: () => void;
  skip: () => void;
  nextStartup: ApiStartup | null;
}

export function InvestorAlert({ clock, browse, skip, nextStartup }: InvestorAlertProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'noct-rise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 26 }}>
        <span className="tag tag-outline">starts in {clock}</span>
      </div>
      <h3 style={{ margin: '0 0 16px', fontSize: 27 }}>Your 14:30 meeting was cancelled.</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <CalendarSlot time="14:30" status="Cancelled" tone="cancelled" title="Nimbus Foundry" />
        <CalendarSlot
          time="15:30"
          status="Next"
          tone="accent"
          title={nextStartup ? nextStartup.companyName : 'Loading…'}
          subtitle={nextStartup ? `${nextStartup.founder} · ${nextStartup.industry}` : undefined}
        />
      </div>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-block" style={{ height: 48, fontSize: 15 }} onClick={browse}>
          Find new meeting for 14:30
        </button>
        <button className="btn btn-ghost" style={{ alignSelf: 'center' }} onClick={skip}>
          Keep the slot free
        </button>
      </div>
    </div>
  );
}
