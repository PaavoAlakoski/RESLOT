export type ApiStartup = {
  id: string;
  companyName: string;
  founder: string;
  role: string;
  initials: string;
  logoUrl: string;
  photoUrl: string;
  industry: string;
  tagline: string;
  stage: string;
  city: string;
  country: string;
  seekingUsd: number;
  description: string;
  website: string;
};

export type RankedStartup = ApiStartup & {
  startupId: string;
  score: number;
  reason: string;
  source: 'openai' | 'fallback';
  model: string | null;
};

export type ApiVc = {
  id: string;
  firmName: string;
  partner: string;
  role: string;
  initials: string;
  photoUrl: string;
  partners: Array<{ name: string; title: string; initials: string; photoUrl: string }>;
  thesis: string;
  stageFocus: string[];
  industries: string[];
  geographies: string[];
  checkSizeUsd: { min: number; max: number };
  previousInvestments: Array<{ company_name: string; industry: string }>;
  avoids: string[];
};

export type MeetingBrief = {
  why: string;
  focus: string;
  concern: string;
  opener: string;
};

export type Meeting = {
  id: string;
  slot: string;
  durationMinutes: number;
  location: { table: string; hall: string };
  vc: ApiVc;
  startup: ApiStartup;
  briefs: {
    founder: MeetingBrief;
    investor: MeetingBrief;
    meta: { source: 'openai' | 'fallback'; model: string | null };
  };
};

export type Invite = {
  id: string;
  vcId: string;
  startupId: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
  expiresAt: number;
};

const API_URL = import.meta.env.VITE_LIVE_MATCH_API_URL || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `API request failed (${response.status})`);
  return payload as T;
}

export const liveMatchApi = {
  health: () => request<{
    ok: boolean;
    aiMode: string;
    aiStats: { rankingRequests: number; briefRequests: number; fallbacks: number; lastError: string | null };
  }>('/health'),
  reset: () => request<{ aiMode: string }>('/demo/reset', { method: 'POST' }),
  startup: (id: string) => request<ApiStartup>(`/startups/${id}`),
  vc: (id: string) => request<ApiVc>(`/vcs/${id}`),
  joinPool: (startupId: string) => request('/pool/join', {
    method: 'POST',
    body: JSON.stringify({ startupId }),
  }),
  leavePool: (startupId: string) => request(`/pool/${startupId}`, { method: 'DELETE' }),
  candidates: (vcId: string) => request<{ candidates: RankedStartup[]; aiMode: string }>(`/vcs/${vcId}/candidates`),
  invite: (vcId: string, startupId: string) => request<Invite>('/invites', {
    method: 'POST',
    body: JSON.stringify({ vcId, startupId, slot: '14:30', durationMinutes: 25 }),
  }),
  respond: (inviteId: string, decision: 'accepted' | 'declined') => request<{ invite: Invite; meeting: Meeting | null }>(`/invites/${inviteId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ decision }),
  }),
  cancelInvite: (inviteId: string) => request<Invite>(`/invites/${inviteId}/cancel`, { method: 'POST' }),
};
