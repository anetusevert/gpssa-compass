"use client";

import { useEffect, useMemo, useState } from "react";
import { COUNTRIES } from "@/lib/countries/catalog";
import type { ComparatorOption } from "./types";

interface StandardListItem {
  id: string;
  slug: string;
  code: string | null;
  title: string;
  body: string;
  bodyShort: string | null;
  category: string;
  scope: string;
  description: string | null;
}

interface ComputedRefListItem {
  slug: string;
  name: string;
  shortName: string | null;
  kind: string;
  scope: string;
  description: string | null;
  cohortSize: number;
  asOfDate: string | null;
}

const STANDARD_BODY_COLORS: Record<string, string> = {
  ILO: "#0EA5E9",
  ISSA: "#A855F7",
  "World Bank": "#10B981",
  OECD: "#F59E0B",
  Mercer: "#EC4899",
  UN: "#06B6D4",
};

const COMPUTED_KIND_COLORS: Record<string, string> = {
  average: "#94A3B8",
  "best-practice": "#10B981",
  "leader-cohort": "#F59E0B",
  "peer-group": "#3B82F6",
  median: "#6366F1",
};

const COUNTRY_REGION_COLORS: Record<string, string> = {
  GCC: "#0EA5E9",
  MENA: "#A855F7",
  Europe: "#10B981",
  "Asia Pacific": "#F59E0B",
  Americas: "#EC4899",
  Africa: "#22C55E",
};

/**
 * Loads the full universe of available comparators (standards, computed
 * references, countries) once and exposes them grouped + flat.
 */
export function useComparators() {
  const [standards, setStandards] = useState<StandardListItem[]>([]);
  const [computed, setComputed] = useState<ComputedRefListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/standards").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/references/computed").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([s, c]) => {
        if (cancelled) return;
        setStandards(Array.isArray(s) ? s : []);
        setComputed(Array.isArray(c) ? c : []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const standardOptions = useMemo<ComparatorOption[]>(
    () =>
      standards.map((s) => ({
        kind: "standard" as const,
        id: s.slug,
        label: s.title,
        shortLabel: s.bodyShort ?? s.code ?? s.body,
        description: s.description ?? undefined,
        body: s.body,
        color: STANDARD_BODY_COLORS[s.body] ?? "#94A3B8",
      })),
    [standards]
  );

  const computedOptions = useMemo<ComparatorOption[]>(
    () =>
      computed.map((c) => ({
        kind: "computed" as const,
        id: c.slug,
        label: c.name,
        shortLabel: c.shortName ?? c.name,
        description: c.description ?? undefined,
        body: `${c.cohortSize} entities`,
        color: COMPUTED_KIND_COLORS[c.kind] ?? "#94A3B8",
      })),
    [computed]
  );

  const countryOptions = useMemo<ComparatorOption[]>(
    () =>
      COUNTRIES.filter((c) => c.iso3 !== "ARE").map((c) => ({
        kind: "country" as const,
        id: c.iso3,
        label: c.name,
        shortLabel: c.name.split(" ")[0],
        description: `${c.region}${c.subRegion ? ` · ${c.subRegion}` : ""}`,
        body: c.region,
        color: COUNTRY_REGION_COLORS[c.region] ?? "#94A3B8",
        iso3: c.iso3,
      })),
    []
  );

  const allOptions = useMemo(
    () => [...standardOptions, ...computedOptions, ...countryOptions],
    [standardOptions, computedOptions, countryOptions]
  );

  return {
    standardOptions,
    computedOptions,
    countryOptions,
    allOptions,
    loading,
  };
}

/** Build a stable id "kind:id" used in URL state. */
export function comparatorToken(opt: ComparatorOption): string {
  return `${opt.kind}:${opt.id}`;
}

/** Parse a stable "kind:id" token back. */
export function parseComparatorToken(token: string | null | undefined) {
  if (!token) return null;
  const [kind, id] = token.split(":");
  if (!kind || !id) return null;
  return { kind: kind as ComparatorOption["kind"], id };
}
