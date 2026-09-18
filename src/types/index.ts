export type FounderProfile = {
  id: string;
  name: string;
  score: number;
  seeking: string;
  initials: string;
  founder: string;
  role: string;
  blurb: string;
  reason: string;
  chips: string[];
  long: string;
  scoreSource?: 'openai' | 'fallback';
  scoreModel?: string | null;
};

export type Chip = { label: string };

export type DecoratedFounder = Omit<FounderProfile, 'chips'> & {
  scoreColor: string;
  chips: Chip[];
  isNew: boolean;
  open: () => void;
  pick: () => void;
};

export type FounderStage = 'alert' | 'pool' | 'matched';
export type InvestorStage = 'alert' | 'feed' | 'waiting' | 'matched';

export type MatchmakingState = {
  fStage: FounderStage;
  iStage: InvestorStage;
  joined: boolean;
  detailId: string | null;
  invited: boolean;
  inviteLeft: number;
  pendingId: string | null;
  waitLeft: number;
  declinedBy: string | null;
  secs: number;
  fProfile: boolean;
  iProfile: boolean;
  justJoined: boolean;
};
