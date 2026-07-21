"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Color, MeshPhysicalMaterial, type Group } from "three";
import {
  prefersReducedMotion,
  statusToMotion,
} from "@/lib/spine/act-icon-motion";
import type { ActStatus, ConductorAct } from "@/lib/spine/conductor-acts";
import { ActIconMeshes } from "./ActIconMeshes";

/** Brighter, more separated hues so acts read apart through glass. */
export const ACT_ICON_PALETTE: Record<
  Exclude<ConductorAct, "persona">,
  { primary: string; secondary: string; accent: string }
> = {
  episode: { primary: "#12C47A", secondary: "#5EE9A8", accent: "#D4FFE8" },
  journey: { primary: "#4A9BE8", secondary: "#8FCBFF", accent: "#E8F4FF" },
  process: { primary: "#E0B04A", secondary: "#F5D078", accent: "#FFF3D0" },
  systems: { primary: "#D48955", secondary: "#F0B08A", accent: "#FFE4D0" },
  qa: { primary: "#D4B06A", secondary: "#EED9A0", accent: "#FFF6DE" },
};

const MUTED = "#3a5068";
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
  const smoothedAmp = useRef(0);
  const smoothedMute = useRef(1);
  const smoothedScale = useRef(1);
  const colorGoal = useRef(new Color());
  const emissiveGoal = useRef(new Color());
  const accentColorGoal = useRef(new Color());
  const mutedColor = useRef(new Color(MUTED));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const bodyMaterial = useMemo(() => {
    const c = ACT_ICON_PALETTE[id].primary;
    return new MeshPhysicalMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.2,
      metalness: 0.05,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transmission: 0.72,
      thickness: 0.55,
      ior: 1.38,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      attenuationColor: c,
      attenuationDistance: 1.2,
    });
  }, [id]);

  const accentMaterial = useMemo(() => {
    const c = ACT_ICON_PALETTE[id].accent;
    return new MeshPhysicalMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.55,
      metalness: 0.15,
      roughness: 0.2,
      clearcoat: 0.8,
      transmission: 0.25,
      thickness: 0.25,
      transparent: true,
      opacity: 0.78,
      depthWrite: false,
    });
  }, [id]);

  useEffect(
    () => () => {
      bodyMaterial.dispose();
      accentMaterial.dispose();
    },
    [bodyMaterial, accentMaterial]
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
    const mute = smoothedMute.current;

    colorGoal.current.set(live).lerp(mutedColor.current, mute * 0.85);
    emissiveGoal.current
      .set(accent && (current || active) ? accent : palette.secondary)
      .lerp(mutedColor.current, Math.min(1, mute * 0.9));
    accentColorGoal.current
      .set(palette.accent)
      .lerp(mutedColor.current, mute * 0.7);

    const glassOpen = 0.28 + (1 - mute) * 0.22 + smoothedAmp.current * 0.08;
    const transmission = 0.55 + (1 - mute) * 0.28;

    bodyMaterial.color.copy(colorGoal.current);
    bodyMaterial.emissive.copy(emissiveGoal.current);
    bodyMaterial.emissiveIntensity =
      0.08 + smoothedAmp.current * 0.35 * (1 - mute * 0.6);
    bodyMaterial.opacity = glassOpen;
    bodyMaterial.transmission = transmission;
    bodyMaterial.attenuationColor.copy(colorGoal.current);

    accentMaterial.color.copy(accentColorGoal.current);
    accentMaterial.emissive.copy(accentColorGoal.current);
    accentMaterial.emissiveIntensity =
      0.35 + smoothedAmp.current * 0.45 * (1 - mute);
    accentMaterial.opacity = 0.55 + (1 - mute) * 0.3;
    accentMaterial.transmission = 0.15 + (1 - mute) * 0.2;

    if (!root.current || !icon.current) return;

    const t = state.clock.elapsedTime + blobIndex * 1.7;
    const pulse = reduceMotion
      ? 1
      : 1 +
        Math.sin(t * 0.35) * 0.035 +
        Math.sin(t * 0.13 + 1.7) * 0.02 +
        smoothedAmp.current * 0.045 +
        (current ? Math.sin(t * 2.2) * 0.018 : 0);

    const s = radius * 1.5 * smoothedScale.current * pulse;
    root.current.scale.setScalar(s);
    root.current.position.y = reduceMotion
      ? 0
      : Math.sin(t * 0.4) * radius * 0.06;

    // Gentle turn — slower so local icon animations stay readable
    if (!reduceMotion) {
      icon.current.rotation.y += delta * (active || current ? 0.32 : 0.12);
      icon.current.rotation.x = 0.12 + Math.sin(t * 0.22) * 0.05;
    } else {
      icon.current.rotation.y = 0.4;
      icon.current.rotation.x = 0.15;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      <group ref={root}>
        <group ref={icon}>
          <ActIconMeshes
            act={id}
            body={bodyMaterial}
            accent={accentMaterial}
            reduceMotion={reduceMotion}
            amp={targets.amp}
          />
        </group>
      </group>
    </group>
  );
}

export { COLS };
