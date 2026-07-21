"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, type Group, type Mesh } from "three";
import { createSpineBlobMaterial } from "./SpineBlobMaterial";
import {
  ACT_ORDER,
  type ActStatus,
  type ConductorAct,
} from "@/lib/spine/conductor-acts";

/** Blob palette — persona opens the line, then episode → systems & QA. */
const PALETTE: Record<ConductorAct, { primary: string; secondary: string; accent: string }> = {
  persona: { primary: "#00C48C", secondary: "#3ee0b0", accent: "#b8ffe8" },
  episode: { primary: "#00A86B", secondary: "#2fd39a", accent: "#a8f0d4" },
  journey: { primary: "#3B82C4", secondary: "#6fb1e8", accent: "#c4e2ff" },
  process: { primary: "#C99A3C", secondary: "#e8c06a", accent: "#ffe9b8" },
  systemsqa: { primary: "#C5A572", secondary: "#e2c795", accent: "#fff0d4" },
};

const MUTED = "#33475e";

function BlobNode({
  id,
  index,
  radius,
  selected,
  hovered,
  status,
  accent,
}: {
  id: ConductorAct;
  index: number;
  radius: number;
  selected: boolean;
  hovered: boolean;
  status: ActStatus;
  accent: string | null;
}) {
  const { viewport } = useThree();
  const mesh = useRef<Mesh>(null);
  const smoothedAmp = useRef(0);
  const smoothedMute = useRef(1);
  const smoothedScale = useRef(1);
  const accentGoal = useRef(new Color());

  const material = useMemo(
    () =>
      createSpineBlobMaterial({
        primary: PALETTE[id].primary,
        secondary: PALETTE[id].secondary,
        accent: PALETTE[id].accent,
        muted: MUTED,
        seed: index * 13.7,
      }),
    [id, index]
  );

  useEffect(() => () => material.dispose(), [material]);

  const x = ((index + 0.5) / 5 - 0.5) * viewport.width;

  const active = selected || hovered;
  const done = status === "done";
  const current = status === "current";
  const locked = status === "locked";

  // done = full color calm; current = brighter higher amp; locked/ready muted
  const targetAmp = active ? 0.95 : current ? 0.7 : done ? 0.35 : 0.12;
  const targetMute = active || current ? 0 : done ? 0.15 : locked ? 1 : 0.55;
  const targetScale = active ? 1.14 : current ? 1.08 : done ? 1.02 : locked ? 0.88 : 0.96;

  useFrame((state, delta) => {
    const u = material.uniforms;
    u.u_time.value = state.clock.elapsedTime;

    const lerpSpeed = 1 - Math.pow(0.001, delta);
    smoothedAmp.current += (targetAmp - smoothedAmp.current) * lerpSpeed;
    smoothedMute.current += (targetMute - smoothedMute.current) * lerpSpeed;
    u.u_amp.value = smoothedAmp.current;
    u.u_mute.value = smoothedMute.current;

    accentGoal.current.set(accent && (current || active) ? accent : PALETTE[id].accent);
    u.u_colorAccent.value.lerp(accentGoal.current, lerpSpeed);

    if (mesh.current) {
      mesh.current.rotation.y += delta * (active || current ? 0.18 : 0.05);
      const t = state.clock.elapsedTime + index * 1.7;
      const pulse =
        1 +
        Math.sin(t * 0.35) * 0.04 +
        Math.sin(t * 0.13 + 1.7) * 0.025 +
        smoothedAmp.current * 0.05 +
        (current ? Math.sin(t * 2.2) * 0.02 : 0);
      smoothedScale.current += (targetScale - smoothedScale.current) * lerpSpeed;
      // Persona column is a slightly smaller aura so the avatar sits cleanly on top.
      const base = id === "persona" ? radius * 0.92 : radius;
      mesh.current.scale.setScalar(base * smoothedScale.current * pulse);
      mesh.current.position.y = Math.sin(t * 0.4) * radius * 0.06;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={mesh} material={material} scale={radius}>
        <icosahedronGeometry args={[1, 24]} />
      </mesh>
    </group>
  );
}

function OrbitLine() {
  const { viewport } = useThree();
  return (
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[viewport.width * 0.82, 0.01]} />
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
  const radius = Math.min(viewport.height / 2.9, viewport.width / 14);

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <group ref={group}>
        <OrbitLine />
        {ACT_ORDER.map((id, i) => (
          <BlobNode
            key={id}
            id={id}
            index={i}
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
