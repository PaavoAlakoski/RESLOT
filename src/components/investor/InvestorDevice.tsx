import { IOSDevice } from '../ios/IOSDevice';
import { InvestorAlert } from './InvestorAlert';
import { InvestorFeed } from './InvestorFeed';
import { InvestorDetail } from './InvestorDetail';
import { InvestorMatched } from './InvestorMatched';
import { WaitingDialog } from '../overlays/WaitingDialog';
import type { MatchmakingDemoReturn } from '../../hooks/useMatchmakingDemo';

interface InvestorDeviceProps {
  hook: MatchmakingDemoReturn;
  now: string;
}

export function InvestorDevice({ hook, now }: InvestorDeviceProps) {
  return (
    <IOSDevice dark time={now}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', padding: '54px 20px 34px', position: 'relative', overflow: 'hidden' }}>
        {hook.iAlert && <InvestorAlert clock={hook.clock} browse={hook.browse} skip={hook.skip} />}

        {hook.iFeed && <InvestorFeed clock={hook.clock} feed={hook.feed} feedEmpty={hook.feedEmpty} declinedBy={hook.declinedBy} />}

        {hook.detail && <InvestorDetail detail={hook.detail} showReasons={hook.showReasons} closeDetail={hook.closeDetail} />}

        {hook.iMatched && (
          <InvestorMatched clock={hook.clock} iProfile={hook.iProfile} iProfileLabel={hook.iProfileLabel} toggleIProfile={hook.toggleIProfile} />
        )}

        {hook.iWaiting && <WaitingDialog pendingName={hook.pendingName} waitLeft={hook.waitLeft} waitPct={hook.waitPct} cancelPick={hook.cancelPick} />}
      </div>
    </IOSDevice>
  );
}
