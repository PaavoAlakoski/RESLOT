# Slush-style startup directory — mock data

`slush_startups_mock_data.json` contains 100 fictional, AI-generated startup
profiles shaped like an event-directory dataset (think: a "browse attending
companies" feature). It's meant as **seed/placeholder data to build and test
a website's UI against** — not real information about Slush 2026 or any real
company.

## Why this is fictional, not real

There is no public list of confirmed Slush 2026 exhibitors — that data lives
behind Slush's own attendee platform. And a startup's fundraising target is
essentially never public information. So instead of guessing at real
companies, founders, and funding numbers, every record here is synthetically
generated: invented company names, invented founder names, illustrated
placeholder avatars (not photos of real people), and funding figures sampled
from a plausible range for the assigned stage. Every record repeats this in
its own `funding_note` and `avatar_note` fields, and the file's top-level
`meta.disclaimer` says the same. **Don't publish this data as fact** — swap
it for real, sourced data before the site goes live (see "Swapping in real
data" below).

## File structure

```json
{
  "meta": {
    "disclaimer": "...",
    "generated": "2026-09-18",
    "record_count": 100,
    "schema_version": "1.0"
  },
  "startups": [ { ...one object per company... } ]
}
```

Each entry in `startups`:

| Field | Type | Notes |
|---|---|---|
| `id` | number | 1–100 |
| `company_name` | string | Invented, unique |
| `tagline` | string | Short one-liner |
| `description` | string | 1-sentence pitch |
| `industry` | string | One of 15 sectors (Climate & Energy, AI/ML, Fintech, Healthtech, Biotech, Robotics & Hardware, Developer Tools, Cybersecurity, Space & Deep Tech, Mobility & Logistics, Foodtech & Agtech, Future of Work/SaaS, EdTech, Consumer Apps, Web3/Crypto Infra) |
| `founded_year` | number | 2021–2025 |
| `hq_city` / `hq_country` | string | Drawn from cities Slush's real attendee pool typically spans |
| `founder.name` | string | Invented, unique |
| `founder.title` | string | e.g. "Co-Founder & CEO" |
| `founder.avatar_url` | string | Illustrated placeholder avatar ([DiceBear](https://www.dicebear.com/), deterministic per name — same name always renders the same avatar) |
| `funding_stage` | string | Pre-seed / Seed / Series A / Series B |
| `funding_seeking_usd` | number | **Fictional** figure, sampled from a realistic range for the stage |
| `website` | string | `https://{company}.example` — `.example` is the reserved placeholder TLD, so these never resolve or collide with a real domain |
| `logo_url` | string | Generated placeholder mark |

## Using it with a coding agent

This is meant to be dropped straight into a project, e.g.:

```
your-project/
  data/
    slush_startups_mock_data.json
```

Then point your agent at it: "use `data/slush_startups_mock_data.json` as
the mock data source for the startup directory / grid / cards on this page."
The avatar and logo URLs are live, publicly-hosted placeholder images, so
they'll render immediately in a browser with no extra setup — no need to
download or self-host anything to get a working UI.

## Swapping in real data later

When you're ready to move off placeholder data:

- **Real exhibitor list**: comes from Slush's own attendee/exhibitor
  platform (what the My Slush app is built on) — only accessible to
  registered attendees/exhibitors, not publicly scrapable.
- **Founder photos**: use each founder's own LinkedIn or company "About"
  page photo (link out or get permission before hosting a copy yourself).
- **Funding figures**: only include a number if the company has publicly
  announced it (a press release, TechCrunch article, or their own
  fundraising page) — otherwise leave the field blank/"undisclosed" rather
  than estimating.

The JSON schema above is designed to stay identical either way, so swapping
the data source shouldn't require changing your UI code.
