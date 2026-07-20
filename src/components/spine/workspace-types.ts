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

export type Workspace = {
  episodes: {
    id: string;
    name: string;
    description: string | null;
    isActive: boolean;
    personaKey: string | null;
  }[];
  personaKey: string | null;
  persona: { id: string; name: string; tagline: string } | null;
  personas: { id: string; name: string; tagline: string; color: string }[];
  journeyCandidates: {
    id: string;
    source: string;
    label: string;
    stages: { name: string; actor: string; outcome?: string | null }[];
  }[];
  painPoints: string[];
  systems: { id: string; code: string; name: string; kind: string }[];
};
