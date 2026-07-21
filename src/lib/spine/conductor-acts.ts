/** The six operational acts of conducting a service spine. */
export type ConductorAct =
  | "persona"
  | "episode"
  | "journey"
  | "process"
  | "systems"
  | "qa";

export type ActStatus = "done" | "current" | "ready" | "locked";

export const ACT_ORDER: ConductorAct[] = [
  "persona",
  "episode",
  "journey",
  "process",
  "systems",
  "qa",
];

/** Acts that render living blobs (persona is avatar-only). */
export const BLOB_ACTS: ConductorAct[] = [
  "episode",
  "journey",
  "process",
  "systems",
  "qa",
];

export const ACT_LABELS: Record<ConductorAct, { label: string; verb: string }> = {
  persona: { label: "Persona", verb: "Choose the customer" },
  episode: { label: "Episode", verb: "Choose the life episode" },
  journey: { label: "Journey", verb: "Review and amend the journey outline" },
  process: { label: "Process", verb: "Draft with AI, amend, apply" },
  systems: { label: "Systems", verb: "Agent outlines systems implications" },
  qa: { label: "QA", verb: "Generate KPIs, criteria, scorecard" },
};

export const ACT_LOCK_REASON: Record<ConductorAct, string> = {
  persona: "",
  episode: "Choose a persona first",
  journey: "Choose an episode first",
  process: "Apply a journey first",
  systems: "Apply the process first",
  qa: "Confirm systems first",
};

export const ACT_SUCCESS: Record<ConductorAct, string> = {
  persona: "Persona set — choose an episode",
  episode: "Episode activated — review journey outline",
  journey: "Journey applied — drafting process…",
  process: "Process stored — outlining systems…",
  systems: "Systems linked — generating QA…",
  qa: "QA stored — operating path complete",
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
    systems: facts.systemCount > 0,
    qa: facts.scorecardCount > 0,
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
    systems: facts.systemCount ? `${facts.systemCount} systems` : "",
    qa: facts.scorecardCount ? `${facts.scorecardCount} scorecard${facts.scorecardCount === 1 ? "" : "s"}` : "",
  };

  return { statuses, summaries };
}

export function nextAct(act: ConductorAct): ConductorAct | null {
  const i = ACT_ORDER.indexOf(act);
  if (i < 0 || i >= ACT_ORDER.length - 1) return null;
  return ACT_ORDER[i + 1];
}

/** Map legacy ?node= / SpineNodeId deep links onto conductor acts. */
export function nodeToAct(node: string): ConductorAct | null {
  if (node === "persona") return "persona";
  if (node === "episode") return "episode";
  if (node === "journey") return "journey";
  if (node === "process") return "process";
  if (node === "systems" || node === "systemsqa") return "systems";
  if (node === "qa") return "qa";
  return null;
}

export function actToBrowseNode(
  act: ConductorAct
): "episode" | "journey" | "process" | "systems" | "qa" | null {
  if (act === "episode") return "episode";
  if (act === "journey") return "journey";
  if (act === "process") return "process";
  if (act === "systems") return "systems";
  if (act === "qa") return "qa";
  return null;
}
