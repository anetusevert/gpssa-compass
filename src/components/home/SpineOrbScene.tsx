"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import { Color, type Mesh, type Group } from "three";
import type { SpineNodeId } from "@/lib/spine/types";

const ORDER: SpineNodeId[] = ["episode", "journey", "process", "systems", "qa"];

const BASE: Record<SpineNodeId, string> = {
  episode: "#00A86B",
  journey: "#2DD4BF",
  process: "#E7B02E",
  systems: "#4899FF",
  qa: "#C5A572",
};

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
  const mesh = useRef<Mesh>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mat = useRef<any>(null);
  const color = useRef(new Color());
  const goal = useRef(new Color());

  const baseColor = BASE[id];
  const targetHex =
    conducting && emphasized && accent
      ? accent
      : hovered || selected
        ? baseColor
        : dimmed
          ? "#1a3048"
          : baseColor;

  const x = (index - 2) * 1.55;

  useFrame((state, delta) => {
    const t = Math.min(1, delta * 3);
    goal.current.set(targetHex);
    color.current.lerp(goal.current, t);
    if (mat.current) {
      mat.current.color.copy(color.current);
      mat.current.distort = selected || hovered ? 0.42 : emphasized ? 0.32 : 0.22;
      mat.current.speed = selected || hovered ? 2.2 : 1.4;
    }
    if (mesh.current) {
      const s = selected ? 1.15 : hovered ? 1.08 : emphasized ? 1.05 : dimmed ? 0.85 : 1;
      const cur = mesh.current.scale.x;
      mesh.current.scale.setScalar(cur + (s - cur) * t);
      mesh.current.rotation.y += delta * (hovered || selected ? 0.55 : 0.2);
      mesh.current.position.y = Math.sin(state.clock.elapsedTime * 1.2 + index) * 0.08;
    }
  });

  return (
    <Float speed={1.1 + index * 0.05} rotationIntensity={0.2} floatIntensity={0.25}>
      <group position={[x, 0, 0]}>
        <mesh ref={mesh}>
          <icosahedronGeometry args={[0.42, 6]} />
          <MeshDistortMaterial
            ref={mat}
            color={baseColor}
            distort={0.25}
            speed={1.4}
            roughness={0.25}
            metalness={0.45}
          />
        </mesh>
        {(selected || hovered) && (
          <mesh rotation={[Math.PI / 2.2, 0, 0]} scale={1.35}>
            <torusGeometry args={[0.42, 0.02, 12, 48]} />
            <meshBasicMaterial color={targetHex} transparent opacity={0.55} />
          </mesh>
        )}
      </group>
    </Float>
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

  const nodes = useMemo(() => ORDER, []);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(Date.now() * 0.00015) * 0.04;
      group.current.position.y += (0 - group.current.position.y) * Math.min(1, delta * 2);
    }
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} color="#e8f5ef" />
      <pointLight position={[-2, 1, -2]} intensity={0.4} color="#4899FF" />
      <group ref={group}>
        {nodes.map((id, i) => {
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
