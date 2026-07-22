"use client";

import type { Material } from "three";
import type { ConductorAct } from "@/lib/spine/conductor-acts";
import { EpisodeBook } from "./icons/EpisodeBook";
import { JourneyFootprints } from "./icons/JourneyFootprints";
import { ProcessMap } from "./icons/ProcessMap";
import { SystemsNetwork } from "./icons/SystemsNetwork";
import { QaScorecard } from "./icons/QaScorecard";

/** Animated, telling silhouettes for each spine act. */
export function ActIconMeshes({
  act,
  body,
  accent,
  metal,
  energy,
  reduceMotion,
  amp,
}: {
  act: Exclude<ConductorAct, "persona">;
  body: Material;
  accent: Material;
  metal: Material;
  energy: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  switch (act) {
    case "episode":
      return (
        <EpisodeBook
          body={body}
          accent={accent}
          metal={metal}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
    case "journey":
      return (
        <JourneyFootprints
          body={body}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
    case "process":
      return (
        <ProcessMap
          body={body}
          accent={accent}
          energy={energy}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
    case "systems":
      return (
        <SystemsNetwork
          body={body}
          accent={accent}
          energy={energy}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
    case "qa":
      return (
        <QaScorecard
          body={body}
          accent={accent}
          energy={energy}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
  }
}
