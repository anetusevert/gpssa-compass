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

export interface SystemsQaOutline {
  systems: { code: string; name: string; kind: string; role: string }[];
  qaApproach: {
    scorecardName: string;
    summary: string;
    checkpointFocus: string[];
  };
}

/** Second agent: outline systems + QA from an *applied* SOP, not a pre-draft. */
export async function generateSystemsQaOutline(input: {
  serviceName: string;
  processName: string;
  sopTitle: string;
  steps: { title: string; instruction?: string | null; qaCheckpoint: boolean }[];
}): Promise<{ outline: SystemsQaOutline; source: "ai" | "template" }> {
  const fallback: SystemsQaOutline = {
    systems: [
      { code: "maashi", name: "Ma’ashi", kind: "core", role: "system-of-record" },
      { code: "crm", name: "CRM / case desk", kind: "crm", role: "workflow" },
      { code: "portal", name: "GPSSA Portal", kind: "channel", role: "intake" },
    ],
    qaApproach: {
      scorecardName: `${input.serviceName} – agent quality scorecard`,
      summary:
        "Call-center-style back-office QA aligned to SOP checkpoints (not software QA).",
      checkpointFocus: input.steps
        .filter((s) => s.qaCheckpoint)
        .map((s) => s.title)
        .slice(0, 5),
    },
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
            "You map back-office systems and QA coverage for GPSSA (UAE pension authority) " +
            "given an already-applied SOP. Systems are inventory labels (maashi/crm/portal/dms/payments). " +
            "QA is agent process QA with checkpoints — not software QA. Respond ONLY JSON matching: " +
            "{ systems:[{code,name,kind,role}], qaApproach:{scorecardName,summary,checkpointFocus:string[]} }. " +
            "3–5 systems; checkpointFocus references actual SOP step titles.",
        },
        { role: "user", content: JSON.stringify(input, null, 2) },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as SystemsQaOutline;
    if (!parsed.systems?.length || !parsed.qaApproach) {
      return { outline: fallback, source: "template" };
    }
    return { outline: { ...fallback, ...parsed }, source: "ai" };
  } catch {
    return { outline: fallback, source: "template" };
  }
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
