import { dataMetadata, initialAvailableStartupIds, locations, startupProfiles, vcProfiles } from './repository.mjs';
import { AiService } from './ai.mjs';

export class MatchmakingEngine {
  constructor({ ai = new AiService(), now = () => Date.now() } = {}) {
    this.ai = ai;
    this.now = now;
    this.reset();
  }

  reset() {
    this.pool = new Set(initialAvailableStartupIds);
    this.invites = new Map();
    this.meetings = new Map();
    this.sequence = 0;
    return this.snapshot();
  }

  snapshot() {
    return {
      availableStartupIds: [...this.pool],
      invites: [...this.invites.values()],
      meetings: [...this.meetings.values()],
      aiMode: this.ai.mode,
      dataMetadata,
    };
  }

  findStartup(id) {
    const startup = startupProfiles.find((entry) => entry.id === id);
    if (!startup) throw Object.assign(new Error('Startup not found'), { status: 404 });
    return startup;
  }

  findVc(id) {
    const vc = vcProfiles.find((entry) => entry.id === id);
    if (!vc) throw Object.assign(new Error('VC not found'), { status: 404 });
    return vc;
  }

  joinPool(startupId) {
    const startup = this.findStartup(startupId);
    this.pool.add(startupId);
    return { startup, available: true };
  }

  leavePool(startupId) {
    const startup = this.findStartup(startupId);
    this.pool.delete(startupId);
    return { startup, available: false };
  }

  expireInvites() {
    const now = this.now();
    for (const invite of this.invites.values()) {
      if (invite.status === 'pending' && invite.expiresAt <= now) {
        invite.status = 'expired';
        invite.respondedAt = now;
      }
    }
  }

  async candidates(vcId) {
    this.expireInvites();
    const vc = this.findVc(vcId);
    const startups = startupProfiles.filter((startup) => this.pool.has(startup.id));
    const rankings = await this.ai.rank(vc, startups);
    const byId = new Map(startups.map((startup) => [startup.id, startup]));
    return rankings.map((ranking) => ({ ...byId.get(ranking.startupId), ...ranking }));
  }

  createInvite({ vcId, startupId, slot = '14:30', durationMinutes = 25 }) {
    this.expireInvites();
    this.findVc(vcId);
    this.findStartup(startupId);
    if (!this.pool.has(startupId)) throw Object.assign(new Error('Startup is no longer available'), { status: 409 });
    const duplicate = [...this.invites.values()].find((invite) => invite.vcId === vcId && invite.startupId === startupId && invite.status === 'pending');
    if (duplicate) return duplicate;

    const createdAt = this.now();
    const invite = {
      id: `invite-${++this.sequence}`,
      vcId,
      startupId,
      slot,
      durationMinutes,
      status: 'pending',
      createdAt,
      expiresAt: createdAt + 60000,
    };
    this.invites.set(invite.id, invite);
    return invite;
  }

  getInvite(id) {
    this.expireInvites();
    const invite = this.invites.get(id);
    if (!invite) throw Object.assign(new Error('Invite not found'), { status: 404 });
    return invite;
  }

  pendingInvites(startupId) {
    this.expireInvites();
    return [...this.invites.values()].filter((invite) => invite.startupId === startupId && invite.status === 'pending');
  }

  cancelInvite(id) {
    const invite = this.getInvite(id);
    if (invite.status !== 'pending') throw Object.assign(new Error('Only pending invites can be cancelled'), { status: 409 });
    invite.status = 'cancelled';
    invite.respondedAt = this.now();
    return invite;
  }

  async respondToInvite(id, decision) {
    const invite = this.getInvite(id);
    if (!['accepted', 'declined'].includes(decision)) throw Object.assign(new Error('Decision must be accepted or declined'), { status: 400 });
    if (invite.status !== 'pending') throw Object.assign(new Error(`Invite is already ${invite.status}`), { status: 409 });

    invite.status = decision;
    invite.respondedAt = this.now();
    if (decision === 'declined') return { invite, meeting: null };

    const vc = this.findVc(invite.vcId);
    const startup = this.findStartup(invite.startupId);
    this.pool.delete(startup.id);
    const location = locations[this.meetings.size % locations.length];
    const meetingId = `meeting-${this.meetings.size + 1}`;
    const briefs = await this.ai.briefs(vc, startup);
    const meeting = {
      id: meetingId,
      inviteId: invite.id,
      vc,
      startup,
      slot: invite.slot,
      durationMinutes: invite.durationMinutes,
      location,
      briefs,
      confirmedAt: this.now(),
    };
    invite.meetingId = meetingId;
    this.meetings.set(meetingId, meeting);
    return { invite, meeting };
  }

  getMeeting(id) {
    const meeting = this.meetings.get(id);
    if (!meeting) throw Object.assign(new Error('Meeting not found'), { status: 404 });
    return meeting;
  }
}
