const NORDIC_BALTIC_COUNTRIES = new Set(['Finland', 'Sweden', 'Norway', 'Denmark', 'Iceland', 'Estonia', 'Latvia', 'Lithuania']);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function deterministicScore(vc, startup) {
  let score = 1;
  const reasons = [];
  const industryText = `${startup.industry} ${startup.tagline}`.toLowerCase();
  const thesisText = `${vc.thesis} ${vc.industries.join(' ')}`.toLowerCase();

  if (vc.stageFocus.includes(startup.stage)) {
    score += 2;
    reasons.push(`${startup.stage} matches the fund's stage focus`);
  }
  if (vc.industries.includes(startup.industry)) {
    score += 3;
    reasons.push(`${startup.industry.toLowerCase()} is a core thesis area`);
  } else if (industryText.includes('industrial') && thesisText.includes('industrial')) {
    score += 2;
    reasons.push('the industrial software angle overlaps the thesis');
  }
  if (NORDIC_BALTIC_COUNTRIES.has(startup.country)) {
    score += 1.5;
    reasons.push(`${startup.country} fits the Nordic/Baltic geography`);
  }
  if (startup.seekingUsd >= vc.checkSizeUsd.min && startup.seekingUsd <= vc.checkSizeUsd.max) {
    score += 1.5;
    reasons.push('the raise sits inside the stated cheque range');
  }
  if (vc.previousInvestments.some((investment) => investment.industry === startup.industry)) {
    score += 1;
    reasons.push('the sector matches prior portfolio experience');
  }
  if (startup.industry === 'Robotics & Hardware') {
    score -= 0.5;
    reasons.push('hardware intensity is a point to validate');
  }
  if (startup.industry === 'Consumer Apps') {
    score -= 2;
    reasons.push('consumer subscriptions sit outside the stated focus');
  }

  const rounded = Math.round(clamp(score, 1, 10));
  return {
    startupId: startup.id,
    score: rounded,
    reason: reasons.length > 0
      ? `${reasons.slice(0, 3).join('; ')}.`.replace(/^./, (letter) => letter.toUpperCase())
      : 'Limited overlap with the supplied investment profile.',
  };
}

function deterministicBriefs(vc, startup) {
  const priorSectorInvestment = vc.previousInvestments.find((investment) => investment.industry === startup.industry);
  const raise = `$${(startup.seekingUsd / 1000000).toFixed(1)}M`;
  const portfolioContext = priorSectorInvestment
    ? ` and has prior ${startup.industry.toLowerCase()} experience through ${priorSectorInvestment.company_name}`
    : '';

  return {
    founder: {
      why: `${vc.firmName} invests at ${startup.stage.toLowerCase()} stage, lists ${startup.industry} as a focus${portfolioContext}.`,
      focus: `Lead with the customer impact behind “${startup.tagline}” and explain what the ${raise} raise will unlock.`,
      concern: startup.industry.includes('Hardware')
        ? 'Be ready to explain capital needs and the recurring software moat.'
        : 'Be ready to validate customer urgency and how repeatable adoption will be.',
      opener: `Ask which milestone ${vc.firmName} would need to see before leading this round.`,
    },
    investor: {
      why: `${startup.companyName} matches the fund's ${startup.stage.toLowerCase()} and ${startup.industry} focus${portfolioContext}.`,
      focus: `Test the evidence behind “${startup.tagline}” and how the ${raise} raise advances the next milestone.`,
      concern: startup.industry.includes('Hardware')
        ? 'Validate manufacturing economics and whether software creates durable margins.'
        : 'Validate customer urgency and whether adoption can repeat across accounts.',
      opener: `Which customer behavior best proves that ${startup.companyName} is solving an urgent problem?`,
    },
  };
}

const rankingSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['matches'],
  properties: {
    matches: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['startupId', 'score', 'reason'],
        properties: {
          startupId: { type: 'string' },
          score: { type: 'integer', minimum: 1, maximum: 10 },
          reason: { type: 'string' },
        },
      },
    },
  },
};

const briefSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['founder', 'investor'],
  properties: {
    founder: { $ref: '#/$defs/brief' },
    investor: { $ref: '#/$defs/brief' },
  },
  $defs: {
    brief: {
      type: 'object',
      additionalProperties: false,
      required: ['why', 'focus', 'concern', 'opener'],
      properties: {
        why: { type: 'string' },
        focus: { type: 'string' },
        concern: { type: 'string' },
        opener: { type: 'string' },
      },
    },
  },
};

function responseText(payload) {
  return payload.output
    ?.flatMap((item) => item.type === 'message' ? item.content ?? [] : [])
    .find((content) => content.type === 'output_text')?.text;
}

export class AiService {
  constructor({ apiKey = process.env.OPENAI_API_KEY, model = process.env.OPENAI_MODEL || 'gpt-4.1-mini', fetchImpl = fetch } = {}) {
    this.apiKey = apiKey;
    this.model = model;
    this.fetchImpl = fetchImpl;
    this.scoreCache = new Map();
    this.briefCache = new Map();
    this.stats = {
      rankingRequests: 0,
      briefRequests: 0,
      fallbacks: 0,
      lastError: null,
    };
  }

  get mode() {
    return this.apiKey ? `openai:${this.model}` : 'deterministic-fallback';
  }

  async structured(name, schema, instructions, input) {
    const response = await this.fetchImpl('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        store: false,
        instructions,
        input: JSON.stringify(input),
        text: { format: { type: 'json_schema', name, strict: true, schema } },
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed (${response.status})`);
    }
    const payload = await response.json();
    const text = responseText(payload);
    if (!text) throw new Error('OpenAI response did not contain output text');
    return JSON.parse(text);
  }

  async rank(vc, startups) {
    const cached = [];
    const missing = [];
    for (const startup of startups) {
      const key = `${vc.id}:${startup.id}`;
      const value = this.scoreCache.get(key);
      if (value) cached.push(value);
      else missing.push(startup);
    }

    let generated = [];
    if (missing.length > 0 && this.apiKey) {
      try {
        this.stats.rankingRequests += 1;
        const result = await this.structured(
          'live_match_rankings',
          rankingSchema,
          'Evaluate investment compatibility only. Use only explicit fields in the supplied VC and startup profiles. Do not browse, infer team quality, traction, readiness, technical background, customer behavior, or any other missing fact. Do not judge generic startup quality. Every reason must cite explicit profile evidence. Return one result for every supplied startup with a 1-10 fit score and a short evidence-based reason.',
          { vc, startups: missing },
        );
        const allowed = new Set(missing.map((startup) => startup.id));
        generated = result.matches.filter((match) => allowed.has(match.startupId));
      } catch (error) {
        this.stats.fallbacks += 1;
        this.stats.lastError = error.message;
        console.warn(`[ai] Ranking fallback: ${error.message}`);
      }
    }

    const generatedById = new Map(generated.map((match) => [match.startupId, match]));
    for (const startup of missing) {
      const generatedMatch = generatedById.get(startup.id);
      const match = generatedMatch
        ? { ...generatedMatch, source: 'openai', model: this.model }
        : { ...deterministicScore(vc, startup), source: 'fallback', model: null };
      this.scoreCache.set(`${vc.id}:${startup.id}`, match);
      cached.push(match);
    }
    return cached.sort((a, b) => b.score - a.score);
  }

  async briefs(vc, startup) {
    const key = `${vc.id}:${startup.id}`;
    if (this.briefCache.has(key)) return this.briefCache.get(key);

    let result;
    let source = 'fallback';
    if (this.apiKey) {
      try {
        this.stats.briefRequests += 1;
        result = await this.structured(
          'live_match_briefs',
          briefSchema,
          'Create separate preparation briefs for a founder and investor. Use only explicit supplied profile facts. Never infer team background, traction, willingness, readiness, customer behavior, or other missing facts; phrase unknowns only as questions to validate. Each brief must be readable in 10-15 seconds, synthesize the fit, and include one focus, one concern to validate, and one useful opening question. Do not browse or invent facts.',
          { vc, startup },
        );
        source = 'openai';
      } catch (error) {
        this.stats.fallbacks += 1;
        this.stats.lastError = error.message;
        console.warn(`[ai] Brief fallback: ${error.message}`);
      }
    }
    result ??= deterministicBriefs(vc, startup);
    const resultWithMeta = {
      ...result,
      meta: { source, model: source === 'openai' ? this.model : null },
    };
    this.briefCache.set(key, resultWithMeta);
    return resultWithMeta;
  }
}
