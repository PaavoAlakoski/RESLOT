interface CalendarSlotProps {
  time: string;
  status: string;
  tone: 'muted' | 'accent';
  title: string;
  subtitle?: string;
}

export function CalendarSlot({ time, status, tone, title, subtitle }: CalendarSlotProps) {
  const accent = tone === 'accent';
  return (
    <div
      className="card"
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        padding: 14,
        borderLeft: `3px solid ${accent ? 'var(--color-accent)' : 'var(--color-neutral-700)'}`,
      }}
    >
      <div
        style={{
          flex: 'none',
          fontSize: 19,
          lineHeight: 1,
          fontFamily: 'var(--font-heading)',
          color: accent ? 'var(--color-accent-300)' : 'var(--color-neutral-500)',
          minWidth: 42,
        }}
      >
        {time}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span className={accent ? 'tag tag-accent' : 'tag tag-neutral'} style={{ fontSize: 9, padding: '2px 7px', marginBottom: 4, display: 'inline-block' }}>
          {status}
        </span>
        <div style={{ fontSize: 14 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'color-mix(in srgb, #e9e9ed 55%, transparent)', marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
    </div>
  );
}
