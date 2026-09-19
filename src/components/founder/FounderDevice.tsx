import { IOSDevice } from '../ios/IOSDevice';
import { FounderAlert } from './FounderAlert';
import { FounderPool } from './FounderPool';
import { FounderMatched } from './FounderMatched';
import { SlotKeptFree } from '../SlotKeptFree';
import { InviteDialog } from '../overlays/InviteDialog';
import type { MatchmakingDemoReturn } from '../../hooks/useMatchmakingDemo';

interface FounderDeviceProps {
  hook: MatchmakingDemoReturn;
  now: string;
}

export function FounderDevice({ hook, now }: FounderDeviceProps) {
  return (
    <IOSDevice dark time={now}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', padding: '54px 20px 34px', position: 'relative', overflow: 'hidden' }}>
        {hook.fAlert && <FounderAlert clock={hook.clock} join={hook.join} skip={hook.skipFounder} cancelledVc={hook.cancelledVc} nextVc={hook.nextVc} />}

        {hook.fPool && <FounderPool clock={hook.clock} browsing={hook.browsing} leave={hook.leave} />}

        {hook.fSkipped && <SlotKeptFree clock={hook.clock} />}

        {hook.fMatched && (
          <FounderMatched clock={hook.clock} fProfile={hook.fProfile} fProfileLabel={hook.fProfileLabel} toggleFProfile={hook.toggleFProfile} meeting={hook.meeting} />
        )}

        {hook.state.invited && (
          <InviteDialog
            inviteLeft={hook.inviteLeft}
            accept={hook.accept}
            declineInvite={hook.declineInvite}
            investorName={hook.vc?.partner ?? 'Investor'}
            investorMeta={hook.vc ? `${hook.vc.role} · ${hook.vc.firmName}` : 'Loading profile…'}
            investorInitials={hook.vc?.initials ?? 'VC'}
            investorPhotoUrl={hook.vc?.photoUrl}
          />
        )}
      </div>
    </IOSDevice>
  );
}
