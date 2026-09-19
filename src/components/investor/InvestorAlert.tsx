interface InvestorAlertProps {
  clock: string;
  browse: () => void;
  skip: () => void;
}

export function InvestorAlert({ clock, browse, skip }: InvestorAlertProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'noct-rise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 }}>
        <span style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'color-mix(in srgb, #e9e9ed 50%, transparent)' }}>
          14:30 slot
        </span>
        <span className="tag tag-outline">starts in {clock}</span>
      </div>
      <h3 style={{ margin: '0 0 10px', fontSize: 27 }}>Your 14:30 meeting was canceled.</h3>
      <p style={{ margin: 0, fontSize: 14, color: 'color-mix(in srgb, #e9e9ed 62%, transparent)' }}>Nimbus Foundry cancelled.</p>
      <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--color-accent-300)' }}>Next meeting at 15:30.</p>
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button className="btn btn-primary btn-block" style={{ height: 48, fontSize: 15 }} onClick={browse}>
          See founders in the pool
        </button>
        <button className="btn btn-ghost" style={{ alignSelf: 'center' }} onClick={skip}>
          Keep the slot free
        </button>
      </div>
    </div>
  );
}
