import { useState, useEffect, useCallback } from 'react';
import type { MatchmakingState, DecoratedFounder } from '../types';
import { POOL, YOU } from '../data/founders';

export type MatchmakingDemoReturn = ReturnType<typeof useMatchmakingDemo>;

const DEMO_CONFIG = {
  confirmWindow: 45,
  poolCountdown: 252,
  showReasons: true,
  emptyPool: false,
};

const SLOT_MIN = 14 * 60 + 30;

export function useMatchmakingDemo() {
  const [state, setState] = useState<MatchmakingState>({
    fStage: 'alert',
    iStage: 'alert',
    joined: false,
    detailId: null,
    invited: false,
    inviteLeft: 0,
    pendingId: null,
    waitLeft: 0,
    declinedBy: null,
    secs: DEMO_CONFIG.poolCountdown,
    fProfile: false,
    iProfile: false,
    justJoined: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setState((s) => {
        const n = { ...s, secs: Math.max(0, s.secs - 1) };

        if (s.invited) {
          n.inviteLeft = s.inviteLeft - 1;
          if (n.inviteLeft <= 0) {
            n.invited = false;
            n.inviteLeft = 0;
            n.iStage = 'feed';
            n.pendingId = null;
            n.declinedBy = YOU.name;
          }
        }

        if (s.pendingId && s.iStage === 'waiting') {
          n.waitLeft = s.waitLeft - 1;
          if (n.waitLeft <= 0) {
            const who = s.pendingId === YOU.id ? YOU : POOL.find((p) => p.id === s.pendingId);
            n.iStage = 'feed';
            n.pendingId = null;
            n.waitLeft = 0;
            n.declinedBy = who ? who.name : null;
            if (s.pendingId === YOU.id) {
              n.invited = false;
              n.inviteLeft = 0;
            }
          }
        }

        return n;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const window = DEMO_CONFIG.confirmWindow;

  const join = useCallback(() => {
    setState((s) => ({
      ...s,
      joined: true,
      fStage: 'pool',
      justJoined: true,
    }));
    setTimeout(() => {
      setState((s) => ({
        ...s,
        justJoined: false,
      }));
    }, 6000);
  }, []);

  const leave = useCallback(() => {
    setState((s) => ({
      ...s,
      joined: false,
      fStage: 'alert',
      justJoined: false,
    }));
  }, []);

  const skip = useCallback(() => {
    // No-op in the original
  }, []);

  const browse = useCallback(() => {
    setState((s) => ({
      ...s,
      iStage: 'feed',
    }));
  }, []);

  const open = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      detailId: id,
    }));
  }, []);

  const closeDetail = useCallback(() => {
    setState((s) => ({
      ...s,
      detailId: null,
    }));
  }, []);

  const pick = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      pendingId: id,
      iStage: 'waiting',
      waitLeft: id === YOU.id ? window : 6,
      declinedBy: null,
      detailId: null,
      ...(id === YOU.id ? { invited: true, inviteLeft: window } : {}),
    }));
  }, [window]);

  const cancelPick = useCallback(() => {
    setState((s) => ({
      ...s,
      pendingId: null,
      iStage: 'feed',
      waitLeft: 0,
      invited: false,
      inviteLeft: 0,
    }));
  }, []);

  const accept = useCallback(() => {
    setState((s) => ({
      ...s,
      invited: false,
      fStage: 'matched',
      iStage: 'matched',
      pendingId: null,
      declinedBy: null,
    }));
  }, []);

  const declineInvite = useCallback(() => {
    setState((s) => ({
      ...s,
      invited: false,
      inviteLeft: 0,
      iStage: 'feed',
      pendingId: null,
      waitLeft: 0,
      declinedBy: YOU.name,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      fStage: 'alert',
      iStage: 'alert',
      joined: false,
      detailId: null,
      invited: false,
      inviteLeft: 0,
      pendingId: null,
      waitLeft: 0,
      declinedBy: null,
      secs: DEMO_CONFIG.poolCountdown,
      fProfile: false,
      iProfile: false,
      justJoined: false,
    });
  }, []);

  const toggleFProfile = useCallback(() => {
    setState((s) => ({
      ...s,
      fProfile: !s.fProfile,
    }));
  }, []);

  const toggleIProfile = useCallback(() => {
    setState((s) => ({
      ...s,
      iProfile: !s.iProfile,
    }));
  }, []);

  // Calculate derived values
  const mm = Math.floor(state.secs / 60);
  const ss = String(state.secs % 60).padStart(2, '0');
  const clock = `${mm}:${ss}`;

  const nowMin = SLOT_MIN - Math.ceil(state.secs / 60);
  const now = Math.floor(nowMin / 60) + ':' + String(nowMin % 60).padStart(2, '0');

  const base = DEMO_CONFIG.emptyPool ? [] : POOL;
  const list = (state.joined ? [YOU, ...base] : base).slice().sort((a, b) => b.score - a.score);

  const decorate = (f: typeof POOL[0]): DecoratedFounder => ({
    ...f,
    scoreColor:
      f.score >= 8
        ? 'var(--color-accent-300)'
        : f.score >= 6
          ? 'var(--color-neutral-300)'
          : 'var(--color-neutral-500)',
    chips: f.chips.map((label) => ({ label })),
    isNew: f.id === YOU.id && state.justJoined,
    open: () => open(f.id),
    pick: () => pick(f.id),
  });

  const feed = list.map(decorate);
  const detailSrc = state.detailId ? list.find((f) => f.id === state.detailId) : null;
  const detail = detailSrc ? decorate(detailSrc) : null;
  const pending = state.pendingId === YOU.id ? YOU : POOL.find((p) => p.id === state.pendingId);

  const fAlert = state.fStage === 'alert';
  const fPool = state.fStage === 'pool';
  const fMatched = state.fStage === 'matched';

  const iAlert = state.iStage === 'alert';
  const iFeed = state.iStage === 'feed' || state.iStage === 'waiting';
  const iWaiting = state.iStage === 'waiting';
  const iMatched = state.iStage === 'matched';

  const feedEmpty = feed.length === 0;
  const browsing = 6;

  const fProfileLabel = state.fProfile ? 'Hide investor profile' : 'View investor profile';
  const iProfileLabel = state.iProfile ? 'Hide startup profile' : 'View startup profile';

  const waitPct = Math.max(0, Math.round((state.waitLeft / (state.pendingId === YOU.id ? window : 6)) * 100)) + '%';
  const pendingName = pending ? pending.name : '';

  return {
    // State
    state,

    // UI Flags
    fAlert,
    fPool,
    fMatched,
    iAlert,
    iFeed,
    iWaiting,
    iMatched,
    feedEmpty,

    // Display values
    clock,
    now,
    browsing,
    inviteLeft: Math.max(0, state.inviteLeft),
    waitLeft: Math.max(0, state.waitLeft),
    waitPct,
    pendingName,
    declinedBy: state.declinedBy,

    // Derived lists
    feed,
    detail,
    showReasons: DEMO_CONFIG.showReasons,

    // Profile toggles
    fProfile: state.fProfile,
    iProfile: state.iProfile,
    fProfileLabel,
    iProfileLabel,

    // Handlers
    join,
    leave,
    skip,
    browse,
    open,
    closeDetail,
    pick,
    cancelPick,
    accept,
    declineInvite,
    toggleFProfile,
    toggleIProfile,
    reset,
  };
}
