"use client";

import { useRef } from "react";
import { Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import {
  BLOB_ACTS,
  type ActStatus,
  type ConductorAct,
} from "@/lib/spine/conductor-acts";
import { ActIconNode } from "./spine-icons/ActIconNode";

export function SpineOrbScene({
  selected,
  hovered,
  statuses,
  accent,
}: {
  selected: ConductorAct | null;
  hovered: ConductorAct | null;
  statuses: Record<ConductorAct, ActStatus>;
  accent: string | null;
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
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 5, 7]} intensity={1.15} color="#f2f8ff" />
      <directionalLight position={[-4, 1, 3]} intensity={0.55} color="#7fd4b8" />
      <pointLight position={[0, 2, 6]} intensity={0.65} color="#ffffff" />
      <Environment preset="city" />
      <group ref={group}>
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
