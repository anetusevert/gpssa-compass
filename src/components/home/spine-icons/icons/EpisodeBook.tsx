"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Material } from "three";

/** Closed emerald book with brushed-metal hardware — quality bar for the strip. */
export function EpisodeBook({
  body,
  accent,
  metal,
  reduceMotion,
  amp,
}: {
  body: Material;
  accent: Material;
  metal: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  const root = useRef<Group>(null);
  const cover = useRef<Group>(null);

  useFrame((state) => {
    if (!root.current) return;
    const t = state.clock.elapsedTime;
    if (!reduceMotion) {
      root.current.position.y = Math.sin(t * 1.35) * 0.025 * (0.6 + amp);
      root.current.rotation.z = Math.sin(t * 0.7) * 0.04;
      if (cover.current) {
        cover.current.rotation.y =
          -0.02 + Math.sin(t * (0.9 + amp * 0.4)) * 0.06;
      }
    }
  });

  return (
    <group ref={root} rotation={[0.35, 0.55, -0.08]}>
      <mesh material={accent} position={[0.02, 0, 0]}>
        <boxGeometry args={[0.52, 0.78, 0.22]} />
      </mesh>
      {[-0.08, -0.02, 0.04, 0.1].map((z, i) => (
        <mesh key={i} material={accent} position={[0.28, 0, z]} scale={[1, 1, 0.15]}>
          <boxGeometry args={[0.01, 0.74, 0.2]} />
        </mesh>
      ))}

      <group ref={cover} position={[0, 0, 0.13]}>
        <mesh material={body}>
          <boxGeometry args={[0.56, 0.84, 0.04]} />
        </mesh>
        <mesh material={metal} position={[-0.18, 0, 0.025]}>
          <boxGeometry args={[0.07, 0.82, 0.02]} />
        </mesh>
        <mesh material={metal} position={[0.22, 0.34, 0.028]}>
          <boxGeometry args={[0.14, 0.14, 0.018]} />
        </mesh>
        <mesh material={metal} position={[0.22, -0.34, 0.028]}>
          <boxGeometry args={[0.14, 0.14, 0.018]} />
        </mesh>
        <mesh material={metal} position={[0.26, 0.02, 0.03]}>
          <boxGeometry args={[0.08, 0.16, 0.025]} />
        </mesh>
        <mesh material={accent} position={[0.26, 0.05, 0.045]}>
          <sphereGeometry args={[0.018, 8, 8]} />
        </mesh>
        <mesh material={accent} position={[0.26, -0.02, 0.045]}>
          <sphereGeometry args={[0.018, 8, 8]} />
        </mesh>
      </group>

      <mesh material={body} position={[0, 0, -0.13]}>
        <boxGeometry args={[0.56, 0.84, 0.04]} />
      </mesh>
      <mesh material={body} position={[-0.29, 0, 0]}>
        <boxGeometry args={[0.06, 0.84, 0.26]} />
      </mesh>
      <mesh material={metal} position={[-0.3, 0.22, 0]}>
        <boxGeometry args={[0.04, 0.05, 0.24]} />
      </mesh>
      <mesh material={metal} position={[-0.3, -0.22, 0]}>
        <boxGeometry args={[0.04, 0.05, 0.24]} />
      </mesh>
    </group>
  );
}
