"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Material, Mesh } from "three";
import { ease } from "./shared";

/** Classical process map: start → tasks → decision → end. Nodes always visible. */
export function ProcessMap({
  body,
  accent,
  energy,
  reduceMotion,
  amp,
}: {
  body: Material;
  accent: Material;
  energy: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  const root = useRef<Group>(null);
  const nodes = useRef<Group>(null);
  const flow = useRef<Mesh>(null);
  const CYCLE = 3.2;

  useFrame((state) => {
    const speed = 1 + amp * 0.2;
    const t = reduceMotion
      ? CYCLE * 0.5
      : (state.clock.elapsedTime * speed) % CYCLE;
    const step = Math.floor((t / CYCLE) * 5) % 5;

    if (nodes.current) {
      nodes.current.children.forEach((child, i) => {
        const active = i === step;
        const s = active ? 1.12 : 0.94;
        child.scale.setScalar(Math.max(0.9, s));
        child.position.y = active ? 0.03 : 0;
      });
    }

    // Flow pulse travels along the chain (x from -0.42 → 0.42)
    if (flow.current) {
      const p = reduceMotion ? 0.5 : ease((t % CYCLE) / CYCLE);
      flow.current.position.x = -0.42 + p * 0.84;
      flow.current.visible = true;
      const pulse = 0.9 + Math.sin(state.clock.elapsedTime * 6) * 0.12;
      flow.current.scale.setScalar(pulse);
    }

    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.012;
    }
  });

  return (
    <group ref={root} rotation={[0.55, 0.4, -0.15]} scale={0.95}>
      {/* Connector pipe */}
      <mesh material={body} position={[0, 0, -0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.92, 12]} />
      </mesh>
      {/* Arrow chevrons along path */}
      {[-0.2, 0.05, 0.28].map((x, i) => (
        <mesh key={i} material={accent} position={[x, 0.02, 0.04]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.04, 0.07, 4]} />
        </mesh>
      ))}

      <mesh ref={flow} material={energy} position={[-0.42, 0.06, 0.06]}>
        <sphereGeometry args={[0.045, 12, 12]} />
      </mesh>

      <group ref={nodes}>
        {/* 0 Start oval */}
        <group position={[-0.42, 0, 0]}>
          <mesh material={body} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.09, 0.08, 6, 12]} />
          </mesh>
          <mesh material={accent} position={[0, 0.05, 0]}>
            <boxGeometry args={[0.08, 0.02, 0.04]} />
          </mesh>
        </group>

        {/* 1 Task rect */}
        <group position={[-0.18, 0, 0]}>
          <mesh material={body}>
            <boxGeometry args={[0.2, 0.14, 0.1]} />
          </mesh>
          <mesh material={accent} position={[0, 0.08, 0]}>
            <boxGeometry args={[0.14, 0.02, 0.06]} />
          </mesh>
        </group>

        {/* 2 Decision diamond */}
        <group position={[0.08, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <mesh material={body}>
            <boxGeometry args={[0.16, 0.16, 0.1]} />
          </mesh>
        </group>

        {/* 3 Task rect */}
        <group position={[0.32, 0, 0]}>
          <mesh material={body}>
            <boxGeometry args={[0.2, 0.14, 0.1]} />
          </mesh>
          <mesh material={accent} position={[0, 0.08, 0]}>
            <boxGeometry args={[0.12, 0.02, 0.06]} />
          </mesh>
        </group>

        {/* 4 End oval */}
        <group position={[0.52, 0, 0]}>
          <mesh material={body} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.085, 0.07, 6, 12]} />
          </mesh>
          <mesh material={energy} position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.03, 10, 10]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
