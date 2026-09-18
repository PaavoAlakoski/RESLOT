interface WaitingDialogProps {
  pendingName: string;
  waitLeft: number;
  waitPct: string;
  cancelPick: () => void;
}

export function WaitingDialog({ pendingName, waitLeft, waitPct, cancelPick }: WaitingDialogProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'color-mix(in srgb, #292b31 62%, transparent)',
        display: 'flex',
        alignItems: 'flex-end',
        padding: 20,
        animation: 'noct-rise .3s ease both',
      }}
    >
      <div className="dialog" style={{ width: '100%' }}>
        <div className="dialog-title" style={{ fontSize: 18 }}>
          Waiting for {pendingName}
        </div>
        <p className="dialog-body" style={{ margin: 0 }}>
          {waitLeft}s to confirm.
        </p>
        <div style={{ height: 3, borderRadius: 2, background: 'var(--color-neutral-800)', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--color-accent)', width: waitPct }} />
        </div>
        <div className="dialog-actions">
          <button className="btn btn-ghost" onClick={cancelPick}>
            Cancel request
          </button>
        </div>
      </div>
    </div>
  );
}
