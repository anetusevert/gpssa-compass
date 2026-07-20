"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Color, type Group, type Mesh, type MeshStandardMaterial } from "three";
import type { SpineNodeId } from "@/lib/spine/types";

const ORDER: SpineNodeId[] = ["episode", "journey", "process", "systems", "qa"];

/** Planet palette — episode green through QA gold. */
const BASE: Record<SpineNodeId, string> = {
  episode: "#00A86B",
  journey: "#3B82C4",
  process: "#C99A3C",
  systems: "#B0764A",
  qa: "#C5A572",
};

const MUTED = "#33475e";

function NodeOrb({
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
  const planet = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const ring = useRef<Mesh>(null);
  const mat = useRef<MeshStandardMaterial>(null);
  const haloMat = useRef<MeshStandardMaterial>(null);
  const ringMat = useRef<MeshStandardMaterial>(null);
  const color = useRef(new Color(BASE[id]));
  const goal = useRef(new Color());

  // Column-aligned: orb sits at the center of its fifth of the stage width.
  const x = ((index + 0.5) / 5 - 0.5) * viewport.width;

  const active = selected || hovered;
  // Only the active planet keeps its saturated color; the rest stay muted.
  const targetHex =
    conducting && emphasized && accent ? accent : active ? BASE[id] : dimmed ? MUTED : BASE[id];
  const saturation = active || (conducting && emphasized) ? 1 : 0.45;

  useFrame((_, delta) => {
    const t = Math.min(1, delta * 3.5);
    goal.current.set(targetHex);
    if (saturation < 1) {
      // Blend toward muted for inactive planets
      goal.current.lerp(new Color(MUTED), 1 - saturation);
    }
    color.current.lerp(goal.current, t);

    if (mat.current) {
      mat.current.color.copy(color.current);
      mat.current.emissive.copy(color.current);
      mat.current.emissiveIntensity +=
        ((active ? 0.55 : emphasized ? 0.32 : 0.1) - mat.current.emissiveIntensity) * t;
    }
    if (haloMat.current) {
      haloMat.current.color.copy(color.current);
      haloMat.current.opacity += ((active ? 0.2 : 0.07) - haloMat.current.opacity) * t;
    }
    if (planet.current) {
      const s = active ? 1.16 : emphasized ? 1.06 : dimmed ? 0.92 : 1;
      const cur = planet.current.scale.x / radius;
      const next = cur + (s - cur) * t;
      planet.current.scale.setScalar(next * radius);
      planet.current.rotation.y += delta * (active ? 0.9 : 0.25);
    }
    if (halo.current && planet.current) {
      halo.current.scale.copy(planet.current.scale).multiplyScalar(1.25);
    }
    if (ring.current && ringMat.current) {
      const target = active ? 0.65 : 0;
      ringMat.current.opacity += (target - ringMat.current.opacity) * t;
      ringMat.current.color.copy(color.current);
      ring.current.rotation.z += delta * 0.4;
      ring.current.scale.setScalar((planet.current?.scale.x ?? radius) * 1.55);
    }
  });

  return (
    <Float speed={1 + index * 0.12} rotationIntensity={0.1} floatIntensity={0.25}>
      <group position={[x, 0, 0]}>
        <mesh ref={halo}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial
            ref={haloMat}
            color={BASE[id]}
            transparent
            opacity={0.07}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={planet} scale={radius}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial
            ref={mat}
            color={BASE[id]}
            roughness={0.38}
            metalness={0.3}
            emissive={BASE[id]}
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh ref={ring} rotation={[Math.PI / 2.4, 0.4, 0]}>
          <torusGeometry args={[1, 0.025, 12, 64]} />
          <meshStandardMaterial
            ref={ringMat}
            color={BASE[id]}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      </group>
    </Float>
  );
}

function OrbitLine() {
  const { viewport } = useThree();
  return (
    <mesh position={[0, 0, -2]}>
      <planeGeometry args={[viewport.width * 0.82, 0.01]} />
      <meshBasicMaterial color="#3a5570" transparent opacity={0.4} />
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

  // Identical radius for all planets, capped by both column width and stage height.
  const radius = Math.min(viewport.height / 2.9, viewport.width / 14);

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 8]} intensity={1.25} color="#eef7f2" />
      <pointLight position={[-4, -2, 5]} intensity={0.3} color="#4899FF" />
      <group ref={group}>
        <OrbitLine />
        {ORDER.map((id, i) => {
          const emp = emphasized.has(id);
          const isActive = selected === id || hovered === id;
          const dimmed = !isActive && (hasEmphasis ? !emp : true);
          return (
            <NodeOrb
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
