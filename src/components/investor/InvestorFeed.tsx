import type { DecoratedFounder } from '../../types';

interface InvestorFeedProps {
  clock: string;
  feed: DecoratedFounder[];
  feedEmpty: boolean;
  declinedBy: string | null;
}

export function InvestorFeed({ clock, feed, feedEmpty, declinedBy }: InvestorFeedProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, animation: 'noct-rise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <h4 style={{ margin: 0 }}>Free at 14:30</h4>
        <span style={{ fontSize: 11, color: 'color-mix(in srgb, #e9e9ed 50%, transparent)' }}>starts in {clock}</span>
      </div>

      {declinedBy && (
        <div className="card" style={{ padding: '12px 14px', marginBottom: 12, background: 'var(--color-neutral-900)', boxShadow: 'var(--shadow-sm)' }}>
          <p className="card-body" style={{ margin: 0, opacity: 0.85 }}>
            {declinedBy} declined. Your slot is still open.
          </p>
        </div>
      )}

      <div className="no-scrollbar" style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
        {feed.map((f) => (
          <div key={f.id} className="card" style={{ padding: 14, gap: 10, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="card-title">{f.name}</div>
                {f.isNew && (
                  <span className="tag tag-accent" style={{ fontSize: 9, padding: '2px 7px' }}>
                    New
                  </span>
                )}
              </div>
              <div style={{ flex: 'none', textAlign: 'right' }}>
                <div style={{ fontSize: 17, fontFamily: 'var(--font-heading)', color: f.scoreColor, lineHeight: 1.2 }}>
                  {f.score}/10
                </div>
              </div>
            </div>
            <p className="card-body" style={{ margin: 0, opacity: 0.78 }}>
              {f.blurb}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--color-accent-300)' }}>Seeking {f.seeking}</span>
              <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={f.open}>
                Details
              </button>
            </div>
            <button className="btn btn-primary btn-block" style={{ height: 40 }} onClick={f.pick}>
              Initiate meeting
            </button>
          </div>
        ))}

        {feedEmpty && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 10, padding: '40px 10px' }}>
            <span style={{ width: 54, height: 54, borderRadius: '50%', border: '1px dashed var(--color-neutral-700)' }} />
            <div style={{ fontSize: 15, fontFamily: 'var(--font-heading)' }}>Nobody in the pool yet</div>
          </div>
        )}
      </div>
    </div>
  );
}
