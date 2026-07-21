import { getOpenAIClient } from "@/lib/openai";

export interface SpineDraft {
  processName: string;
  processDescription: string;
  ownerHint: string;
  sopTitle: string;
  steps: {
    title: string;
    instruction: string;
    qaCheckpoint: boolean;
    checkpointNote?: string;
  }[];
  systems: { code: string; name: string; kind: string; role: string }[];
  qaApproach: {
    scorecardName: string;
    summary: string;
    checkpointFocus: string[];
  };
}

export function templateDraft(input: {
  serviceName: string;
  episodeName: string;
  personaName?: string;
  stages: { name: string; actor: string }[];
}): SpineDraft {
  const steps = input.stages.flatMap((s, i) => {
    const base = {
      title: s.name,
      instruction: `Execute “${s.name}” (${s.actor}). Align to ${input.serviceName}.`,
      qaCheckpoint: s.actor === "agent",
      checkpointNote: s.actor === "agent" ? "Agent checkpoint — verify before advance" : undefined,
    };
    if (i === 0) {
      return [
        {
          title: "Verify identity & authority",
          instruction: "Match Emirates ID / employer registration before intake.",
          qaCheckpoint: true,
          checkpointNote: "Identity mismatch = auto-fail",
        },
        base,
      ];
    }
    return [base];
  });

  return {
    processName: `${input.serviceName} – fulfilment process`,
    processDescription: `Back-office path for “${input.episodeName}”${
      input.personaName ? ` · persona ${input.personaName}` : ""
    }.`,
    ownerHint: "Service operations lead",
    sopTitle: `SOP — ${input.episodeName}`,
    steps: steps.slice(0, 8),
    systems: [
      { code: "maashi", name: "Ma’ashi", kind: "core", role: "system-of-record" },
      { code: "crm", name: "CRM / case desk", kind: "crm", role: "workflow" },
      { code: "portal", name: "GPSSA Portal", kind: "channel", role: "intake" },
    ],
    qaApproach: {
      scorecardName: `${input.serviceName} – agent quality scorecard`,
      summary: "Call-center-style back-office QA aligned to SOP checkpoints (not software QA).",
      checkpointFocus: steps.filter((s) => s.qaCheckpoint).map((s) => s.title).slice(0, 5),
    },
  };
}

export interface SystemsOutline {
  systems: { code: string; name: string; kind: string; role: string }[];
}

export interface QaOutline {
  scorecardName: string;
  summary: string;
  kpis: { name: string; target?: string; unit?: string }[];
  criteria: string[];
  checkpointFocus: string[];
}

/** @deprecated Prefer SystemsOutline + QaOutline */
export type SystemsQaOutline = SystemsOutline & { qaApproach: QaOutline };

/** Systems agent: map back-office systems from an applied SOP. */
export async function generateSystemsOutline(input: {
  serviceName: string;
  processName: string;
  sopTitle: string;
  steps: { title: string; instruction?: string | null; qaCheckpoint: boolean }[];
}): Promise<{ outline: SystemsOutline; source: "ai" | "template" }> {
  const fallback: SystemsOutline = {
    systems: [
      { code: "maashi", name: "Ma’ashi", kind: "core", role: "system-of-record" },
      { code: "crm", name: "CRM / case desk", kind: "crm", role: "workflow" },
      { code: "portal", name: "GPSSA Portal", kind: "channel", role: "intake" },
    ],
  };

  const client = await getOpenAIClient();
  if (!client) return { outline: fallback, source: "template" };

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You map back-office systems for GPSSA (UAE pension authority) given an applied SOP. " +
            "Systems are inventory labels (maashi/crm/portal/dms/payments). " +
            "Respond ONLY JSON: { systems:[{code,name,kind,role}] }. 3–5 systems with clear roles.",
        },
        { role: "user", content: JSON.stringify(input, null, 2) },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as SystemsOutline;
    if (!parsed.systems?.length) return { outline: fallback, source: "template" };
    return { outline: { systems: parsed.systems }, source: "ai" };
  } catch {
    return { outline: fallback, source: "template" };
  }
}

/** QA agent: KPIs, criteria, checkpoints from applied SOP. */
export async function generateQaOutline(input: {
  serviceName: string;
  processName: string;
  sopTitle: string;
  steps: { title: string; instruction?: string | null; qaCheckpoint: boolean }[];
}): Promise<{ outline: QaOutline; source: "ai" | "template" }> {
  const checkpoints = input.steps
    .filter((s) => s.qaCheckpoint)
    .map((s) => s.title)
    .slice(0, 6);
  const fallback: QaOutline = {
    scorecardName: `${input.serviceName} – agent quality scorecard`,
    summary:
      "Call-center-style back-office QA aligned to SOP checkpoints (not software QA).",
    kpis: [
      { name: "First-time-right rate", target: "≥ 95%", unit: "%" },
      { name: "Cycle time vs SLA", target: "≤ 100%", unit: "% of SLA" },
      { name: "Checkpoint pass rate", target: "≥ 90%", unit: "%" },
    ],
    criteria: [
      "Identity and authority verified before processing",
      "Contribution / entitlement calculation evidenced",
      "Customer notified of decision and next steps",
      "Case notes complete for audit",
    ],
    checkpointFocus: checkpoints.length ? checkpoints : input.steps.map((s) => s.title).slice(0, 4),
  };

  const client = await getOpenAIClient();
  if (!client) return { outline: fallback, source: "template" };

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You design agent-process QA for GPSSA (UAE pension authority) from an applied SOP. " +
            "Not software QA. Respond ONLY JSON: " +
            "{ scorecardName, summary, kpis:[{name,target?,unit?}], criteria:string[], checkpointFocus:string[] }. " +
            "3–5 KPIs; 4–6 criteria; checkpointFocus references SOP step titles.",
        },
        { role: "user", content: JSON.stringify(input, null, 2) },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as QaOutline;
    if (!parsed.scorecardName || !parsed.criteria?.length) {
      return { outline: fallback, source: "template" };
    }
    return { outline: { ...fallback, ...parsed }, source: "ai" };
  } catch {
    return { outline: fallback, source: "template" };
  }
}

/** Combined outline (legacy callers). */
export async function generateSystemsQaOutline(input: {
  serviceName: string;
  processName: string;
  sopTitle: string;
  steps: { title: string; instruction?: string | null; qaCheckpoint: boolean }[];
}): Promise<{ outline: SystemsQaOutline; source: "ai" | "template" }> {
  const [sys, qa] = await Promise.all([
    generateSystemsOutline(input),
    generateQaOutline(input),
  ]);
  return {
    outline: { systems: sys.outline.systems, qaApproach: qa.outline },
    source: sys.source === "ai" || qa.source === "ai" ? "ai" : "template",
  };
}

export async function generateSpineDraft(input: {
  serviceName: string;
  episodeName: string;
  episodeDescription?: string;
  personaName?: string;
  stages: { name: string; actor: string; outcome?: string }[];
  painPoints?: string[];
}): Promise<{ draft: SpineDraft; source: "ai" | "template" }> {
  const fallback = templateDraft(input);
  const client = await getOpenAIClient();
  if (!client) return { draft: fallback, source: "template" };

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You design operable back-office SOPs for GPSSA (UAE pension authority). " +
            "Not software/technical QA — agent process QA with checkpoints. " +
            "Respond ONLY JSON matching: { processName, processDescription, ownerHint, sopTitle, " +
            "steps:[{title,instruction,qaCheckpoint,checkpointNote?}], " +
            "systems:[{code,name,kind,role}], qaApproach:{scorecardName,summary,checkpointFocus:string[]} }. " +
            "5–8 steps; ≥2 qaCheckpoint true. Systems are inventory labels only (maashi/crm/portal).",
        },
        {
          role: "user",
          content: JSON.stringify(input, null, 2),
        },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as SpineDraft;
    if (!parsed.steps?.length) return { draft: fallback, source: "template" };
    return { draft: { ...fallback, ...parsed, steps: parsed.steps }, source: "ai" };
  } catch {
    return { draft: fallback, source: "template" };
  }
}
