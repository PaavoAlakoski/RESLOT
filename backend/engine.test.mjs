import assert from 'node:assert/strict';
import test from 'node:test';
import { MatchmakingEngine } from './engine.mjs';

const fakeAi = {
  mode: 'test',
  async rank(_vc, startups) {
    return startups.map((startup, index) => ({ startupId: startup.id, score: 10 - index, reason: `Fit ${index}` }));
  },
  async briefs() {
    const brief = { why: 'Relevant fit.', focus: 'Discuss traction.', concern: 'Validate sales.', opener: 'Why now?' };
    return { founder: brief, investor: brief };
  },
};

test('pool availability controls ranked candidates', async () => {
  const engine = new MatchmakingEngine({ ai: fakeAi });
  assert.equal((await engine.candidates('tundra-peak')).some((candidate) => candidate.id === '1'), false);
  engine.joinPool('1');
  assert.equal((await engine.candidates('tundra-peak')).some((candidate) => candidate.id === '1'), true);
  engine.leavePool('1');
  assert.equal((await engine.candidates('tundra-peak')).some((candidate) => candidate.id === '1'), false);
});

test('accepting an invite creates a meeting and removes startup from pool', async () => {
  const engine = new MatchmakingEngine({ ai: fakeAi, now: () => 1000 });
  engine.joinPool('1');
  const invite = engine.createInvite({ vcId: 'tundra-peak', startupId: '1' });
  const result = await engine.respondToInvite(invite.id, 'accepted');
  assert.equal(result.invite.status, 'accepted');
  assert.equal(result.meeting.location.table, '12B');
  assert.equal(result.meeting.briefs.founder.opener, 'Why now?');
  assert.equal(engine.pool.has('1'), false);
});

test('expired invites cannot be accepted', async () => {
  let clock = 1000;
  const engine = new MatchmakingEngine({ ai: fakeAi, now: () => clock });
  engine.joinPool('1');
  const invite = engine.createInvite({ vcId: 'tundra-peak', startupId: '1' });
  clock += 61000;
  await assert.rejects(() => engine.respondToInvite(invite.id, 'accepted'), /already expired/);
});
