import { Avatar } from '../Avatar';

interface InviteDialogProps {
  inviteLeft: number;
  accept: () => void;
  declineInvite: () => void;
  investorName: string;
  investorMeta: string;
  investorInitials: string;
  investorPhotoUrl?: string;
}

export function InviteDialog({
  inviteLeft,
  accept,
  declineInvite,
  investorName,
  investorMeta,
  investorInitials,
  investorPhotoUrl,
}: InviteDialogProps) {
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
          <Avatar logoUrl={investorPhotoUrl} initials={investorInitials} size={46} fontSize={15} fit="cover" />
          <div>
            <div className="dialog-title" style={{ fontSize: 18 }}>
              {investorName}
            </div>
            <div style={{ fontSize: 12, color: 'color-mix(in srgb, #e9e9ed 60%, transparent)' }}>{investorMeta}</div>
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
