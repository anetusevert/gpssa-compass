"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { Color, type Group, type Mesh, type MeshStandardMaterial } from "three";
import type { SpineNodeId } from "@/lib/spine/types";

const ORDER: SpineNodeId[] = ["episode", "journey", "process", "systems", "qa"];

/** Planet palette — episode green through QA gold, like a small solar system. */
const BASE: Record<SpineNodeId, string> = {
  episode: "#00A86B",
  journey: "#3B82C4",
  process: "#C99A3C",
  systems: "#B0764A",
  qa: "#C5A572",
};

const DIM = "#22384f";

function NodeOrb({
  id,
  index,
  selected,
  hovered,
  emphasized,
  conducting,
  accent,
  dimmed,
}: {
  id: SpineNodeId;
  index: number;
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
  const color = useRef(new Color(BASE[id]));
  const goal = useRef(new Color());

  // Column-aligned: orb sits at the center of its fifth of the stage width.
  const x = ((index + 0.5) / 5 - 0.5) * viewport.width;
  const r = Math.min(viewport.width / 15, viewport.height / 3.4);

  const targetHex =
    conducting && emphasized && accent
      ? accent
      : dimmed
        ? DIM
        : BASE[id];

  const active = selected || hovered;

  useFrame((state, delta) => {
    const t = Math.min(1, delta * 3.5);
    goal.current.set(targetHex);
    color.current.lerp(goal.current, t);

    if (mat.current) {
      mat.current.color.copy(color.current);
      mat.current.emissive.copy(color.current);
      mat.current.emissiveIntensity +=
        ((active ? 0.5 : emphasized ? 0.3 : 0.12) - mat.current.emissiveIntensity) * t;
    }
    if (haloMat.current) {
      haloMat.current.color.copy(color.current);
      haloMat.current.opacity += ((active ? 0.22 : 0.1) - haloMat.current.opacity) * t;
    }
    if (planet.current) {
      const s = active ? 1.18 : emphasized ? 1.08 : dimmed ? 0.88 : 1;
      const cur = planet.current.scale.x / r;
      const next = cur + (s - cur) * t;
      planet.current.scale.setScalar(next * r);
      planet.current.rotation.y += delta * (active ? 0.8 : 0.25);
    }
    if (halo.current && planet.current) {
      halo.current.scale.copy(planet.current.scale).multiplyScalar(1.28);
    }
    if (ring.current) {
      const target = active ? 1 : 0;
      const cur = (ring.current.material as MeshStandardMaterial).opacity ?? 0;
      (ring.current.material as MeshStandardMaterial).opacity = cur + (target * 0.6 - cur) * t;
      ring.current.rotation.z += delta * 0.4;
      ring.current.scale.setScalar((planet.current?.scale.x ?? r) * 1.7);
      (ring.current.material as MeshStandardMaterial).color.copy(color.current);
    }
  });

  return (
    <Float speed={1 + index * 0.12} rotationIntensity={0.12} floatIntensity={0.35}>
      <group position={[x, 0, 0]}>
        {/* Atmosphere halo */}
        <mesh ref={halo}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshStandardMaterial
            ref={haloMat}
            color={BASE[id]}
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
        {/* Planet body */}
        <mesh ref={planet} scale={r}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshStandardMaterial
            ref={mat}
            color={BASE[id]}
            roughness={0.38}
            metalness={0.3}
            emissive={BASE[id]}
            emissiveIntensity={0.12}
          />
        </mesh>
        {/* Saturn-style ring on focus */}
        <mesh ref={ring} rotation={[Math.PI / 2.6, 0.35, 0]}>
          <torusGeometry args={[1, 0.02, 12, 64]} />
          <meshStandardMaterial
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
    <mesh position={[0, 0, -0.5]}>
      <planeGeometry args={[viewport.width * 0.82, 0.012]} />
      <meshBasicMaterial color="#3a5570" transparent opacity={0.45} />
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
  const hasEmphasis = conducting && emphasized.size > 0;

  useFrame((state) => {
    if (group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 3]} intensity={1.3} color="#eef7f2" />
      <pointLight position={[-3, -1, 2]} intensity={0.35} color="#4899FF" />
      <group ref={group}>
        <OrbitLine />
        {ORDER.map((id, i) => {
          const emp = emphasized.has(id);
          const dimmed = hasEmphasis && !emp && selected !== id && hovered !== id;
          return (
            <NodeOrb
              key={id}
              id={id}
              index={i}
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
