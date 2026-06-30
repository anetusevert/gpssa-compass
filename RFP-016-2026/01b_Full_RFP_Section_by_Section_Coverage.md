# RFP #GPSSA-016-2026 — **Entire RFP** vs. the `gpssa-compass` Application

**Companion to Document 1** · Prepared 30 June 2026
**Scope:** every numbered section of the RFP (§1–§5 + commercial/submission/T&Cs), not just Project Scope (§2).

---

## 0. The one thing to understand first

The RFP contains **two very different kinds of clause**, and they must be judged differently:

| Clause type | What it asks for | Right question | Verdict scale used below |
|---|---|---|---|
| **A. Scope / deliverable requirements** (§1.3 objectives, §2 scope, §2.3 phases, §2.4 services) | Substantive consulting *content* the engagement must produce | *Does the app already embody this?* | ✅ In · 🟡 Partial · ❌ Not in |
| **B. Bid-process / commercial / legal clauses** (§2.5–2.6, §3, §4, §5) | How to *write, price, submit and contract* the proposal | *Is this an app feature at all?* | ⚪ N/A (proposal/legal) — with notes where the app still helps |

> **Headline:** The app is a strong fit for the **Type-A scope content of Workstream A**, a weak fit for **Workstream B (QA)**, and is — correctly — **N/A for most of the Type-B bid/legal machinery** (§3–§5), which lives in the proposal document, not the software. A handful of Type-B clauses (presentations, info-security posture) have a real app angle, flagged below.
>
> **Context discovery:** the app was built to answer the **prior RFI 02-2026**, whose Workstream A/B structure (encoded in [rfi-sections.ts](src/lib/mandate/rfi-sections.ts)) closely matches this RFP. So the *strategy/narrative* layer is well-aligned; the *operational build* (QA engine, case/SLA, live CX) is not.

---

## 1. §1 — Introduction & Project Background

| RFP ref | Requirement | Verdict | Evidence / gap |
|---|---|---|---|
| §1.1 General & Legal | UAE law, GPSSA mandate (Federal Law 6 & 7 of 1999) | ✅ In (context) | Mandate suite: [mandate/legal](src/app/dashboard/mandate/legal), [mandate/scope](src/app/dashboard/mandate/scope), [mandate/obligations](src/app/dashboard/mandate/obligations) |
| §1.2 About GPSSA | Federal pension authority profile | ✅ In (context) | [mandate/overview](src/app/api/mandate/overview), scraped GPSSA pages ([scripts/scrape-gpssa.ts](scripts/scrape-gpssa.ts)) |
| **§1.3 Project Objectives** (6 bullets) | The actual mission of the engagement | 🟡 **Partial** | See objective-by-objective table below |
| §1.4 Current Status | Benefits-realisation review + next-wave planning; names pain points (breaches, backlog, rework, exceptions, weak visibility, fragmented governance) | 🟡 **Partial** | Service diagnostic captures pain points narratively; **no benefits-realisation tracker** and **no operational data** for breaches/backlog/rework |

### §1.3 Project Objectives — mapped one by one

| # | Objective | Verdict | Where / gap |
|---|---|---|---|
| 1 | Assess current service/product/operational/fulfilment/control environment | 🟡 Partial | Service + product diagnostics ✅; operational/fulfilment/**control** environment ❌ |
| 2 | Validate benefits realised + identify remaining gaps/risks/optimisation | ❌ Not in | No benefits-realisation model; Risk register ✅ exists but not initiative-benefits-linked |
| 3 | **Design integrated end-to-end QA & service-fulfilment improvement framework** | ❌ Not in | The core Workstream-B objective — absent (see Document 2 for the design) |
| 4 | Identify & prioritise opportunities (enhancements, new/internal products, innovation, cross-entity bundles) | ✅ In | `Opportunity` + `Product`/`ProductInnovation`; prioritisation attributes present |
| 5 | Develop practical 12-month Product & Service Development Roadmap | ✅ In | `RoadmapPhase`/`RoadmapInitiative` |
| 6 | Define governance, KPI/KQI, operating model, implementation roadmap, capability transfer | 🟡 Partial | Generic `KPI` + roadmap ✅; **KQI, QA governance, RACI, capability-transfer** ❌ |

---

## 2. §2 — Project Scope

| RFP ref | Requirement | Verdict | Note |
|---|---|---|---|
| §2.1 Project Requirements (9 items) | — | **see Document 1 §3.1** | A=~60% / B=~12% |
| §2.2 Expected Outcomes (6 items) | — | **see Document 1 §3.2** | — |
| **§2.3 Phases** (Workstream A: 6 phases, Wks 1–20; Workstream B: 5 phases, Wks 1–20) | A schedule the bid must commit to and the app should model | 🟡 **Partial** | `RoadmapPhase` model *can* hold these, but the **two-workstream, week-banded phase plan is not seeded/built**. The roadmap is generic, not the RFP's A1–A6 / B1–B5 timeline. |
| §2.4 Service catalogue (35) | — | ✅ **In (superset)** | **41 services** seeded ([prisma/seed.ts](prisma/seed.ts)); GPSSA's own Ma'ashi count is 30 — reconcile at kickoff |
| §2.5 Commercial Breakdown (per-phase BOQ + VAT) | Priced table per phase, both workstreams | ⚪ N/A (commercial) | Belongs in the **Commercial Proposal**, not the app. App has no costing module. |
| §2.6 Payment Schedule (AED, 45-day terms, firm-fixed-price) | Milestone-linked payment terms | ⚪ N/A (commercial) | Proposal/contract content |

---

## 3. §3 — Selection Process

| RFP ref | Requirement | Verdict | How the app relates |
|---|---|---|---|
| §3.1 Selection Criteria (weighted: Understanding 15 / Methodology 20 / Experience 10 / Team 10 / Deliverables 15 / **Price 30**) | The scoring rubric the bid is judged on | ⚪ N/A (evaluation) — **but app is strong evidence** | The app *demonstrates* Understanding (15), Methodology (20) and Deliverables/Implementation (15) — **50% of the technical score** — via the diagnostic, opportunity backlog, concept sheets, roadmap and benchmarking. It does **not** affect Price (30) or Experience/Team (20). |
| §3.2 Evaluation (committee, negotiation, disqualification) | Process | ⚪ N/A | — |

> Note: the app's admin **scoring** module ([dashboard/admin/scoring](src/app/dashboard/admin/scoring)) scores *international benchmarking institutions*, **not** this RFP's bid evaluation — different purpose.

---

## 4. §4 — Instructions for Submission

| RFP ref | Requirement | Verdict | Note |
|---|---|---|---|
| §4.1 Schedule (release 24-06; queries 26-06; answers 30-06; **proposal due 09-07-2026 ≤ 03:30 PM**) | Hard deadlines | ⚪ N/A (process) | ⚠️ Tight: ~2 weeks. Body text also says "no later than Nov 2026" — an internal inconsistency in the RFP to clarify via query. |
| §4.2 Submission portal (ierp.gpssa.gov.ae) | Upload mechanism | ⚪ N/A | — |
| §4.1/4.2 Bidder queries / responses (Online Discussion) | Q&A process | ⚪ N/A | — |
| §4.3 Deliverables (separate signed/stamped PDFs, named `TECHNICAL PROPOSAL – RFP#GPSSA-016-2026-` / `COMMERCIAL …`) | File format & naming | ⚪ N/A — **app helps** | The **briefing module exports PDF** (jspdf/html2canvas) and could generate technical-proposal visuals, but the formal signed PDF is a document task. |
| §4.4 Presentations (shortlist, **max 90 min**, scored) | A live solution presentation | 🟡 **Partial (real app angle)** | The app's **executive briefing deck** ([components/briefing/slides](src/components/briefing/slides)) — Cover, Evidence, Atlas, Global Benchmarks, Quadrant, Decision, Closing — is a ready-made presentation vehicle. Would need new slides for Workstream-B QA. |
| §4.5 Prime / Secondary vendors (one consortium only) | Teaming rules | ⚪ N/A | — |
| §4.6 General Conditions (Project Definition, Company Profile, customer references, **team resumes**, Project Approach & plan) | Required proposal content/sequence | ⚪ N/A — **partial app data** | App has `CustomerPersona`/users/avatars but **no company-profile / references / CV module**; these are proposal-authoring tasks. |
| §4.7 Financial Arrangement (per-phase breakdown, **90-day validity**) | Pricing detail & validity | ⚪ N/A (commercial) | — |
| §4.8 Proposal Presentation (committee may request) | Process | ⚪ N/A | Same briefing-deck angle as §4.4 |
| §4.9 Condition Statement & Officer Signature | Signed compliance statement | ⚪ N/A (legal) | — |

---

## 5. §5 — Essential Terms & Conditions

| RFP ref | Requirement | Verdict | Note |
|---|---|---|---|
| §5.1 GPSSA Rights (reject/cancel/waive) | Buyer rights | ⚪ N/A (legal) | — |
| §5.2 Proposal Expenses (bidder bears all) | — | ⚪ N/A | — |
| §5.3 Formal Agreement | Offer/award mechanics | ⚪ N/A | — |
| §5.4 Governing Laws (UAE/Emirate) | — | ⚪ N/A | — |
| §5.5 Violations (reporting channels) | — | ⚪ N/A | — |
| §5.6 Sufficiency of Proposal (bidder verifies all info; "best-suited" summary, 2 pages) | Responsibility & a 2-page summary | ⚪ N/A | Proposal-authoring task |
| **§5.7 Business Continuity** (6 items: BC plan, NCEMA-aligned policy, RTO/RPO, **≤24h restoration**, **compensation ≥ 2× contract value**) | Service-provider BC commitments | ⚪ N/A (app) — **build for proposal** | Not an app feature; the *service provider* must commit a BC plan. App itself has **no BC/DR module**; deployment posture (Railway/Next standalone) is not a BC programme. |
| **§5.8 Information Security** (5 items: data protection, incident reporting, audit rights, **compensation ≥ 2× contract value** for breaches) | Service-provider InfoSec commitments | 🟡 **Partial (app posture only)** | App has **auth (NextAuth) + password hashing (bcryptjs)** and role/admin separation ✅ — a baseline. But **no formal InfoSec controls, audit logging beyond an `Activity` model, data-protection tooling, or incident process**. The clause is mainly a *contractual commitment* for the proposal, not an app feature. |

---

## 6. Results summary — the whole RFP in one view

```
RFP SECTION                          APP COVERAGE
─────────────────────────────────────────────────────────────────────
§1.3 Objectives (the mission)        🟡 Partial  (4 of 6 objectives have app support;
                                                  QA-framework + benefits-realisation absent)
§2.1 Project Requirements            🟡 ~40%     (Workstream A strong, B near-zero)
§2.2 Expected Outcomes               🟡 ~45%
§2.3 Phase plan (A6 + B5)            🟡 Partial  (model exists; plan not built)
§2.4 Service catalogue (35)          ✅ In       (41 seeded)
§2.5–2.6 Commercial / Payment        ⚪ N/A      (commercial proposal)
§3 Selection / Evaluation            ⚪ N/A      (but app evidences ~50% of technical score)
§4 Submission instructions           ⚪ N/A      (one real angle: briefing deck → §4.4 presentation)
§5.1–5.6 Legal T&Cs                  ⚪ N/A      (proposal/legal)
§5.7 Business Continuity             ⚪ N/A      (no BC module; proposal commitment)
§5.8 Information Security            🟡 Partial  (auth/hashing baseline only)
─────────────────────────────────────────────────────────────────────
```

**Net result across the entire RFP:**
- **Substantive scope (Type A):** the app **delivers Workstream A** (roadmap, opportunities, products, benchmarking, diagnostic, service catalogue) and **largely objectives 4 & 5**, but is **missing the QA framework (objective 3), benefits-realisation (objective 2), and the governance/KQI/RACI/capability-transfer layer (objective 6)** — i.e., the same Workstream-B gap as Document 1.
- **Bid machinery (Type B):** §2.5–§5 are **correctly outside the app's job**; they are proposal-authoring, pricing and legal commitments. Two have a genuine app angle worth exploiting — the **briefing deck for the §4.4 presentation**, and the **auth/hashing baseline toward §5.8**.

**Action implications:**
1. **Build Workstream B** (QA + fulfilment module) — the only way to move objective 3 and §2.1 items 4 & 6 from ❌/🟡 to ✅.
2. **Seed the §2.3 two-workstream phase plan** into the existing roadmap so the app mirrors the RFP timeline.
3. **Add a benefits-realisation tracker** (objective 2 / §1.4) — initiative baseline→target→actual.
4. **Extend the briefing deck** with Workstream-B slides for the §4.4 presentation.
5. Treat §2.5–2.6, §3, §4.6–4.9, §5 as **proposal-document** work — not app build.

---

*Companion documents: **01 — RFP Coverage & Gap Analysis** (Workstream depth) · **02 — End-to-End QA & Service Fulfilment Framework Research** (the global design for the missing Workstream B).*
