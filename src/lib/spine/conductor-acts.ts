/** The five operational acts of conducting a service spine. */
export type ConductorAct = "persona" | "episode" | "journey" | "process" | "systemsqa";

export type ActStatus = "done" | "current" | "ready" | "locked";

export const ACT_ORDER: ConductorAct[] = [
  "persona",
  "episode",
  "journey",
  "process",
  "systemsqa",
];

export const ACT_LABELS: Record<ConductorAct, { label: string; verb: string }> = {
  persona: { label: "Persona", verb: "Choose the customer" },
  episode: { label: "Episode", verb: "Choose the life episode" },
  journey: { label: "Journey", verb: "Choose or set up the journey" },
  process: { label: "Process", verb: "Draft with AI, amend, apply" },
  systemsqa: { label: "Systems & QA", verb: "Agent outline, confirm" },
};

export const ACT_LOCK_REASON: Record<ConductorAct, string> = {
  persona: "",
  episode: "Choose a persona first",
  journey: "Choose an episode first",
  process: "Apply a journey first",
  systemsqa: "Apply the process first",
};

export type ConductorSnapshot = {
  statuses: Record<ConductorAct, ActStatus>;
  summaries: Record<ConductorAct, string>;
};

/** Derive act statuses from spine facts. Acts unlock strictly in sequence. */
export function computeConductorSnapshot(facts: {
  personaName: string | null;
  episodeName: string | null;
  stageCount: number;
  sopStepCount: number;
  systemCount: number;
  scorecardCount: number;
}): ConductorSnapshot {
  const doneFlags: Record<ConductorAct, boolean> = {
    persona: Boolean(facts.personaName),
    episode: Boolean(facts.episodeName),
    journey: facts.stageCount > 0,
    process: facts.sopStepCount > 0,
    systemsqa: facts.systemCount > 0 && facts.scorecardCount > 0,
  };

  const statuses = {} as Record<ConductorAct, ActStatus>;
  let currentAssigned = false;
  let prevDone = true;
  for (const act of ACT_ORDER) {
    if (doneFlags[act]) {
      statuses[act] = "done";
      prevDone = true;
      continue;
    }
    if (prevDone && !currentAssigned) {
      statuses[act] = "current";
      currentAssigned = true;
    } else if (prevDone) {
      statuses[act] = "ready";
    } else {
      statuses[act] = "locked";
    }
    prevDone = false;
  }

  const summaries: Record<ConductorAct, string> = {
    persona: facts.personaName ?? "",
    episode: facts.episodeName ?? "",
    journey: facts.stageCount ? `${facts.stageCount} stages` : "",
    process: facts.sopStepCount ? `${facts.sopStepCount} SOP steps` : "",
    systemsqa:
      facts.systemCount || facts.scorecardCount
        ? `${facts.systemCount} systems · ${facts.scorecardCount} scorecards`
        : "",
  };

  return { statuses, summaries };
}

/** Map legacy ?node= / SpineNodeId deep links onto conductor acts. */
export function nodeToAct(node: string): ConductorAct | null {
  if (node === "persona") return "persona";
  if (node === "episode") return "episode";
  if (node === "journey") return "journey";
  if (node === "process") return "process";
  if (node === "systems" || node === "qa" || node === "systemsqa") return "systemsqa";
  return null;
}

export function actToBrowseNode(
  act: ConductorAct
): "episode" | "journey" | "process" | "systems" | "qa" | null {
  if (act === "episode") return "episode";
  if (act === "journey") return "journey";
  if (act === "process") return "process";
  if (act === "systemsqa") return "qa";
  return null;
}
