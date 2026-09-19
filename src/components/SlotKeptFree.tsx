interface SlotKeptFreeProps {
  clock: string;
}

export function SlotKeptFree({ clock }: SlotKeptFreeProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'noct-rise .4s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 64 }}>
        <span className="tag tag-outline">starts in {clock}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18, margin: 'auto 0' }}>
        <span style={{ width: 92, height: 92, borderRadius: '50%', border: '1px dashed var(--color-neutral-700)' }} />
        <div>
          <h4 style={{ margin: '0 0 6px' }}>Slot kept free</h4>
          <p style={{ margin: 0, fontSize: 13, color: 'color-mix(in srgb, #e9e9ed 60%, transparent)' }}>This 14:30 slot won't be refilled.</p>
        </div>
      </div>
    </div>
  );
}
