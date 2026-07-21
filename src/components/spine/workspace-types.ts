import type { LifecycleCategory } from "@/lib/spine/library";

export type LibraryPayload = {
  categories: { id: LifecycleCategory; label: string; blurb: string }[];
  episodes: {
    id: string;
    category: LifecycleCategory;
    name: string;
    description: string;
    suggestedPersonaKeys: string[];
  }[];
};

export type WorkspaceEpisode = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  personaKey: string | null;
  libraryId?: string | null;
};

export type Workspace = {
  episodes: WorkspaceEpisode[];
  /** Episodes eligible for the current persona lens (many-to-many). */
  eligibleEpisodes?: WorkspaceEpisode[];
  personaKey: string | null;
  persona: {
    id: string;
    name: string;
    tagline: string;
    color?: string;
    avatarUrl?: string;
  } | null;
  personas: {
    id: string;
    name: string;
    tagline: string;
    color: string;
    avatarUrl?: string;
  }[];
  journeyCandidates: {
    id: string;
    source: string;
    label: string;
    stages: { name: string; actor: string; outcome?: string | null }[];
  }[];
  painPoints: string[];
  systems: { id: string; code: string; name: string; kind: string }[];
};
