import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { liveMatchApi } from '../api/liveMatch';
import type { ApiStartup, ApiVc, Meeting, RankedStartup } from '../api/liveMatch';
import type { DecoratedFounder, FounderProfile, MatchmakingState } from '../types';

export type MatchmakingDemoReturn = ReturnType<typeof useMatchmakingDemo>;

const FOUNDER_ID = '33';
const VC_ID = 'tundra-peak';
const CONFIRM_WINDOW = 60;
const POOL_COUNTDOWN = 252;
const SLOT_MIN = 14 * 60 + 30;

function initialState(): MatchmakingState {
  return {
    fStage: 'alert',
    iStage: 'alert',
    joined: false,
    detailId: null,
    invited: false,
    inviteLeft: 0,
    pendingId: null,
    waitLeft: 0,
    declinedBy: null,
    secs: POOL_COUNTDOWN,
    fProfile: false,
    iProfile: false,
    justJoined: false,
  };
}

function compactUsd(value: number) {
  if (value >= 1_000_000) return `$${Number((value / 1_000_000).toFixed(1))}M`;
  return `$${Math.round(value / 1_000)}k`;
}

function toFounder(startup: RankedStartup): FounderProfile {
  return {
    id: startup.id,
    name: startup.companyName,
    score: startup.score,
    seeking: compactUsd(startup.seekingUsd),
    initials: startup.initials,
    logoUrl: startup.logoUrl,
    founder: startup.founder,
    role: startup.role,
    blurb: startup.description,
    reason: startup.reason,
    chips: [startup.stage, startup.industry, startup.city],
    long: `${startup.tagline}. ${startup.description}`,
    scoreSource: startup.source,
    scoreModel: startup.model,
  };
}

export function useMatchmakingDemo() {
  const [state, setState] = useState<MatchmakingState>(initialState);
  const [profiles, setProfiles] = useState<FounderProfile[]>([]);
  const [vc, setVc] = useState<ApiVc | null>(null);
  const [founderStartup, setFounderStartup] = useState<ApiStartup | null>(null);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [apiMode, setApiMode] = useState('connecting');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inviteId = useRef<string | null>(null);
  const declineTimer = useRef<number | null>(null);

  const reportError = useCallback((cause: unknown) => {
    setError(cause instanceof Error ? cause.message : 'The Live Match API is unavailable');
  }, []);

  useEffect(() => {
    Promise.all([liveMatchApi.health(), liveMatchApi.vc(VC_ID), liveMatchApi.startup(FOUNDER_ID)])
      .then(([health, vcProfile, startup]) => {
        setApiMode(health.aiMode);
        setVc(vcProfile);
        setFounderStartup(startup);
        setError(null);
      })
      .catch(reportError);
  }, [reportError]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setState((current) => {
        const next = { ...current, secs: Math.max(0, current.secs - 1) };
        if (current.invited) {
          next.inviteLeft = Math.max(0, current.inviteLeft - 1);
          if (next.inviteLeft === 0) {
            next.invited = false;
            next.iStage = 'feed';
            next.pendingId = null;
            next.waitLeft = 0;
            next.declinedBy = 'The founder';
          }
        }
        if (current.pendingId && current.iStage === 'waiting') {
          next.waitLeft = Math.max(0, current.waitLeft - 1);
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => () => {
    if (declineTimer.current !== null) window.clearTimeout(declineTimer.current);
  }, []);

  const refreshCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await liveMatchApi.candidates(VC_ID);
      setProfiles(result.candidates.map(toFounder));
      setApiMode(result.aiMode);
    } catch (cause) {
      reportError(cause);
    } finally {
      setLoading(false);
    }
  }, [reportError]);

  const join = useCallback(async () => {
    setState((current) => ({ ...current, joined: true, fStage: 'pool', justJoined: true }));
    setError(null);
    try {
      await liveMatchApi.joinPool(FOUNDER_ID);
      window.setTimeout(() => setState((current) => ({ ...current, justJoined: false })), 6000);
      if (state.iStage !== 'alert') await refreshCandidates();
    } catch (cause) {
      setState((current) => ({ ...current, joined: false, fStage: 'alert', justJoined: false }));
      reportError(cause);
    }
  }, [refreshCandidates, reportError, state.iStage]);

  const leave = useCallback(async () => {
    setState((current) => ({ ...current, joined: false, fStage: 'alert', justJoined: false }));
    try {
      await liveMatchApi.leavePool(FOUNDER_ID);
      if (state.iStage !== 'alert') await refreshCandidates();
    } catch (cause) {
      reportError(cause);
    }
  }, [refreshCandidates, reportError, state.iStage]);

  const skipFounder = useCallback(() => {
    setState((current) => ({ ...current, fStage: 'skipped' }));
  }, []);

  const skipInvestor = useCallback(() => {
    setState((current) => ({ ...current, iStage: 'skipped' }));
  }, []);

  const browse = useCallback(() => {
    setState((current) => ({ ...current, iStage: 'feed' }));
    void refreshCandidates();
  }, [refreshCandidates]);

  const open = useCallback((id: string) => setState((current) => ({ ...current, detailId: id })), []);
  const closeDetail = useCallback(() => setState((current) => ({ ...current, detailId: null })), []);

  const pick = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const invite = await liveMatchApi.invite(VC_ID, id);
      inviteId.current = invite.id;
      const selected = profiles.find((profile) => profile.id === id);
      setState((current) => ({
        ...current,
        pendingId: id,
        iStage: 'waiting',
        waitLeft: CONFIRM_WINDOW,
        declinedBy: null,
        detailId: null,
        invited: id === FOUNDER_ID,
        inviteLeft: id === FOUNDER_ID ? CONFIRM_WINDOW : 0,
      }));

      if (id !== FOUNDER_ID) {
        declineTimer.current = window.setTimeout(async () => {
          try {
            await liveMatchApi.respond(invite.id, 'declined');
          } catch {
            // An expired invite has the same demo outcome.
          }
          setState((current) => ({
            ...current,
            iStage: 'feed',
            pendingId: null,
            waitLeft: 0,
            declinedBy: selected?.name ?? 'The founder',
          }));
        }, CONFIRM_WINDOW * 1000);
      }
    } catch (cause) {
      reportError(cause);
    } finally {
      setLoading(false);
    }
  }, [profiles, reportError]);

  const cancelPick = useCallback(async () => {
    if (declineTimer.current !== null) window.clearTimeout(declineTimer.current);
    const currentInvite = inviteId.current;
    inviteId.current = null;
    setState((current) => ({ ...current, pendingId: null, iStage: 'feed', waitLeft: 0, invited: false, inviteLeft: 0 }));
    if (currentInvite) {
      try {
        await liveMatchApi.cancelInvite(currentInvite);
      } catch (cause) {
        reportError(cause);
      }
    }
  }, [reportError]);

  const accept = useCallback(async () => {
    if (!inviteId.current || loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await liveMatchApi.respond(inviteId.current, 'accepted');
      if (!result.meeting) throw new Error('The backend did not create a meeting');
      setMeeting(result.meeting);
      setState((current) => ({
        ...current,
        invited: false,
        fStage: 'matched',
        iStage: 'matched',
        pendingId: null,
        waitLeft: 0,
        declinedBy: null,
      }));
    } catch (cause) {
      reportError(cause);
    } finally {
      setLoading(false);
    }
  }, [loading, reportError]);

  const declineInvite = useCallback(async () => {
    const currentInvite = inviteId.current;
    setState((current) => ({
      ...current,
      invited: false,
      inviteLeft: 0,
      iStage: 'feed',
      pendingId: null,
      waitLeft: 0,
      declinedBy: founderStartup?.companyName ?? 'The founder',
    }));
    if (currentInvite) {
      try {
        await liveMatchApi.respond(currentInvite, 'declined');
      } catch (cause) {
        reportError(cause);
      }
    }
  }, [founderStartup, reportError]);

  const reset = useCallback(async () => {
    if (declineTimer.current !== null) window.clearTimeout(declineTimer.current);
    inviteId.current = null;
    setState(initialState());
    setProfiles([]);
    setMeeting(null);
    setError(null);
    try {
      const result = await liveMatchApi.reset();
      setApiMode(result.aiMode);
    } catch (cause) {
      reportError(cause);
    }
  }, [reportError]);

  const feed = useMemo<DecoratedFounder[]>(() => profiles.map((profile) => ({
    ...profile,
    scoreColor: profile.score >= 8 ? 'var(--color-accent-300)' : profile.score >= 6 ? 'var(--color-neutral-300)' : 'var(--color-neutral-500)',
    chips: profile.chips.map((label) => ({ label })),
    isNew: profile.id === FOUNDER_ID && state.justJoined,
    open: () => open(profile.id),
    pick: () => { void pick(profile.id); },
  })), [open, pick, profiles, state.justJoined]);

  const detail = state.detailId ? feed.find((profile) => profile.id === state.detailId) ?? null : null;
  const pending = state.pendingId ? profiles.find((profile) => profile.id === state.pendingId) : null;
  const mm = Math.floor(state.secs / 60);
  const clock = `${mm}:${String(state.secs % 60).padStart(2, '0')}`;
  const nowMin = SLOT_MIN - Math.ceil(state.secs / 60);
  const now = `${Math.floor(nowMin / 60)}:${String(nowMin % 60).padStart(2, '0')}`;
  const waitWindow = CONFIRM_WINDOW;

  return {
    state,
    fAlert: state.fStage === 'alert',
    fPool: state.fStage === 'pool',
    fSkipped: state.fStage === 'skipped',
    fMatched: state.fStage === 'matched',
    iAlert: state.iStage === 'alert',
    iFeed: state.iStage === 'feed' || state.iStage === 'waiting',
    iSkipped: state.iStage === 'skipped',
    iWaiting: state.iStage === 'waiting',
    iMatched: state.iStage === 'matched',
    feedEmpty: feed.length === 0,
    clock,
    now,
    browsing: 6,
    inviteLeft: Math.max(0, state.inviteLeft),
    waitLeft: Math.max(0, state.waitLeft),
    waitPct: `${Math.max(0, Math.round((state.waitLeft / waitWindow) * 100))}%`,
    pendingName: pending?.name ?? '',
    declinedBy: state.declinedBy,
    feed,
    detail,
    showReasons: true,
    fProfile: state.fProfile,
    iProfile: state.iProfile,
    fProfileLabel: state.fProfile ? 'Hide AI meeting brief' : 'View AI meeting brief',
    iProfileLabel: state.iProfile ? 'Hide AI meeting brief' : 'View AI meeting brief',
    vc,
    founderStartup,
    meeting,
    apiMode,
    loading,
    error,
    join: () => { void join(); },
    leave: () => { void leave(); },
    skipFounder,
    skipInvestor,
    browse,
    open,
    closeDetail,
    pick: (id: string) => { void pick(id); },
    cancelPick: () => { void cancelPick(); },
    accept: () => { void accept(); },
    declineInvite: () => { void declineInvite(); },
    toggleFProfile: () => setState((current) => ({ ...current, fProfile: !current.fProfile })),
    toggleIProfile: () => setState((current) => ({ ...current, iProfile: !current.iProfile })),
    reset: () => { void reset(); },
  };
}
