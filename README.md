# GPSSA Intelligence (Compass)

Strategic + operational intelligence platform for GPSSA’s Product & Service Development Roadmap — dual workstream (strategy and operational excellence). Built for the project team to run daily and leave with the customer.

Powered by Arthur D. Little.

---

## How to use this for the project

Read **[docs/PROJECT_PLAYBOOK.md](docs/PROJECT_PLAYBOOK.md)** first.

Compass is the engagement working file for **RFP GPSSA-016-2026** — three jobs only: diagnose the estate, decide the roadmap, design/pilot QA & fulfilment. Start on Home → **Engagement Mode** (Discover). Sidebar **Focus** mirrors the current phase; **All modules** shows the full rail. Ops modules show a **Gold seed** banner until client evidence is imported (Data & Sources).

## Roles

| Role | Can |
|------|-----|
| **viewer** | Browse all dashboards, briefing, tour (default demo account) |
| **editor** | Mutate ops data (QA, fulfilment, backlog fields) — not research agents |
| **admin** | Full access including AI research agents and user admin |
| **user** (legacy) | Treated as editor |

Research APIs that start agents require **admin**.

---

## Local setup

```bash
npm install
cp .env.example .env
# Edit DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
# Set SEED_ADMIN_PASSWORD and SEED_DEMO_PASSWORD before any shared deploy
npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed credentials (env)

| Variable | Purpose |
|----------|---------|
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Admin account |
| `SEED_DEMO_PASSWORD` | Shared demo login (`demo@gpssa.local`, role=viewer) |
| `SEED_EDITOR_EMAIL` / `SEED_EDITOR_PASSWORD` | Optional editor |

If seed password env vars are unset, seed keeps legacy fallbacks and prints a warning. **Set and rotate `SEED_*_PASSWORD` before customer handover.**

### Gold offline dataset

Seed always attempts to hydrate:

- Minimal mandate corpus from [`prisma/seeds/gpssa-corpus.json`](prisma/seeds/gpssa-corpus.json)
- Peer institutions + benchmark scores
- Service × channel capability matrix (gold heatmap)
- QA, fulfilment, KPI/VoC, roadmap/RACI (Workstream B)

Refresh a fuller live corpus (optional):

```bash
npx tsx scripts/scrape-gpssa.ts
npm run db:seed
```

---

## Railway deploy

1. Connect the GitHub repo; build uses `railway.json` (`npm run build`, Prisma push + seed on start).
2. Set env: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, seed passwords, `OPENAI_API_KEY` (only if agents will run).
3. Custom domain: use **www** (e.g. `www.gpssaintelligence.ae` → Railway).  
   Apex `gpssaintelligence.ae` must also point at Railway — otherwise visitors hit a stale host.

---

## Gold demo checklist (cold board pitch)

1. Fresh seed completed; agents **not** running  
2. Login as **viewer** (demo) — Admin nav hidden  
3. Home command theater loads without scroll at 1280×800  
4. Executive Briefing — all 12 slides show numbers (Mandate, Atlas, Diagnose, Roadmap)  
5. QA / Fulfilment / Planning populated  
6. Unauthenticated `POST /api/research/run-all` returns **401**  
7. Home → **Engagement Mode** (journey spine + What / How / Value)

Smoke script (with app running + session cookie, or against local after login tooling):

```bash
npx tsx scripts/smoke-gold.ts
```

---

## Research agents (admin only)

- Control center: `/dashboard/admin/agents`  
- Pause by default for demos; run pillars only when refreshing evidence.  
- Cost: gated behind admin + OpenAI key; do not expose research routes publicly (guards enforced).

---

## Leave-behind video

Script + shot list: [`docs/video/LEAVE_BEHIND_SCRIPT.md`](docs/video/LEAVE_BEHIND_SCRIPT.md)

1. Capture UI with OBS (gold seed)  
2. Assemble in CapCut (free, 1080p)  
3. Export to `public/videos/compass-leave-behind.mp4`  
4. Optional leave-behind MP4 at `public/videos/compass-leave-behind.mp4` (ops/docs only — not linked from Home)

---

## Stack

- Next.js 14 (App Router) · Prisma · PostgreSQL · NextAuth · Framer Motion · OpenAI (agents)
