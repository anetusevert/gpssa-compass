import { getPersonaById } from "@/data/personas";
import { getLibraryEpisode } from "@/lib/spine/library";

export type OutlineStage = {
  name: string;
  actor: string;
  outcome?: string;
};

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
