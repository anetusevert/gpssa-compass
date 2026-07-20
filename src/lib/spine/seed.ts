/**
 * Gold-path Service Operating Spine seed.
 * Anchors End of Service – Civil across episode → journey → SOP → systems → fulfilment → QA.
 */
import type { PrismaClient } from "@prisma/client";

export const GOLD_SPINE_SERVICE_NAME = "Apply for End Of Service - Civil";

const IDS = {
  episode: "spine-ep-eos",
  process: "spine-proc-eos",
  sop: "spine-sop-eos-v1",
  sysMaashi: "spine-sys-maashi",
  sysCrm: "spine-sys-crm",
  sysPortal: "spine-sys-portal",
  sla: "spine-sla-eos",
  scorecard: "spine-sc-eos",
  defect: "spine-def-eos",
  capa: "spine-capa-eos",
};

export async function seedOperatingSpine(prisma: PrismaClient) {
  console.log("  Seeding Service Operating Spine (gold path)…");

  let service = await prisma.gPSSAService.findFirst({
    where: { name: GOLD_SPINE_SERVICE_NAME },
  });
  if (!service) {
    service = await prisma.gPSSAService.create({
      data: {
        name: GOLD_SPINE_SERVICE_NAME,
        category: "Employer",
        description:
          "Register the end-of-service of a registered insured individual (civil).",
        userTypes: JSON.stringify(["Employer"]),
        researchStatus: "complete",
      },
    });
  }
  const serviceId = service.id;

  await prisma.customerEpisode.updateMany({
    where: { serviceId },
    data: { isActive: false },
  });

  const episode = await prisma.customerEpisode.upsert({
    where: { id: IDS.episode },
    create: {
      id: IDS.episode,
      serviceId,
      name: "Member claims end-of-service benefits",
      description:
        "Employer initiates EOS for a civil insured; member expects correct entitlement and timely payment.",
      lifecycleCategory: "end-of-service",
      personaKey: "emirati-govt-employee",
      libraryId: "lib-eos-civil",
      source: "gold",
      isActive: true,
      sortOrder: 0,
    },
    update: {
      serviceId,
      name: "Member claims end-of-service benefits",
      lifecycleCategory: "end-of-service",
      personaKey: "emirati-govt-employee",
      libraryId: "lib-eos-civil",
      source: "gold",
      isActive: true,
    },
  });

  await prisma.spineConfig.upsert({
    where: { serviceId },
    create: {
      serviceId,
      activeEpisodeId: episode.id,
      activePersonaKey: "emirati-govt-employee",
      activeJourneySource: "gold",
    },
    update: {
      activeEpisodeId: episode.id,
      activePersonaKey: "emirati-govt-employee",
      activeJourneySource: "gold",
    },
  });

  const stageDefs = [
    { id: "spine-st-apply", name: "Apply / intake", actor: "customer", outcome: "Case created", sortOrder: 0 },
    { id: "spine-st-docs", name: "Document completeness", actor: "agent", outcome: "Pack validated", sortOrder: 1 },
    { id: "spine-st-review", name: "Manual entitlement review", actor: "agent", outcome: "Decision drafted", sortOrder: 2 },
    { id: "spine-st-decide", name: "Approve / reject", actor: "agent", outcome: "Decision recorded", sortOrder: 3 },
    { id: "spine-st-pay", name: "Payment & notify", actor: "system", outcome: "Paid / notified", sortOrder: 4 },
  ];

  for (const s of stageDefs) {
    await prisma.journeyStage.upsert({
      where: { id: s.id },
      create: { ...s, serviceId, episodeId: episode.id },
      update: { serviceId, episodeId: episode.id, name: s.name, actor: s.actor, outcome: s.outcome, sortOrder: s.sortOrder },
    });
  }

  const process = await prisma.operatingProcess.upsert({
    where: { id: IDS.process },
    create: {
      id: IDS.process,
      serviceId,
      name: "EOS Civil – fulfilment process",
      description: "Back-office path from intake through payment for civil EOS.",
      ownerHint: "EOS operations lead",
    },
    update: { serviceId, name: "EOS Civil – fulfilment process", ownerHint: "EOS operations lead" },
  });

  for (const stageId of stageDefs.map((s) => s.id)) {
    await prisma.stageProcessLink.upsert({
      where: { stageId_processId: { stageId, processId: process.id } },
      create: { stageId, processId: process.id },
      update: {},
    });
  }

  const sop = await prisma.sopDocument.upsert({
    where: { id: IDS.sop },
    create: {
      id: IDS.sop,
      processId: process.id,
      version: "1.0",
      title: "SOP — End of Service (Civil)",
      status: "active",
    },
    update: { processId: process.id, title: "SOP — End of Service (Civil)", status: "active" },
  });

  await prisma.sopStep.deleteMany({ where: { sopId: sop.id } });
  const steps = [
    { title: "Verify employer & insured identity", instruction: "Match Emirates ID / employer registration in Ma’ashi.", qaCheckpoint: true, checkpointNote: "Identity mismatch = auto-fail", sortOrder: 0 },
    { title: "Confirm service period & contributions", instruction: "Reconcile contribution history before entitlement calc.", qaCheckpoint: true, checkpointNote: "Wrong period = customer-critical", sortOrder: 1 },
    { title: "Calculate entitlement", instruction: "Apply Federal Decree-Law rules for civil EOS.", qaCheckpoint: true, checkpointNote: "Amount error = customer-critical", sortOrder: 2 },
    { title: "Dual approval for high-value", instruction: "Escalate if amount above gold tier threshold.", qaCheckpoint: false, sortOrder: 3 },
    { title: "Issue decision & payment instruction", instruction: "Post decision; trigger payment and member notification.", qaCheckpoint: true, checkpointNote: "Notify within SLA window", sortOrder: 4 },
    { title: "Close case & file evidence", instruction: "Attach evidence pack; mark case resolved.", qaCheckpoint: false, sortOrder: 5 },
  ];
  for (const st of steps) {
    await prisma.sopStep.create({
      data: {
        sopId: sop.id,
        title: st.title,
        instruction: st.instruction,
        qaCheckpoint: st.qaCheckpoint,
        checkpointNote: st.checkpointNote,
        sortOrder: st.sortOrder,
      },
    });
  }

  const systems = [
    { id: IDS.sysMaashi, code: "maashi", name: "Ma’ashi", kind: "core", description: "Core pension administration system of record.", role: "system-of-record" },
    { id: IDS.sysCrm, code: "crm", name: "CRM / case desk", kind: "crm", description: "Agent work queue and contact history.", role: "workflow" },
    { id: IDS.sysPortal, code: "portal", name: "GPSSA Portal", kind: "channel", description: "Employer / member digital intake channel.", role: "intake" },
  ];
  for (const sys of systems) {
    await prisma.backofficeSystem.upsert({
      where: { code: sys.code },
      create: {
        id: sys.id,
        code: sys.code,
        name: sys.name,
        kind: sys.kind,
        description: sys.description,
      },
      update: { name: sys.name, kind: sys.kind, description: sys.description },
    });
    const row = await prisma.backofficeSystem.findUniqueOrThrow({ where: { code: sys.code } });
    await prisma.processSystemLink.upsert({
      where: { processId_systemId: { processId: process.id, systemId: row.id } },
      create: { processId: process.id, systemId: row.id, role: sys.role },
      update: { role: sys.role },
    });
  }

  const sla = await prisma.sLADefinition.upsert({
    where: { id: IDS.sla },
    create: {
      id: IDS.sla,
      serviceId,
      serviceName: GOLD_SPINE_SERVICE_NAME,
      name: "EOS Civil – decision SLA",
      tier: "gold",
      type: "sla",
      targetHours: 72,
      description: "Decision communicated within 72 working hours of complete pack.",
    },
    update: { serviceId, serviceName: GOLD_SPINE_SERVICE_NAME, targetHours: 72 },
  });

  const now = Date.now();
  const caseDefs = [
    { id: "spine-case-eos-1", caseRef: "EOS-SPINE-001", status: "in-progress", breachRiskLevel: "green", breached: false, openedAgoH: 12, dueInH: 60 },
    { id: "spine-case-eos-2", caseRef: "EOS-SPINE-002", status: "in-progress", breachRiskLevel: "amber", breached: false, openedAgoH: 48, dueInH: 8 },
    { id: "spine-case-eos-3", caseRef: "EOS-SPINE-003", status: "open", breachRiskLevel: "red", breached: true, openedAgoH: 96, dueInH: -24 },
  ];

  for (const c of caseDefs) {
    const openedAt = new Date(now - c.openedAgoH * 3600_000);
    const dueAt = new Date(now + c.dueInH * 3600_000);
    await prisma.serviceCase.upsert({
      where: { caseRef: c.caseRef },
      create: {
        id: c.id,
        caseRef: c.caseRef,
        serviceId,
        serviceName: GOLD_SPINE_SERVICE_NAME,
        segment: "manual-review",
        impact: "high",
        urgency: c.breached ? "high" : "medium",
        priority: c.breached ? "P1" : "P2",
        status: c.status,
        owner: "EOS queue",
        openedAt,
        dueAt,
        slaId: sla.id,
        breached: c.breached,
        breachRiskLevel: c.breachRiskLevel,
      },
      update: {
        serviceId,
        serviceName: GOLD_SPINE_SERVICE_NAME,
        slaId: sla.id,
        breached: c.breached,
        breachRiskLevel: c.breachRiskLevel,
        status: c.status,
        dueAt,
      },
    });
  }

  if (caseDefs[2]) {
    const breachedCase = await prisma.serviceCase.findUnique({ where: { caseRef: caseDefs[2].caseRef } });
    if (breachedCase) {
      const existingBreach = await prisma.breach.findFirst({ where: { caseId: breachedCase.id } });
      if (!existingBreach) {
        await prisma.breach.create({
          data: {
            caseId: breachedCase.id,
            slaId: sla.id,
            hoursOver: 24,
            reason: "Document chase exceeded gold SLA",
            escalationType: "functional",
          },
        });
      }
    }
  }

  // Link existing EOS scorecard if present; else create spine scorecard stub linked to service
  const existingSc = await prisma.qAScorecard.findFirst({
    where: {
      OR: [
        { serviceScope: { contains: "End of Service" } },
        { name: { contains: "End of Service" } },
        { id: IDS.scorecard },
      ],
    },
  });
  const scorecard = existingSc
    ? await prisma.qAScorecard.update({
        where: { id: existingSc.id },
        data: { serviceId, serviceScope: GOLD_SPINE_SERVICE_NAME, status: "active" },
      })
    : await prisma.qAScorecard.upsert({
        where: { id: IDS.scorecard },
        create: {
          id: IDS.scorecard,
          name: "EOS Civil – agent quality scorecard",
          description: "Back-office QA checkpoints aligned to SOP v1.0",
          serviceId,
          serviceScope: GOLD_SPINE_SERVICE_NAME,
          status: "active",
        },
        update: { serviceId, serviceScope: GOLD_SPINE_SERVICE_NAME, status: "active" },
      });

  const failCase = await prisma.serviceCase.findUnique({ where: { caseRef: "EOS-SPINE-003" } });
  const okCase = await prisma.serviceCase.findUnique({ where: { caseRef: "EOS-SPINE-001" } });

  // Ensure at least one review linked to a spine case
  const reviewCount = await prisma.qAReview.count({ where: { scorecardId: scorecard.id } });
  if (reviewCount === 0 && okCase) {
    await prisma.qAReview.create({
      data: {
        scorecardId: scorecard.id,
        serviceName: GOLD_SPINE_SERVICE_NAME,
        caseRef: okCase.caseRef,
        caseId: okCase.id,
        reviewer: "QA coach",
        totalScore: 92,
        customerAccuracy: true,
        businessAccuracy: true,
        complianceAccuracy: true,
        status: "completed",
      },
    });
  } else if (okCase) {
    const any = await prisma.qAReview.findFirst({ where: { scorecardId: scorecard.id } });
    if (any && !any.caseId) {
      await prisma.qAReview.update({
        where: { id: any.id },
        data: { caseId: okCase.id, caseRef: okCase.caseRef, serviceName: GOLD_SPINE_SERVICE_NAME },
      });
    }
  }

  if (failCase) {
    await prisma.defect.upsert({
      where: { id: IDS.defect },
      create: {
        id: IDS.defect,
        serviceId,
        serviceName: GOLD_SPINE_SERVICE_NAME,
        caseRef: failCase.caseRef,
        source: "qa",
        severity: "critical",
        status: "analysing",
      },
      update: { serviceId, serviceName: GOLD_SPINE_SERVICE_NAME, caseRef: failCase.caseRef },
    });
    await prisma.correctiveAction.upsert({
      where: { id: IDS.capa },
      create: {
        id: IDS.capa,
        defectId: IDS.defect,
        title: "Reinforce entitlement calc checkpoint on EOS Civil",
        rootCause: "Agent skipped contribution reconcile step in SOP",
        owner: "EOS QA lead",
        dueDate: new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10),
        status: "in-progress",
        actionType: "corrective",
      },
      update: { defectId: IDS.defect, owner: "EOS QA lead", status: "in-progress" },
    });
  }

  // Tag any fulfilment cases named End of Service
  await prisma.serviceCase.updateMany({
    where: { serviceName: { contains: "End of Service" }, serviceId: null },
    data: { serviceId },
  });
  await prisma.sLADefinition.updateMany({
    where: { serviceName: { contains: "End of Service" }, serviceId: null },
    data: { serviceId },
  });
  await prisma.defect.updateMany({
    where: { serviceName: { contains: "End of Service" }, serviceId: null },
    data: { serviceId },
  });

  console.log(`  Spine ready for service ${GOLD_SPINE_SERVICE_NAME} (${serviceId})`);
  return serviceId;
}
