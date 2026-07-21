"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, MeshStandardMaterial, type Group } from "three";
import {
  prefersReducedMotion,
  statusToMotion,
} from "@/lib/spine/act-icon-motion";
import type { ActStatus, ConductorAct } from "@/lib/spine/conductor-acts";
import { ActIconMeshes } from "./ActIconMeshes";

export const ACT_ICON_PALETTE: Record<
  Exclude<ConductorAct, "persona">,
  { primary: string; secondary: string; accent: string }
> = {
  episode: { primary: "#00A86B", secondary: "#2fd39a", accent: "#a8f0d4" },
  journey: { primary: "#3B82C4", secondary: "#6fb1e8", accent: "#c4e2ff" },
  process: { primary: "#C99A3C", secondary: "#e8c06a", accent: "#ffe9b8" },
  systems: { primary: "#B0764A", secondary: "#d99e70", accent: "#ffd9b8" },
  qa: { primary: "#C5A572", secondary: "#e2c795", accent: "#fff0d4" },
};

const MUTED = "#33475e";
const COLS = 6;

export function ActIconNode({
  id,
  blobIndex,
  radius,
  selected,
  hovered,
  status,
  accent,
}: {
  id: Exclude<ConductorAct, "persona">;
  blobIndex: number;
  radius: number;
  selected: boolean;
  hovered: boolean;
  status: ActStatus;
  accent: string | null;
}) {
  const { viewport } = useThree();
  const root = useRef<Group>(null);
  const icon = useRef<Group>(null);
  const aura = useRef<Group>(null);
  const smoothedAmp = useRef(0);
  const smoothedMute = useRef(1);
  const smoothedScale = useRef(1);
  const colorGoal = useRef(new Color());
  const emissiveGoal = useRef(new Color());
  const mutedColor = useRef(new Color(MUTED));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const material = useMemo(() => {
    const c = ACT_ICON_PALETTE[id].primary;
    return new MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.25,
      metalness: 0.22,
      roughness: 0.45,
      transparent: true,
      opacity: 0.95,
    });
  }, [id]);

  const auraMaterial = useMemo(() => {
    const c = ACT_ICON_PALETTE[id].accent;
    return new MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.35,
      metalness: 0,
      roughness: 1,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });
  }, [id]);

  useEffect(
    () => () => {
      material.dispose();
      auraMaterial.dispose();
    },
    [material, auraMaterial]
  );

  const colIndex = blobIndex + 1;
  const x = ((colIndex + 0.5) / COLS - 0.5) * viewport.width;
  const targets = statusToMotion({ selected, hovered, status });
  const active = selected || hovered;
  const current = status === "current";

  useFrame((state, delta) => {
    const lerpSpeed = 1 - Math.pow(0.001, delta);
    smoothedAmp.current += (targets.amp - smoothedAmp.current) * lerpSpeed;
    smoothedMute.current += (targets.mute - smoothedMute.current) * lerpSpeed;
    smoothedScale.current += (targets.scale - smoothedScale.current) * lerpSpeed;

    const palette = ACT_ICON_PALETTE[id];
    const live =
      accent && (current || active) ? accent : palette.primary;
    colorGoal.current.set(live).lerp(mutedColor.current, smoothedMute.current);
    emissiveGoal.current
      .set(accent && (current || active) ? accent : palette.accent)
      .lerp(mutedColor.current, Math.min(1, smoothedMute.current + 0.15));

    material.color.copy(colorGoal.current);
    material.emissive.copy(emissiveGoal.current);
    material.emissiveIntensity =
      0.12 + smoothedAmp.current * 0.55 * (1 - smoothedMute.current * 0.7);
    material.opacity = 0.55 + (1 - smoothedMute.current) * 0.4;

    auraMaterial.color.copy(emissiveGoal.current);
    auraMaterial.emissive.copy(emissiveGoal.current);
    auraMaterial.opacity = 0.06 + smoothedAmp.current * 0.16 * (1 - smoothedMute.current);

    if (!root.current || !icon.current) return;

    const t = state.clock.elapsedTime + blobIndex * 1.7;
    const pulse = reduceMotion
      ? 1
      : 1 +
        Math.sin(t * 0.35) * 0.04 +
        Math.sin(t * 0.13 + 1.7) * 0.025 +
        smoothedAmp.current * 0.05 +
        (current ? Math.sin(t * 2.2) * 0.02 : 0);

    const s = radius * 1.35 * smoothedScale.current * pulse;
    root.current.scale.setScalar(s);
    root.current.position.y = reduceMotion
      ? 0
      : Math.sin(t * 0.4) * radius * 0.06;

    if (!reduceMotion) {
      icon.current.rotation.y += delta * (active || current ? 0.55 : 0.18);
      icon.current.rotation.x = Math.sin(t * 0.25) * 0.08;
    } else {
      icon.current.rotation.y = 0.35;
      icon.current.rotation.x = 0.1;
    }

    if (aura.current) {
      aura.current.rotation.z = reduceMotion ? 0 : t * 0.15;
      const auraScale = 1.15 + smoothedAmp.current * 0.2;
      aura.current.scale.setScalar(auraScale);
    }
  });

  return (
    <group position={[x, 0, 0]}>
      <group ref={root}>
        <group ref={aura} position={[0, 0, -0.15]}>
          <mesh material={auraMaterial}>
            <circleGeometry args={[0.55, 24]} />
          </mesh>
        </group>
        <group ref={icon}>
          <ActIconMeshes act={id} material={material} />
        </group>
      </group>
    </group>
  );
}

export { COLS };
