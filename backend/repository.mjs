import { readFileSync } from 'node:fs';

const startupsDocument = JSON.parse(readFileSync(new URL('../mockdata/mock_startups.json', import.meta.url), 'utf8'));
const vcDocument = JSON.parse(readFileSync(new URL('../mockdata/mock_investor.json', import.meta.url), 'utf8'));

function initials(name) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export const startupProfiles = startupsDocument.startups.map((startup) => ({
  id: String(startup.id),
  companyName: startup.company_name,
  founder: startup.founder.name,
  role: startup.founder.title,
  initials: initials(startup.founder.name),
  logoUrl: startup.logo_url,
  photoUrl: startup.founder.photo_url,
  industry: startup.industry,
  tagline: startup.tagline,
  stage: startup.funding_stage,
  city: startup.hq_city,
  country: startup.hq_country,
  seekingUsd: startup.funding_seeking_usd,
  description: startup.description,
  website: startup.website,
}));

// Firm #1 (Tundra Peak Ventures) keeps its existing short slug for backward
// compatibility with VC_ID='tundra-peak' already hardcoded in the frontend,
// tests and docs. Every other firm gets a slug derived from its name.
export const vcProfiles = vcDocument.firms.map((rawVc) => {
  const leadPartner = rawVc.partners[0];
  return {
    id: rawVc.id === 1 ? 'tundra-peak' : slugify(rawVc.firm_name),
    firmName: rawVc.firm_name,
    partner: leadPartner.name,
    role: leadPartner.title,
    initials: initials(leadPartner.name),
    photoUrl: leadPartner.photo_url,
    partners: rawVc.partners.map((p) => ({
      name: p.name,
      title: p.title,
      initials: initials(p.name),
      photoUrl: p.photo_url,
    })),
    thesis: rawVc.investment_thesis.description,
    stageFocus: rawVc.investment_thesis.stage_focus,
    industries: rawVc.investment_thesis.industries,
    geographies: rawVc.investment_thesis.geographies,
    checkSizeUsd: {
      min: rawVc.check_size_usd.typical_min,
      max: rawVc.check_size_usd.typical_max,
    },
    previousInvestments: rawVc.previous_investments,
    avoids: rawVc.investment_thesis.avoids,
  };
});

// Availability is live state rather than a property of the directory dataset.
// These IDs deliberately include strong, middling, and weak profile fits.
export const initialAvailableStartupIds = ['2', '9', '20', '29', '30', '36', '43', '54'];

export const locations = [
  { table: '12B', hall: 'Meeting area' },
  { table: '8A', hall: 'Meeting area' },
  { table: '21C', hall: 'Meeting area' },
];

export const dataMetadata = {
  startups: startupsDocument.meta,
  vc: vcDocument.meta,
};
