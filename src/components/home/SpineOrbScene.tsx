"use client";

import { Suspense, useRef } from "react";
import { Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import {
  BLOB_ACTS,
  type ActStatus,
  type ConductorAct,
} from "@/lib/spine/conductor-acts";
import { ActIconNode } from "./spine-icons/ActIconNode";
import { PersonaFigureNode } from "./spine-icons/icons/PersonaFigure";

export function SpineOrbScene({
  selected,
  hovered,
  statuses,
  accent,
  personaAccent,
  personaAvatarUrl,
}: {
  selected: ConductorAct | null;
  hovered: ConductorAct | null;
  statuses: Record<ConductorAct, ActStatus>;
  accent: string | null;
  personaAccent?: string | null;
  personaAvatarUrl?: string | null;
}) {
  const group = useRef<Group>(null);
  const { viewport } = useThree();
  const radius = Math.min(viewport.height / 2.9, viewport.width / 16);

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 7]} intensity={1.2} color="#f5f8f6" />
      <directionalLight position={[-4, 2, 3]} intensity={0.5} color="#9ec4ba" />
      <pointLight position={[0, 2, 6]} intensity={0.55} color="#ffffff" />
      <Environment preset="city" />
      <group ref={group}>
        <Suspense fallback={null}>
          <PersonaFigureNode
            colIndex={0}
            radius={radius}
            selected={selected === "persona"}
            hovered={hovered === "persona"}
            status={statuses.persona}
            accent={personaAccent ?? accent}
            avatarUrl={personaAvatarUrl}
          />
        </Suspense>
        {BLOB_ACTS.map((id, i) => (
          <ActIconNode
            key={id}
            id={id as Exclude<ConductorAct, "persona">}
            blobIndex={i}
            radius={radius}
            selected={selected === id}
            hovered={hovered === id}
            status={statuses[id]}
            accent={accent}
          />
        ))}
      </group>
    </>
  );
}
