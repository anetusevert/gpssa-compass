# RFP #GPSSA-016-2026 — Coverage & Gap Analysis vs. the `gpssa-compass` Application

**Document 1 of 2** · Prepared 30 June 2026
**Subject:** "Product & Service Development Roadmap and Quality Assurance Framework"
**Assessed against:** the current `gpssa-compass` Next.js application (firsthand source/schema review)

---

## 1. Executive summary (the one-paragraph verdict)

`gpssa-compass` was built to answer a **prior, strategy-and-benchmarking-flavoured** GPSSA engagement (RFI/RFP). It is a strong fit for **Workstream A — Product & Service Development Roadmap**: it already carries a GPSSA service catalogue, an AI-assisted service diagnostic, an opportunity backlog with prioritisation attributes, concept sheets, a phased roadmap, a risk register, an international benchmarking "Atlas," a products/innovation portfolio, and a mandate/standards/compliance library. It is, however, **almost entirely missing Workstream B — the End-to-End Quality Assurance Framework** and the **operational service-fulfilment / breach-management layer** that the new RFP makes central. There is **no** QA scorecard/sampling/calibration/error-taxonomy/corrective-action capability, **no** case/SLA/OLA/breach/ageing/triage model, and **no** live customer-and-operational performance measurement (CSAT/DSAT/NPS/Customer Pulse, backlog, rework, repeat contacts). In short: **~55–65% of Workstream A is already represented in some form; ~10–15% of Workstream B is.** The CX metrics that do appear in the codebase exist only as *international benchmarking dimensions*, not as a measurement system for GPSSA's own operations.

> **How to read this document.** Each RFP requirement is marked:
> **✅ In** (a real model/screen exists) · **🟡 Partial** (adjacent capability exists but not the RFP's actual ask) · **❌ Not in** (no representation in code or data model).
> File paths are clickable and point at the evidence.

---

## 2. What the application is today

**Stack:** Next.js 14 (App Router) · Prisma + SQLite (`prisma/dev.db`) · NextAuth · OpenAI (AI analysis/research) · Recharts + react-simple-maps (dashboards/maps) · dnd-kit (drag-and-drop ranking) · jsPDF/html2canvas (PDF/briefing export). See [package.json](package.json) and [prisma/schema.prisma](prisma/schema.prisma) (≈1,290 lines, 70+ models).

**Dashboard areas** (from [src/app/dashboard/](src/app/dashboard/) and [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx)):

| Area | Purpose | RFP relevance |
|---|---|---|
| **Mandate** (governance, history, legal, obligations, rfi-alignment, scope) | GPSSA legal mandate, obligations, RFI alignment | Diagnostic / governance context |
| **Services** (catalog, analysis, channels) | 41-service catalogue + AI service analysis + channel capability | Current-state diagnostic (Workstream A) |
| **Products** (portfolio, innovation, segments) | Product portfolio, innovations, segment coverage | Opportunity identification / new products |
| **Delivery** (channels, models, personas) | Delivery channels, operating models, customer personas | Operating-model context |
| **Atlas** (benchmarking, country) | International benchmarking with world map, KPI/dimension scores | Best-practice comparison |
| **Data** (institutions, products, segments, services, sources, standards) | Reference data + source citations | Evidence base |
| **Admin** (activity, agents, ai-config, research, scoring, users) | AI research agents, scoring methodology, user admin | Tooling, not deliverable content |

**Headline data models that matter for this RFP** (all in [prisma/schema.prisma](prisma/schema.prisma)): `GPSSAService`, `ServiceAnalysis`, `Opportunity`, `ConceptSheet`, `RoadmapPhase`, `RoadmapInitiative`, `Risk`, `KPI`, `Product`, `ProductInnovation`, plus the entire international benchmarking suite (`Benchmark*`) and standards/compliance suite (`Standard*`).

**What is *not* in the data model** (confirmed by a full-schema and source grep — **zero** matches): SLA, OLA, breach, case, calibration, sampling, scorecard, error taxonomy, corrective action / CAPA, CSAT, DSAT, NPS, Customer Pulse, complaint, backlog, ageing, triage, benefits-realization, RACI/governance-forum.

---

## 3. Requirement-by-requirement coverage

### 3.1 Project Requirements (RFP §2.1)

| # | RFP requirement | Status | Where it lives / what's missing |
|---|---|---|---|
| 1 | **Current-state diagnostic** (services, products, completed initiatives, operating model, case management, controls, governance, roles, reporting, SLA/OLA, system-enabled workflows) | 🟡 **Partial** | **Have:** `GPSSAService` (`currentState`, `painPoints`, `maturityLevel`, `digitalReadiness`, `bestPracticeComparison`) + `ServiceAnalysis` AI write-ups ([src/app/dashboard/services/analysis](src/app/dashboard/services/analysis)); mandate/governance/operating-model pages; products. **Missing:** completed-initiatives inventory, **case management, controls, SLA/OLA, reporting, and system-workflow** diagnostic dimensions. |
| 2 | **Customer & operational performance review** (Customer Pulse, CSAT, DSAT, NPS, complaint themes, repeat contacts, breaches, backlog, rework, fulfilment timelines, support-case performance) | ❌ **Not in** | No live performance/VoC module. CSAT/NPS appear **only as international benchmarking dimensions** in [src/lib/benchmarking/](src/lib/benchmarking/) and research prompts — not as GPSSA's own operational data. No model for complaints, repeat contacts, breaches, backlog, rework, or TAT. |
| 3 | **Benefits realization review of completed initiatives** | ❌ **Not in** | No initiative-baseline / actual-impact / benefits-tracking model. `RoadmapInitiative.estimatedImpact` is forward-looking only. |
| 4 | **End-to-End QA Framework** (quality dimensions, policy, review methodology, scorecards, sampling, scoring, calibration, error taxonomy, corrective action, governance) | ❌ **Not in** | **Entirely absent.** No QA entities of any kind. This is the single biggest gap and the core of Workstream B. |
| 5 | **Training & change management** | 🟡 **Partial** | Can be represented as roadmap initiatives, but there is no dedicated change/training/capability module. |
| 6 | **Service fulfilment & breach-reduction** (case classification, prioritisation, triage, ageing controls, early-warning triggers, escalation thresholds, differentiated SLA/OLA, breach management) | ❌ **Not in** | No case, SLA/OLA, breach, ageing, triage, or escalation models. The operational engine of the RFP is unrepresented. |
| 7 | **Opportunity identification** (service enhancements, new external products, supportive/internal products, innovation, cross-entity bundles) | ✅ **In** | `Opportunity` (`category`, `impact`, `effort`, `strategicFit`, `feasibility`, `status`) + `Product` / `ProductInnovation` / `SegmentCoverage` ([src/app/dashboard/products/innovation](src/app/dashboard/products/innovation), [src/app/api/research/opportunities](src/app/api/research/opportunities)). Cross-entity *bundles* are not an explicit object but can be modelled as opportunities. |
| 8 | **Prioritisation framework + ranked backlog + concept sheets + 12-month roadmap** | ✅ **In** | `Opportunity` carries impact/effort/strategic-fit/feasibility; `ConceptSheet` holds concept content; `RoadmapPhase`/`RoadmapInitiative` hold the roadmap; dnd-kit enables drag-rank. **Caveat:** prioritisation is attribute-based/manual — no explicit scoring formula (RICE/WSJF) is codified. |
| 9 | **KPI/KQI catalogue, dashboards, governance forums, management routines, sector-wide RACI, phased implementation, pilot plan, change mgmt, training, capability transfer** | 🟡 **Partial** | **Have:** generic `KPI` model (`target`, `actual`, `unit`, `frequency`, `owner`, `pillar`) via [src/app/api/roadmap/kpis](src/app/api/roadmap/kpis); phased roadmap. **Missing:** the **KQI** (quality-indicator) distinction, QA scorecards, **governance forums / management routines / RACI** objects, and an explicit **pilot-deployment** plan structure. |

### 3.2 Expected Outcomes (RFP §2.2)

| Expected outcome | Status | Note |
|---|---|---|
| Evidence-based diagnostic & **benefits-realisation view** | 🟡 Partial | Diagnostic yes (services/products); benefits-realisation no. |
| **Comprehensive end-to-end QA Framework** & fulfilment blueprint | ❌ Not in | Core Workstream B deliverable — not started. |
| Structured opportunity backlog & **prioritised 12-month roadmap** | ✅ In | Strongest existing capability. |
| Standardised **case classification, SLA/OLA, breach mgmt, governance** | ❌ Not in | Operational layer absent. |
| **KPI/KQI framework**, dashboards, operating model, RACI | 🟡 Partial | KPI yes; KQI / RACI / QA dashboards no. |
| **Phased implementation, pilot & capability-transfer plan** | 🟡 Partial | Roadmap phases exist; pilot & capability-transfer not modelled. |

### 3.3 Service catalogue (RFP §2.4 — "35 services")

✅ **In (and ahead).** The seed in [prisma/seed.ts](prisma/seed.ts) loads **41 GPSSA services** — a superset of the RFP's 35 — including *Employers Registration, Apply for End of Service (Civil/Military), Beneficiary Registration, Pension Entitlement Update, Purchase of Service Years, Report a Death, Workplace Injury Compensation, Benefit Exchange Inward/Outward, Shourak Payment, End of Service of GCC Nationals*, etc. The RFP's note that "any added service should be considered" is naturally accommodated because the catalogue is data-driven.

> **Real-world cross-check (useful for the proposal):** GPSSA's own *Ma'ashi* platform publicly reports **30 services**, **277,087 transactions in 2025**, and **95% on-time completion**, with core services completing in **under 24 hours** ([GPSSA news](https://gpssa.gov.ae/pages/en/media-center/news/gpssa-cuts-completion-times-core-services-redefines-customer-experience)). The "35" in the RFP is the authority's planning count; align the catalogue to whichever GPSSA confirms at kickoff.

---

## 4. Coverage by Workstream (the picture that matters for the bid)

```
WORKSTREAM A — Product & Service Development Roadmap        ▰▰▰▰▰▰▱▱▱▱  ~60% represented
  Current-State Diagnostic ............ 🟡 services/products yes; ops/controls/SLA no
  Customer & Service Perf. Review ..... ❌ no live CX/ops performance data
  Opportunity Identification .......... ✅ opportunity + innovation models
  Prioritization & Sequencing ......... ✅ impact/effort/fit + drag-rank (no RICE/WSJF formula)
  Roadmap Development ................. ✅ phases + initiatives
  Operating Model, Governance ......... 🟡 mandate/governance pages; no RACI/forum objects

WORKSTREAM B — End-to-End Quality Assurance Framework      ▰▱▱▱▱▱▱▱▱▱  ~12% represented
  Current-State Discovery ............. 🟡 reuse service diagnostic
  QA Framework Design ................. ❌ scorecards/sampling/scoring/calibration/taxonomy — none
  Pilot Deployment .................... ❌ no pilot model
  Full Sector Deployment .............. ❌ no QA review-workflow engine
  Capability Transfer & Handover ...... 🟡 roadmap can hold it; no dedicated module
```

**Bottom line:** the app is a credible **Workstream-A strategy console** that needs (a) a thin operational-performance/benefits-realisation layer to complete Workstream A, and (b) a **net-new Quality Assurance + Service-Fulfilment module** to address Workstream B at all.

---

## 5. Gaps to close (prioritised)

**P1 — Net-new, RFP-critical (Workstream B core):**
1. **QA Framework module** — entities for *quality dimensions, QA policy, review/audit records, scorecards (with critical/auto-fail criteria & weights), sampling plans, scores, calibration sessions, error taxonomy, corrective actions (CAPA)*. Screens for evaluator workflow + QA dashboard.
2. **Service-fulfilment / case engine** — *case, case classification/segment, SLA/OLA definitions, ageing buckets, breach records, early-warning/time-to-breach triggers, escalation thresholds*. Backlog & breach dashboards.

**P2 — Completes Workstream A:**
3. **Operational & customer performance review** — VoC store for *CSAT/DSAT/NPS/CES/Customer Pulse, complaint themes, repeat-contact/FCR, TAT, backlog, rework*; trend dashboards. (Today these are benchmarking-only.)
4. **Benefits-realisation tracker** — initiative *baseline → target → actual* with validation status.

**P3 — Governance & sustainability:**
5. **KQI catalogue** (distinct from KPI) + **governance-forum / management-routine / sector-wide RACI** objects.
6. **Pilot-plan & capability-transfer** structures (currently only generic roadmap phases).
7. **Explicit prioritisation scoring** (RICE/WSJF) layered onto the existing `Opportunity` attributes.

---

## 6. Quick wins (low effort, high proposal value)

- **Reframe existing assets** in the technical proposal: the Atlas benchmarking, service diagnostic, opportunity backlog, concept sheets and roadmap *already* evidence the methodology Selection Criteria reward (Understanding 15 + Methodology 20 + Deliverables/Implementation 15 = 50% of score).
- **Extend, don't rebuild:** the `KPI` model generalises to KQIs with a `type` field; `Opportunity` gains a computed `riceScore`/`wsjfScore`; `Risk` already models the risk register the RFP expects.
- **Use real GPSSA numbers** (Ma'ashi: 30 services, 277k transactions, 95% on-time, sub-24h core services; Zero-Bureaucracy: 8 services simplified, 23 data integrations) as the **baseline** in the current-state diagnostic and benefits-realisation sections — they are publicly sourced and lend credibility.

---

## 7. Honest caveats

- This assessment is from **direct source/schema inspection**, not a running instance; "🟡 Partial / ✅ In" reflects *data-model and route presence*, which is a strong but not perfect proxy for finished UX. Several areas (e.g., prioritisation drag-rank, briefing export) are present in code; their polish should be confirmed by running the app.
- "❌ Not in" items are genuinely absent at the **data-model** level (verified by grep), so they represent **build**, not **wiring**, work.
- The 41-service seed is a superset of the RFP's 35; reconcile the exact list with GPSSA at kickoff (their Ma'ashi count is 30).

---

*Companion document: **02 — End-to-End Quality Assurance & Service Fulfilment Improvement Framework: Global Best-Practice Research.***
