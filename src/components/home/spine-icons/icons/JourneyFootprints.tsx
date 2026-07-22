"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Material } from "three";
import { useFootprintGeometry } from "./shared";

function FootprintMesh({
  material,
  flip,
  groupRef,
}: {
  material: Material;
  flip?: boolean;
  groupRef: RefObject<Group | null>;
}) {
  const { sole, toes } = useFootprintGeometry();
  return (
    <group ref={groupRef as RefObject<Group]}>
      <group scale={[flip ? -1 : 1, 1, 1]}>
        <mesh geometry={sole} material={material} />
        <mesh material={material} position={[0, 0.038, -0.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.075, 0.04, 16]} />
        </mesh>
        {toes.map(([x, z, r], i) => (
          <mesh
            key={i}
            material={material}
            position={[x, 0.036, z]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[r, r * 0.92, 0.068, 14]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/**
 * Three sage footprints always visible; active step presses in L→R→L over ~3s.
 */
export function JourneyFootprints({
  body,
  reduceMotion,
  amp,
}: {
  body: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  const root = useRef<Group>(null);
  const f0 = useRef<Group>(null);
  const f1 = useRef<Group>(null);
  const f2 = useRef<Group>(null);
  const CYCLE = 3;

  useFrame((state) => {
    const speed = 1 + amp * 0.12;
    const t = reduceMotion
      ? 1.6
      : (state.clock.elapsedTime * speed) % CYCLE;
    const active = reduceMotion ? 1 : Math.floor((t / CYCLE) * 3) % 3;
    const prints = [f0, f1, f2];

    prints.forEach((ref, i) => {
      const g = ref.current;
      if (!g) return;
      const isActive = i === active;
      const press = isActive && !reduceMotion
        ? 1.08 + Math.sin((t / (CYCLE / 3)) * Math.PI) * 0.04
        : 0.92;
      // Never disappear — floor scale
      const s = Math.max(0.88, press);
      g.scale.setScalar(s);
      g.position.y = isActive ? 0.04 : 0;
    });

    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 1.05) * 0.012;
    }
  });

  return (
    <group ref={root} rotation={[0.72, 0.35, -0.42]} scale={1.15}>
      <group position={[-0.24, 0, -0.22]} rotation={[0, 0.2, 0.08]}>
        <FootprintMesh material={body} groupRef={f0} />
      </group>
      <group position={[0.02, 0, 0.02]} rotation={[0, -0.1, -0.05]}>
        <FootprintMesh material={body} flip groupRef={f1} />
      </group>
      <group position={[0.26, 0, 0.26]} rotation={[0, 0.16, 0.07]}>
        <FootprintMesh material={body} groupRef={f2} />
      </group>
    </group>
  );
}
