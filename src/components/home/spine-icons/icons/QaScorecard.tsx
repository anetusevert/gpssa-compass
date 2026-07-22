"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Material, Mesh } from "three";
import { ease } from "./shared";

/** Clay scorecard — bars and checks fill in sequence; board always fully visible. */
export function QaScorecard({
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
  const bars = useRef<Group>(null);
  const checks = useRef<Group>(null);
  const CYCLE = 3.4;

  useFrame((state) => {
    const speed = 0.9 + amp * 0.25;
    const t = reduceMotion
      ? CYCLE * 0.85
      : (state.clock.elapsedTime * speed) % CYCLE;

    const fills = [0.85, 0.7, 0.95, 0.6];
    if (bars.current) {
      bars.current.children.forEach((child, i) => {
        const mesh = child as Mesh;
        const local = reduceMotion ? 1 : ease((t - i * 0.35) / 0.55);
        const f = Math.max(0.12, local) * fills[i];
        mesh.scale.x = f;
        // grow from left
        mesh.position.x = -0.16 + (0.32 * f) / 2;
      });
    }

    if (checks.current) {
      checks.current.children.forEach((child, i) => {
        const local = reduceMotion ? 1 : ease((t - 0.4 - i * 0.35) / 0.4);
        const s = 0.75 + local * 0.35;
        child.scale.setScalar(Math.max(0.75, s));
        child.position.z = local > 0.5 ? 0.02 : 0;
      });
    }

    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 1.15) * 0.012;
      root.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.7) * 0.03;
    }
  });

  const rows = [-0.06, 0.08, 0.22, 0.36];

  return (
    <group ref={root} rotation={[0.35, 0.45, -0.08]} scale={1.05}>
      {/* Board */}
      <mesh material={body} position={[0, 0.08, 0]}>
        <boxGeometry args={[0.72, 0.9, 0.08]} />
      </mesh>
      {/* Header clip */}
      <mesh material={accent} position={[0, 0.48, 0.05]}>
        <boxGeometry args={[0.28, 0.1, 0.06]} />
      </mesh>
      <mesh material={body} position={[0, 0.48, 0.09]}>
        <cylinderGeometry args={[0.035, 0.035, 0.05, 12]} />
      </mesh>
      {/* Title bar */}
      <mesh material={accent} position={[0, 0.32, 0.05]}>
        <boxGeometry args={[0.5, 0.06, 0.03]} />
      </mesh>

      {/* Row tracks */}
      {rows.map((y, i) => (
        <group key={i} position={[0, y, 0.05]}>
          <mesh material={accent} position={[-0.02, 0, 0]}>
            <boxGeometry args={[0.4, 0.055, 0.025]} />
          </mesh>
          {/* Checkbox circle */}
          <mesh material={body} position={[0.26, 0, 0.01]}>
            <cylinderGeometry args={[0.045, 0.045, 0.03, 14]} />
          </mesh>
        </group>
      ))}

      {/* Filling bars */}
      <group ref={bars}>
        {rows.map((y, i) => (
          <mesh
            key={i}
            material={energy}
            position={[-0.16, y, 0.07]}
          >
            <boxGeometry args={[0.32, 0.04, 0.03]} />
          </mesh>
        ))}
      </group>

      {/* Checks */}
      <group ref={checks}>
        {rows.map((y, i) => (
          <group key={i} position={[0.26, y, 0.08]}>
            <mesh material={energy} rotation={[0, 0, 0.7]} position={[-0.012, -0.008, 0]}>
              <boxGeometry args={[0.018, 0.05, 0.02]} />
            </mesh>
            <mesh material={energy} rotation={[0, 0, -0.85]} position={[0.015, 0.005, 0]}>
              <boxGeometry args={[0.018, 0.07, 0.02]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
