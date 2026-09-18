import assert from 'node:assert/strict';
import test from 'node:test';
import { AiService } from './ai.mjs';
import { startupProfiles, vcProfiles } from './repository.mjs';

test('OpenAI mode sends supplied profiles through Responses structured output and caches the score', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      async json() {
        return {
          output: [{
            type: 'message',
            content: [{
              type: 'output_text',
              text: JSON.stringify({ matches: [{ startupId: startupProfiles[0].id, score: 8, reason: 'Stage and thesis align.' }] }),
            }],
          }],
        };
      },
    };
  };

  const ai = new AiService({ apiKey: 'test-key', model: 'test-model', fetchImpl });
  const first = await ai.rank(vcProfiles[0], [startupProfiles[0]]);
  const second = await ai.rank(vcProfiles[0], [startupProfiles[0]]);

  assert.equal(first[0].score, 8);
  assert.deepEqual(second, first);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.openai.com/v1/responses');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer test-key');

  const request = JSON.parse(calls[0].init.body);
  assert.equal(request.model, 'test-model');
  assert.equal(request.store, false);
  assert.equal(request.text.format.type, 'json_schema');
  assert.equal(request.text.format.strict, true);
  assert.equal('tools' in request, false);
  assert.match(request.input, new RegExp(startupProfiles[0].companyName));
});
