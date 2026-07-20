# PRD — Service Operating Spine

**Product:** GPSSA Intelligence (Compass)  
**RFP:** GPSSA-016-2026 — Product & Service Development Roadmap and Quality Assurance Framework  
**Status:** Implementation target  
**Audience:** Bid leave-behind + engagement working file (not Ma’ashi/CRM SoR)

---

## 1. Problem

Compass has strong parallel modules (Services, QA, Fulfilment, Planning) but they are not one object. GPSSA asked on the call for **SOPs**, **back-office QA** (call-center style), and **launch discipline**. The RFP asks for runnable case/SLA/breach + QA → CAPA.

Without a linked spine, the app remains a **museum of screens**. Engagement Mode runs the *project*; it does not prove the *service* is operable end-to-end.

## 2. Goal

Make one click prove:

> **Episode → Journey → Process & SOP → Systems & Fulfilment → QA & Improvement**

for a real GPSSA service — as a leave-behind **configuration & assurance OS** (IT still owns systems).

## 3. Non-goals

- Live Ma’ashi / CRM / telephony integration
- Software / technical QA (explicitly out of RFP scope)
- Replacing Engagement Mode (keep as 20-week project path)
- Full SOP authoring IDE in v1

## 4. Success criteria

1. Home spine lights only nodes that have data for the selected service.
2. Selecting “End of Service – Civil” (gold path) lights all five nodes.
3. Blueprint page shows the chain with deep links into existing QA / Fulfilment screens.
4. Workshop demo: open case → SLA risk → QA fail → CAPA on the **same service id**.
5. Gold-seed banner remains honest on ops modules.

## 5. Information architecture

### 5.1 Five spine nodes

| Node | Meaning | Primary objects |
|---|---|---|
| **Episode** | Customer life event / request trigger | `CustomerEpisode` |
| **Journey** | Stages org + customer move through | `JourneyStage` |
| **Process & SOP** | How back office should run it | `OperatingProcess`, `SopDocument`, `SopStep` |
| **Systems & Fulfilment** | Where work sits | `BackofficeSystem`, `SLADefinition`, `ServiceCase`, `Breach` |
| **QA & Improvement** | Assure + fix | `QAScorecard`, `QAReview`, `Defect`, `CorrectiveAction` |

### 5.2 Anchor

Everything hangs off `GPSSAService.id`. Free-text `serviceName` / `serviceScope` remain for backward compatibility; gold path also sets `serviceId`.

### 5.3 New routes

| Route | Purpose |
|---|---|
| `/dashboard` | Home includes **Operating Spine** (primary visual when Engagement Mode closed; secondary strip when open) |
| `/dashboard/services/operating` | Service picker → blueprints |
| `/dashboard/services/operating/[serviceId]` | **Service Operating Blueprint** |

### 5.4 APIs

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/spine/services` | Services that have spine coverage + lit-node flags |
| GET | `/api/spine/[serviceId]` | Full graph payload for one service |
| GET | `/api/spine/[serviceId]/summary` | Counts for home strip (cases, SOP steps, CAPAs, …) |

## 6. Data model (v1)

### New models

- `CustomerEpisode` — `serviceId`, `name`, `description`, `sortOrder`
- `JourneyStage` — `serviceId`, `episodeId?`, `name`, `actor` (customer|agent|system), `sortOrder`, `outcome?`
- `OperatingProcess` — `serviceId`, `name`, `description?`, `ownerHint?`
- `SopDocument` — `processId`, `version`, `title`, `status` (draft|active)
- `SopStep` — `sopId`, `sortOrder`, `title`, `instruction`, `qaCheckpoint?` (bool / text)
- `BackofficeSystem` — `code`, `name`, `kind` (core|crm|channel|other)
- `ProcessSystemLink` — `processId`, `systemId`, `role` (system-of-record|intake|notify|…)
- `StageProcessLink` — `stageId`, `processId`

### Additive FKs (nullable)

- `QAScorecard.serviceId` → `GPSSAService`
- `SLADefinition.serviceId` → `GPSSAService`
- `ServiceCase.serviceId` → `GPSSAService`
- `Defect.serviceId` → `GPSSAService`
- `QAReview.caseId` → `ServiceCase` (optional)

## 7. Gold-path seed

**Service:** End of Service – Civil (resolve/create catalog row; stable id `svc-eos-civil`).

Populate:

1. Episode: “Member claims end-of-service benefits”
2. Journey stages: Apply → Documents → Manual review → Decision → Payment / notify
3. Process + SOP v1.0 with ≥5 steps including ≥2 QA checkpoints
4. Systems: Ma’ashi (SoR), CRM, Portal
5. SLA gold + 3–5 cases (one near-breach / breach)
6. Active scorecard scoped to serviceId + 2 reviews (one fail) + defect + CAPA
7. Wire review.caseId where possible

## 8. UX specs

### 8.1 Home Operating Spine

- Full-bleed horizontal spine (5 nodes + connectors).
- Service selector (default gold path).
- Hover/click node: highlight node + edges that exist; dim others.
- Strip under spine: live counts from summary API.
- CTA: **Open blueprint** → `/dashboard/services/operating/[id]`.
- When Engagement Mode open: compact spine under header or side column (do not remove Engagement Mode).

### 8.2 Service Operating Blueprint

Single page, five sections matching spine nodes. Each section:

- Short definition
- List of entities (stages, SOP steps, systems, cases, CAPAs)
- Deep link into existing module where relevant

Top: service name, category, gold-seed badge if applicable.

### 8.3 Navigation

- Sidebar Services: add **Operating Blueprint**
- Catalog: chip/link “View operating spine” on gold-path service

## 9. Implementation phases (this delivery)

| Phase | Deliverable |
|---|---|
| A | PRD (this doc) |
| B | Schema + migration |
| C | Seed gold path |
| D | Spine APIs |
| E | Blueprint page |
| F | Home spine visual |
| G | Nav wiring |

## 10. Risks

| Risk | Mitigation |
|---|---|
| Looks “live” with seed | Keep DemoDataBanner; label gold path |
| Scope explosion | One service fully lit; others may show partial nodes |
| Migration on Railway | Additive nullable columns + new tables only |

## 11. Out of scope follow-ups

- CSV import for SOPs
- Multi-service bulk spine editor
- Real-time aging from Ma’ashi
- Launch-readiness checklist wizard (v1.1)
