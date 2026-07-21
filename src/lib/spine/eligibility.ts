import { EPISODE_LIBRARY, getLibraryEpisode } from "@/lib/spine/library";

export type EpisodeEligibilityFields = {
  personaKey?: string | null;
  libraryId?: string | null;
};

/** Episode is eligible for a persona if stamped for them or its library template lists them. */
export function isEpisodeEligible(
  episode: EpisodeEligibilityFields,
  personaKey: string | null | undefined
): boolean {
  if (!personaKey) return true;
  if (episode.personaKey === personaKey) return true;
  if (episode.libraryId) {
    const lib = getLibraryEpisode(episode.libraryId);
    if (lib?.suggestedPersonaKeys.includes(personaKey)) return true;
  }
  return false;
}

export function filterEligibleEpisodes<T extends EpisodeEligibilityFields>(
  episodes: T[],
  personaKey: string | null | undefined
): T[] {
  if (!personaKey) return episodes;
  return episodes.filter((e) => isEpisodeEligible(e, personaKey));
}

/** Prefer library templates that list this persona. */
export function libraryEpisodesForPersona(personaKey: string | null | undefined) {
  if (!personaKey) return EPISODE_LIBRARY;
  return EPISODE_LIBRARY.filter((e) => e.suggestedPersonaKeys.includes(personaKey));
}

export function librarySuggestsPersona(
  libraryId: string | null | undefined,
  personaKey: string
): boolean {
  if (!libraryId) return false;
  const lib = getLibraryEpisode(libraryId);
  return Boolean(lib?.suggestedPersonaKeys.includes(personaKey));
}
