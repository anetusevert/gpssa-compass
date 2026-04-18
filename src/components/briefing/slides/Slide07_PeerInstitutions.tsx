"use client";

import { SlideLayout } from "./SlideLayout";
import { SlidePlaceholder } from "../SlidePlaceholder";
import { RaceBar, type RaceBarRow } from "../charts/RaceBar";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface Props {
  snapshot: BriefingSnapshot;
}

const REGION_COLOR: Record<string, string> = {
  GCC: "#00A86B",
  MENA: "#33C490",
  Europe: "#2D4A8C",
  "Asia Pacific": "#2DD4BF",
  "Asia-Pacific": "#2DD4BF",
  Americas: "#C5A572",
  Africa: "#AA9CFF",
};

function colorFor(region: string, isGpssa: boolean): string {
  if (isGpssa) return "#00A86B";
  return REGION_COLOR[region] ?? "rgba(255,255,255,0.55)";
}

export function Slide07_PeerInstitutions({ snapshot }: Props) {
  const peers = snapshot.benchmarks.peers.filter(
    (p) => p.averageScore != null
  );

  if (peers.length === 0) {
    return (
      <SlidePlaceholder
        pillar="Peer Benchmarking"
        done={snapshot.benchmarks.peers.length}
        total={Math.max(snapshot.benchmarks.peers.length, 8)}
        message="Race-bar comparison against CPF Singapore, GOSI KSA, NSSF, AP6 Sweden, Korea NPS and more — appears once the benchmark scoring agents have run."
      />
    );
  }

  const top = peers.slice(0, 8);
  const gpssa = top.find((p) => p.isGpssa);

  const rows: RaceBarRow[] = top.map((p) => ({
    id: p.id,
    label: p.shortName ?? p.name,
    sub: p.country,
    value: p.averageScore ?? 0,
    color: colorFor(p.region, p.isGpssa),
    highlight: p.isGpssa,
  }));

  // Position relative to leader
  const leader = top[0];
  const gpssaGap =
    gpssa && leader && leader.averageScore && gpssa.averageScore
      ? leader.averageScore - gpssa.averageScore
      : null;

  let headline = "Closing on the global leader cohort.";
  if (gpssa && gpssaGap != null) {
    if (gpssaGap <= 5) {
      headline = "Within striking distance of the global leader.";
    } else if (gpssaGap <= 15) {
      headline = `Closing on the leader — ${Math.round(
        gpssaGap
      )} points to top spot.`;
    } else {
      headline = `Ahead of the regional pack. ${Math.round(
        gpssaGap
      )} points to global lead.`;
    }
  } else if (!gpssa && leader) {
    headline = `Top peer: ${leader.shortName ?? leader.name} (${leader.country}).`;
  }

  return (
    <SlideLayout
      eyebrow="vs. Peer Institutions"
      title={headline}
      subtitle={`Average score across ${snapshot.benchmarks.dimensions} benchmark dimensions. Higher is better.`}
    >
      <div className="flex h-full items-center justify-center max-w-5xl mx-auto">
        <div className="w-full">
          <RaceBar rows={rows} max={100} />
        </div>
      </div>
    </SlideLayout>
  );
}
