interface InviteDialogProps {
  inviteLeft: number;
  accept: () => void;
  declineInvite: () => void;
}

export function InviteDialog({ inviteLeft, accept, declineInvite }: InviteDialogProps) {
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="tag tag-accent">Meeting request</span>
          <span style={{ fontSize: 12, color: 'var(--color-accent-300)' }}>{inviteLeft}s</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              width: 46,
              height: 46,
              flex: 'none',
              borderRadius: '50%',
              background: 'var(--color-accent-800)',
              color: 'var(--color-accent-100)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 15,
              fontFamily: 'var(--font-heading)',
            }}
          >
            AV
          </span>
          <div>
            <div className="dialog-title" style={{ fontSize: 18 }}>
              Aino Virtanen
            </div>
            <div style={{ fontSize: 12, color: 'color-mix(in srgb, #e9e9ed 60%, transparent)' }}>Partner · Northwind Ventures</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn btn-primary btn-block" style={{ height: 46, fontSize: 15 }} onClick={accept}>
            Accept meeting
          </button>
          <button className="btn btn-ghost" style={{ alignSelf: 'center' }} onClick={declineInvite}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
