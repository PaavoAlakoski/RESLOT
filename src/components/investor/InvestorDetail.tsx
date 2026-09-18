import type { DecoratedFounder } from '../../types';

interface InvestorDetailProps {
  detail: DecoratedFounder | null;
  showReasons: boolean;
  closeDetail: () => void;
}

export function InvestorDetail({ detail, showReasons, closeDetail }: InvestorDetailProps) {
  if (!detail) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--color-bg)', padding: '54px 20px 34px', display: 'flex', flexDirection: 'column', animation: 'noct-slide .25s ease both' }}>
      <button className="btn btn-ghost" style={{ alignSelf: 'flex-start', marginBottom: 14 }} onClick={closeDetail}>
        ← Back
      </button>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
        <h4 style={{ margin: 0 }}>{detail.name}</h4>
        <div style={{ fontSize: 17, fontFamily: 'var(--font-heading)', color: detail.scoreColor, flex: 'none', lineHeight: 1.2 }}>
          {detail.score}/10
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {detail.chips.map((c, i) => (
          <span key={i} className="tag tag-neutral">
            {c.label}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span
          style={{
            width: 38,
            height: 38,
            flex: 'none',
            borderRadius: '50%',
            background: 'var(--color-accent-800)',
            color: 'var(--color-accent-100)',
            display: 'grid',
            placeItems: 'center',
            fontSize: 13,
            fontFamily: 'var(--font-heading)',
          }}
        >
          {detail.initials}
        </span>
        <div>
          <div style={{ fontSize: 14 }}>{detail.founder}</div>
          <div style={{ fontSize: 11, color: 'color-mix(in srgb, #e9e9ed 50%, transparent)' }}>{detail.role}</div>
        </div>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.8 }}>{detail.long}</p>
      {showReasons && (
        <div className="card" style={{ gap: 6, padding: 14 }}>
          <div className="card-kicker">Why this rank</div>
          <p className="card-body" style={{ margin: 0, opacity: 0.78 }}>
            {detail.reason}
          </p>
        </div>
      )}
      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: 13, color: 'var(--color-accent-300)', marginBottom: 10 }}>Seeking {detail.seeking}</div>
        <button className="btn btn-primary btn-block" style={{ height: 48, fontSize: 15 }} onClick={detail.pick}>
          Initiate meeting
        </button>
      </div>
    </div>
  );
}
