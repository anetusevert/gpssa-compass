"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, type Group, type Mesh } from "three";
import { createSpineBlobMaterial } from "./SpineBlobMaterial";
import type { SpineNodeId } from "@/lib/spine/types";

const ORDER: SpineNodeId[] = ["episode", "journey", "process", "systems", "qa"];

/** Blob palette — primary body, secondary drift tone, accent rim. */
const PALETTE: Record<SpineNodeId, { primary: string; secondary: string; accent: string }> = {
  episode: { primary: "#00A86B", secondary: "#2fd39a", accent: "#a8f0d4" },
  journey: { primary: "#3B82C4", secondary: "#6fb1e8", accent: "#c4e2ff" },
  process: { primary: "#C99A3C", secondary: "#e8c06a", accent: "#ffe9b8" },
  systems: { primary: "#B0764A", secondary: "#d99e70", accent: "#ffd9b8" },
  qa: { primary: "#C5A572", secondary: "#e2c795", accent: "#fff0d4" },
};

const MUTED = "#33475e";

function BlobNode({
  id,
  index,
  radius,
  selected,
  hovered,
  emphasized,
  conducting,
  accent,
  dimmed,
}: {
  id: SpineNodeId;
  index: number;
  radius: number;
  selected: boolean;
  hovered: boolean;
  emphasized: boolean;
  conducting: boolean;
  accent: string | null;
  dimmed: boolean;
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

  // Column-aligned: blob sits at the center of its fifth of the stage width.
  const x = ((index + 0.5) / 5 - 0.5) * viewport.width;

  const active = selected || hovered;
  const targetAmp = active ? 0.9 : emphasized ? 0.4 : 0.15;
  const targetMute = active ? 0 : emphasized ? 0.3 : dimmed ? 1 : 0.55;
  const targetScale = active ? 1.14 : emphasized ? 1.04 : dimmed ? 0.9 : 1;

  useFrame((state, delta) => {
    const u = material.uniforms;
    u.u_time.value = state.clock.elapsedTime;

    const lerpSpeed = 1 - Math.pow(0.001, delta); // frame-rate independent
    smoothedAmp.current += (targetAmp - smoothedAmp.current) * lerpSpeed;
    smoothedMute.current += (targetMute - smoothedMute.current) * lerpSpeed;
    u.u_amp.value = smoothedAmp.current;
    u.u_mute.value = smoothedMute.current;

    // Engagement Mode phase accent tints the rim of emphasized blobs.
    accentGoal.current.set(
      conducting && emphasized && accent ? accent : PALETTE[id].accent
    );
    u.u_colorAccent.value.lerp(accentGoal.current, lerpSpeed);

    if (mesh.current) {
      mesh.current.rotation.y += delta * (active ? 0.18 : 0.05);
      const t = state.clock.elapsedTime + index * 1.7;
      const pulse =
        1 +
        Math.sin(t * 0.35) * 0.04 +
        Math.sin(t * 0.13 + 1.7) * 0.025 +
        smoothedAmp.current * 0.05;
      smoothedScale.current += (targetScale - smoothedScale.current) * lerpSpeed;
      mesh.current.scale.setScalar(radius * smoothedScale.current * pulse);
      // Gentle independent drift so the row never reads as a static lineup.
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
  emphasized,
  conducting,
  accent,
}: {
  selected: SpineNodeId | null;
  hovered: SpineNodeId | null;
  emphasized: Set<SpineNodeId>;
  conducting: boolean;
  accent: string | null;
}) {
  const group = useRef<Group>(null);
  const { viewport } = useThree();
  const hasEmphasis = conducting && emphasized.size > 0;

  // Identical radius for all blobs, capped by both column width and stage height.
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
        {ORDER.map((id, i) => {
          const emp = emphasized.has(id);
          const isActive = selected === id || hovered === id;
          const dimmed = !isActive && (hasEmphasis ? !emp : true);
          return (
            <BlobNode
              key={id}
              id={id}
              index={i}
              radius={radius}
              selected={selected === id}
              hovered={hovered === id}
              emphasized={emp}
              conducting={conducting}
              accent={accent}
              dimmed={dimmed}
            />
          );
        })}
      </group>
    </>
  );
}
