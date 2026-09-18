interface InvestorMatchedProps {
  clock: string;
  iProfile: boolean;
  iProfileLabel: string;
  toggleIProfile: () => void;
}

export function InvestorMatched({ clock, iProfile, iProfileLabel, toggleIProfile }: InvestorMatchedProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'noct-rise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <span className="tag tag-accent">Meeting confirmed</span>
        <span style={{ fontSize: 11, color: 'color-mix(in srgb, #e9e9ed 50%, transparent)' }}>in {clock}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <span
          style={{
            width: 62,
            height: 62,
            flex: 'none',
            borderRadius: '50%',
            background: 'var(--color-accent-800)',
            color: 'var(--color-accent-100)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 20,
            fontFamily: 'var(--font-heading)',
          }}
        >
          OL
        </span>
        <div>
          <h4 style={{ margin: '0 0 2px' }}>Otto Lindqvist</h4>
          <div style={{ fontSize: 13, color: 'color-mix(in srgb, #e9e9ed 60%, transparent)' }}>CEO · Halcyon Grid</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--color-divider)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div style={{ background: 'var(--color-surface)', padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 8 }}>
            Table
          </div>
          <div style={{ fontSize: 30, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>12B</div>
          <div style={{ fontSize: 12, color: 'color-mix(in srgb, #e9e9ed 55%, transparent)', marginTop: 4 }}>Hall 4</div>
        </div>
        <div style={{ background: 'var(--color-surface)', padding: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 8 }}>
            Time
          </div>
          <div style={{ fontSize: 30, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>14:30</div>
          <div style={{ fontSize: 12, color: 'color-mix(in srgb, #e9e9ed 55%, transparent)', marginTop: 4 }}>until 14:55</div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-secondary btn-block" onClick={toggleIProfile}>
          {iProfileLabel}
        </button>
        {iProfile && (
          <div className="card" style={{ marginTop: 12, gap: 10, padding: 16, animation: 'noct-rise .3s ease both' }}>
            <p className="card-body" style={{ opacity: 0.8, margin: 0 }}>
              Grid-balancing software for industrial battery fleets. €410k ARR, two Nordic utilities, team of nine. Raising €1.2M seed.
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="tag tag-neutral">Seed</span>
              <span className="tag tag-neutral">Energy</span>
            </div>
            <div className="card-meta">otto@halcyongrid.io</div>
          </div>
        )}
      </div>
    </div>
  );
}
