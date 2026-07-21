"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group } from "three";
import {
  BLOB_ACTS,
  type ActStatus,
  type ConductorAct,
} from "@/lib/spine/conductor-acts";
import { ActIconNode, COLS } from "./spine-icons/ActIconNode";

function OrbitLine() {
  const { viewport } = useThree();
  const full = viewport.width * 0.82;
  const segment = full / COLS;
  const width = segment * 5;
  const x = segment * 0.5;
  return (
    <mesh position={[x, -0.55, -2]}>
      <planeGeometry args={[width, 0.012]} />
      <meshBasicMaterial color="#3a5570" transparent opacity={0.35} />
    </mesh>
  );
}

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
      <ambientLight intensity={0.65} />
      <directionalLight position={[2.5, 4, 6]} intensity={0.85} color="#e8f4ff" />
      <directionalLight position={[-3, -1, 4]} intensity={0.35} color="#9ad4c0" />
      <pointLight position={[0, 1.5, 5]} intensity={0.4} color="#ffffff" />
      <group ref={group}>
        <OrbitLine />
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
