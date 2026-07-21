import { getPersonaById } from "@/data/personas";
import { getLibraryEpisode } from "@/lib/spine/library";

export type OutlineStage = {
  name: string;
  actor: string;
  outcome?: string;
};

export type JourneyCandidate = {
  id: string;
  source: string;
  label: string;
  stages: OutlineStage[];
};

export function stagesEqual(a: OutlineStage[], b: OutlineStage[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (s, i) =>
      s.name.trim() === b[i].name.trim() &&
      (s.actor || "agent") === (b[i].actor || "agent") &&
      (s.outcome ?? "").trim() === (b[i].outcome ?? "").trim()
  );
}

/** Prefer library defaultStages, else persona research journey. */
export function buildJourneyOutline(opts: {
  libraryId?: string | null;
  personaKey?: string | null;
  existingStages?: OutlineStage[];
}): { stages: OutlineStage[]; source: string } {
  if (opts.existingStages?.length) {
    return { stages: opts.existingStages, source: "applied" };
  }

  if (opts.libraryId) {
    const lib = getLibraryEpisode(opts.libraryId);
    if (lib?.defaultStages?.length) {
      return {
        stages: lib.defaultStages.map((s) => ({
          name: s.name,
          actor: s.actor,
          outcome: s.outcome,
        })),
        source: "library",
      };
    }
  }

  const persona = opts.personaKey ? getPersonaById(opts.personaKey) : null;
  if (persona?.gpssaJourney?.steps?.length) {
    return {
      stages: persona.gpssaJourney.steps.map((s) => ({
        name: s.title,
        actor: "customer",
        outcome: s.description?.slice(0, 160) ?? undefined,
      })),
      source: "persona",
    };
  }

  return {
    stages: [
      { name: "Intake & verify", actor: "agent", outcome: "Case opened" },
      { name: "Fulfil request", actor: "agent", outcome: "Decision recorded" },
      { name: "Notify customer", actor: "system", outcome: "Customer informed" },
    ],
    source: "template",
  };
}

/** Journey options scoped to the active episode (not the whole catalogue). */
export function journeyCandidatesForEpisode(opts: {
  libraryId?: string | null;
  personaKey?: string | null;
  existingStages?: OutlineStage[];
  episodeName?: string | null;
}): JourneyCandidate[] {
  const out: JourneyCandidate[] = [];

  if (opts.existingStages?.length) {
    out.push({
      id: "applied",
      source: "applied",
      label: opts.episodeName
        ? `Applied — ${opts.episodeName}`
        : "Applied journey",
      stages: opts.existingStages,
    });
  }

  if (opts.libraryId) {
    const lib = getLibraryEpisode(opts.libraryId);
    if (lib?.defaultStages?.length) {
      const stages = lib.defaultStages.map((s) => ({
        name: s.name,
        actor: s.actor,
        outcome: s.outcome,
      }));
      const dup = out.some((c) => stagesEqual(c.stages, stages));
      if (!dup) {
        out.push({
          id: `library-${lib.id}`,
          source: "library",
          label: `${lib.name} journey`,
          stages,
        });
      }
    }
  }

  const persona = opts.personaKey ? getPersonaById(opts.personaKey) : null;
  if (persona?.gpssaJourney?.steps?.length) {
    const stages = persona.gpssaJourney.steps.map((s) => ({
      name: s.title,
      actor: "customer",
      outcome: s.description?.slice(0, 160) ?? undefined,
    }));
    const dup = out.some((c) => stagesEqual(c.stages, stages));
    if (!dup) {
      out.push({
        id: `persona-${persona.id}`,
        source: "persona",
        label: `${persona.name} research journey`,
        stages,
      });
    }
  }

  if (!out.length) {
    const built = buildJourneyOutline(opts);
    out.push({
      id: "template",
      source: built.source,
      label: "Starter journey",
      stages: built.stages,
    });
  }

  return out;
}
