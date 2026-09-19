interface FounderPoolProps {
  clock: string;
  browsing: number;
  leave: () => void;
}

function describeBrowsing(count: number): string {
  if (count === 0) return 'No investors are looking now.';
  if (count === 1) return '1 investor is looking now.';
  return `${count} investors are looking now.`;
}

export function FounderPool({ clock, browsing, leave }: FounderPoolProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'noct-rise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 64 }}>
        <span className="tag tag-outline">starts in {clock}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18 }}>
        <div style={{ position: 'relative', width: 92, height: 92, display: 'grid', placeItems: 'center' }}>
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px solid var(--color-accent)',
              animation: 'noct-pulse 2.6s ease-out infinite',
            }}
          />
          <span
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '1px solid var(--color-accent)',
              animation: 'noct-pulse 2.6s ease-out 1.3s infinite',
            }}
          />
          <span
            style={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              border: '1px solid var(--color-accent-700)',
              background: 'var(--color-accent-900)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 11,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--color-accent-300)',
            }}
          >
            In pool
          </span>
        </div>
        <div>
          <h4 style={{ margin: '0 0 6px' }}>You're in the pool</h4>
          <p style={{ margin: 0, fontSize: 13, color: 'color-mix(in srgb, #e9e9ed 60%, transparent)' }}>{describeBrowsing(browsing)}</p>
        </div>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <button className="btn btn-secondary btn-block" onClick={leave}>
          Leave the pool
        </button>
      </div>
    </div>
  );
}
