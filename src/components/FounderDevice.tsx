import { IOSDevice } from './ios/IOSDevice';
import { FounderAlert } from './founder/FounderAlert';
import { FounderPool } from './founder/FounderPool';
import { FounderMatched } from './founder/FounderMatched';
import { InviteDialog } from './overlays/InviteDialog';
import type { MatchmakingDemoReturn } from '../hooks/useMatchmakingDemo';

interface FounderDeviceProps {
  hook: MatchmakingDemoReturn;
  now: string;
}

export function FounderDevice({ hook, now }: FounderDeviceProps) {
  return (
    <IOSDevice dark time={now}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', padding: '54px 20px 34px', position: 'relative', overflow: 'hidden' }}>
        {hook.fAlert && <FounderAlert clock={hook.clock} join={hook.join} skip={hook.skip} />}

        {hook.fPool && <FounderPool clock={hook.clock} browsing={hook.browsing} leave={hook.leave} />}

        {hook.fMatched && (
          <FounderMatched clock={hook.clock} fProfile={hook.fProfile} fProfileLabel={hook.fProfileLabel} toggleFProfile={hook.toggleFProfile} />
        )}

        {hook.state.invited && <InviteDialog inviteLeft={hook.inviteLeft} accept={hook.accept} declineInvite={hook.declineInvite} />}
      </div>
    </IOSDevice>
  );
}
