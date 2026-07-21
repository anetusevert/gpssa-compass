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

/** Reference-aligned hues: emerald / silver / cyan / neon green. */
export const ACT_ICON_PALETTE: Record<
  Exclude<ConductorAct, "persona">,
  { primary: string; secondary: string; accent: string; metal: string; energy: string }
> = {
  episode: {
    primary: "#0F6B45",
    secondary: "#1A8F5C",
    accent: "#E8E4DC",
    metal: "#C5CDD6",
    energy: "#3DFF9A",
  },
  journey: {
    primary: "#128A56",
    secondary: "#1FB86E",
    accent: "#F2F5F8",
    metal: "#B8C0CA",
    energy: "#4CFFA0",
  },
  process: {
    primary: "#9AA3AD",
    secondary: "#C0C8D0",
    accent: "#E8EEF4",
    metal: "#A8B0BA",
    energy: "#39FF14",
  },
  systems: {
    primary: "#3A7A7E",
    secondary: "#4A9498",
    accent: "#1A2830",
    metal: "#B8C0C8",
    energy: "#3EC8D0",
  },
  qa: {
    primary: "#2A5F6E",
    secondary: "#3A7A8A",
    accent: "#8A9AA4",
    metal: "#C5CAD0",
    energy: "#5AB8C8",
  },
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
  const metalColorGoal = useRef(new Color());
  const energyColorGoal = useRef(new Color());
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
    const isSolid = id === "qa" || id === "systems";
    return new MeshPhysicalMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.1,
      metalness: isSolid
        ? 0.45
        : id === "process"
          ? 0.75
          : id === "journey" || id === "episode"
            ? 0.35
            : 0.08,
      roughness: isSolid ? 0.48 : id === "episode" ? 0.45 : id === "process" ? 0.35 : 0.18,
      clearcoat: isSolid ? 0.25 : 0.55,
      clearcoatRoughness: 0.12,
      transmission: isSolid ? 0 : id === "episode" ? 0.15 : 0.35,
      thickness: 0.35,
      ior: 1.4,
      transparent: !isSolid,
      opacity: isSolid ? 1 : id === "episode" ? 0.92 : 0.75,
      depthWrite: true,
      attenuationColor: c,
      attenuationDistance: 1.2,
    });
  }, [id]);

  const accentMaterial = useMemo(() => {
    const c = ACT_ICON_PALETTE[id].accent;
    const isScreen = id === "systems";
    return new MeshPhysicalMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: isScreen ? 0.08 : 0.25,
      metalness: isScreen ? 0.2 : 0.1,
      roughness: isScreen ? 0.55 : 0.35,
      clearcoat: 0.3,
      transmission: 0.1,
      thickness: 0.2,
      transparent: !isScreen,
      opacity: isScreen ? 1 : 0.85,
      depthWrite: isScreen,
    });
  }, [id]);

  const metalMaterial = useMemo(() => {
    const c = ACT_ICON_PALETTE[id].metal;
    const isMatte = id === "qa" || id === "systems";
    return new MeshPhysicalMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.06,
      metalness: isMatte ? 0.55 : 0.92,
      roughness: isMatte ? 0.42 : 0.28,
      clearcoat: isMatte ? 0.2 : 0.6,
      clearcoatRoughness: 0.2,
      transparent: false,
      opacity: 1,
    });
  }, [id]);

  const energyMaterial = useMemo(() => {
    const c = ACT_ICON_PALETTE[id].energy;
    return new MeshPhysicalMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 1.4,
      metalness: 0.05,
      roughness: 0.15,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      toneMapped: false,
    });
  }, [id]);

  useEffect(
    () => () => {
      bodyMaterial.dispose();
      accentMaterial.dispose();
      metalMaterial.dispose();
      energyMaterial.dispose();
    },
    [bodyMaterial, accentMaterial, metalMaterial, energyMaterial]
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
    const isSolid = id === "qa" || id === "systems";

    colorGoal.current.set(live).lerp(mutedColor.current, mute * 0.85);
    emissiveGoal.current
      .set(accent && (current || active) ? accent : palette.secondary)
      .lerp(mutedColor.current, Math.min(1, mute * 0.9));
    accentColorGoal.current
      .set(palette.accent)
      .lerp(mutedColor.current, mute * 0.7);
    metalColorGoal.current
      .set(palette.metal)
      .lerp(mutedColor.current, mute * 0.75);
    energyColorGoal.current
      .set(palette.energy)
      .lerp(mutedColor.current, mute * 0.85);

    bodyMaterial.color.copy(colorGoal.current);
    bodyMaterial.emissive.copy(emissiveGoal.current);
    bodyMaterial.emissiveIntensity =
      0.06 + smoothedAmp.current * 0.28 * (1 - mute * 0.6);
    if (isSolid) {
      bodyMaterial.opacity = 1;
    } else {
      bodyMaterial.opacity =
        id === "episode"
          ? 0.75 + (1 - mute) * 0.2
          : 0.55 + (1 - mute) * 0.3;
    }

    accentMaterial.color.copy(accentColorGoal.current);
    accentMaterial.emissive.copy(accentColorGoal.current);
    accentMaterial.emissiveIntensity =
      (id === "systems" ? 0.05 : 0.15) + smoothedAmp.current * 0.35 * (1 - mute);
    accentMaterial.opacity =
      id === "systems" ? 1 : 0.55 + (1 - mute) * 0.35;

    metalMaterial.color.copy(metalColorGoal.current);
    metalMaterial.emissive.copy(metalColorGoal.current);
    metalMaterial.emissiveIntensity = 0.04 + smoothedAmp.current * 0.12 * (1 - mute);

    energyMaterial.color.copy(energyColorGoal.current);
    energyMaterial.emissive.copy(energyColorGoal.current);
    energyMaterial.emissiveIntensity =
      0.6 + smoothedAmp.current * 1.1 * (1 - mute);
    energyMaterial.opacity = 0.55 + (1 - mute) * 0.4;

    if (!root.current || !icon.current) return;

    const t = state.clock.elapsedTime + blobIndex * 1.7;
    const pulse = reduceMotion
      ? 1
      : 1 +
        Math.sin(t * 0.35) * 0.035 +
        Math.sin(t * 0.13 + 1.7) * 0.02 +
        smoothedAmp.current * 0.045 +
        (current ? Math.sin(t * 2.2) * 0.018 : 0);

    const s = radius * 1.55 * smoothedScale.current * pulse;
    root.current.scale.setScalar(s);
    root.current.position.y = reduceMotion
      ? 0
      : Math.sin(t * 0.4) * radius * 0.06;

    // Slow turn so local icon animations stay readable
    if (!reduceMotion) {
      icon.current.rotation.y += delta * (active || current ? 0.28 : 0.1);
      icon.current.rotation.x = 0.1 + Math.sin(t * 0.22) * 0.04;
    } else {
      icon.current.rotation.y = 0.35;
      icon.current.rotation.x = 0.12;
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
            metal={metalMaterial}
            energy={energyMaterial}
            reduceMotion={reduceMotion}
            amp={targets.amp}
          />
        </group>
      </group>
    </group>
  );
}

export { COLS };
