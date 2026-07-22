"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Material, Mesh } from "three";
import { GearMesh } from "./shared";

/** Isometric sage systems network: CPU hub, frame modules, corner gears, PCB traces. */
export function SystemsNetwork({
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
  const gTL = useRef<Group>(null);
  const gTR = useRef<Group>(null);
  const gBL = useRef<Group>(null);
  const gBR = useRef<Group>(null);
  const gTop = useRef<Group>(null);
  const hub = useRef<Group>(null);
  const sweep = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const speed = (0.55 + amp * 0.35) * (reduceMotion ? 0.1 : 1);
    if (gTL.current) gTL.current.rotation.z += delta * speed;
    if (gTR.current) gTR.current.rotation.z -= delta * speed * 1.05;
    if (gBL.current) gBL.current.rotation.z -= delta * speed * 0.95;
    if (gBR.current) gBR.current.rotation.z += delta * speed * 1.1;
    if (gTop.current) gTop.current.rotation.z += delta * speed * 0.8;

    if (hub.current && !reduceMotion) {
      const p = 1 + Math.sin(state.clock.elapsedTime * 2.2) * 0.04;
      hub.current.scale.setScalar(p);
    }
    if (sweep.current && !reduceMotion) {
      const u = (state.clock.elapsedTime * 0.35) % 1;
      // Sweep along top-left trace
      sweep.current.position.set(-0.18 - u * 0.22, 0.06, 0.18 + u * 0.22);
    }
    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 1.0) * 0.012;
    }
  });

  const gear = { teeth: 8, outerR: 0.11, innerR: 0.065, depth: 0.07 } as const;

  return (
    <group ref={root} rotation={[0.85, 0.55, -0.2]} scale={0.92}>
      {/* Inner square pipe frame */}
      {[
        [0, 0.22, 0],
        [0, -0.22, 0],
        [-0.22, 0, 0],
        [0.22, 0, 0],
      ].map(([x, y, z], i) => (
        <mesh
          key={i}
          material={body}
          position={[x, z, y]}
          rotation={i < 2 ? [0, 0, Math.PI / 2] : [0, 0, 0]}
        >
          <cylinderGeometry args={[0.028, 0.028, 0.44, 10]} />
        </mesh>
      ))}
      {/* Corner elbows of frame */}
      {(
        [
          [-0.22, 0.22],
          [0.22, 0.22],
          [-0.22, -0.22],
          [0.22, -0.22],
        ] as const
      ).map(([x, y], i) => (
        <mesh key={`c${i}`} material={body} position={[x, 0, y]}>
          <sphereGeometry args={[0.04, 12, 12]} />
        </mesh>
      ))}

      {/* Center CPU */}
      <group ref={hub} position={[0, 0.04, 0]}>
        <mesh material={body}>
          <boxGeometry args={[0.2, 0.08, 0.2]} />
        </mesh>
        <mesh material={accent} position={[0, 0.05, 0]}>
          <boxGeometry args={[0.14, 0.03, 0.14]} />
        </mesh>
        {/* Pins */}
        {[-0.08, -0.04, 0, 0.04, 0.08].map((o, i) => (
          <group key={i}>
            <mesh material={body} position={[o, 0, 0.12]}>
              <boxGeometry args={[0.02, 0.025, 0.04]} />
            </mesh>
            <mesh material={body} position={[o, 0, -0.12]}>
              <boxGeometry args={[0.02, 0.025, 0.04]} />
            </mesh>
            <mesh material={body} position={[0.12, 0, o]}>
              <boxGeometry args={[0.04, 0.025, 0.02]} />
            </mesh>
            <mesh material={body} position={[-0.12, 0, o]}>
              <boxGeometry args={[0.04, 0.025, 0.02]} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Cardinal: top gear */}
      <GearMesh
        groupRef={gTop}
        material={body}
        {...gear}
        position={[0, 0.05, 0.32]}
        scale={0.85}
      />

      {/* Cardinal: left DB stack */}
      <group position={[-0.32, 0.05, 0]}>
        {[0.06, 0, -0.06].map((y, i) => (
          <mesh key={i} material={body} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
          </mesh>
        ))}
      </group>

      {/* Cardinal: right globe */}
      <group position={[0.32, 0.06, 0]}>
        <mesh material={body}>
          <sphereGeometry args={[0.08, 16, 16]} />
        </mesh>
        <mesh material={accent} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.08, 0.008, 8, 24]} />
        </mesh>
        <mesh material={accent} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.008, 8, 24]} />
        </mesh>
        <mesh material={accent} rotation={[0, Math.PI / 2, Math.PI / 2]}>
          <torusGeometry args={[0.08, 0.008, 8, 20]} />
        </mesh>
      </group>

      {/* Cardinal: bottom button */}
      <group position={[0, 0.04, -0.32]}>
        <mesh material={body}>
          <boxGeometry args={[0.12, 0.04, 0.1]} />
        </mesh>
        <mesh material={energy} position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.03, 14]} />
        </mesh>
      </group>

      {/* PCB traces to corners */}
      {(
        [
          [-0.18, 0.18, -0.4, 0.4],
          [0.18, 0.18, 0.4, 0.4],
          [-0.18, -0.18, -0.4, -0.4],
          [0.18, -0.18, 0.4, -0.4],
        ] as const
      ).map(([x0, z0, x1, z1], i) => {
        const mx = (x0 + x1) / 2;
        const mz = (z0 + z1) / 2;
        const len = Math.hypot(x1 - x0, z1 - z0);
        const ang = Math.atan2(z1 - z0, x1 - x0);
        return (
          <mesh
            key={i}
            material={body}
            position={[mx, 0.01, mz]}
            rotation={[0, -ang, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.012, 0.012, len, 6]} />
          </mesh>
        );
      })}

      {/* Corner gears */}
      <GearMesh groupRef={gTL} material={body} {...gear} position={[-0.42, 0.04, 0.42]} />
      <GearMesh groupRef={gTR} material={body} {...gear} position={[0.42, 0.04, 0.42]} />
      <GearMesh groupRef={gBL} material={body} {...gear} position={[-0.42, 0.04, -0.42]} />
      <GearMesh groupRef={gBR} material={body} {...gear} position={[0.42, 0.04, -0.42]} />

      {/* Satellite nodes */}
      <mesh material={body} position={[-0.28, 0.03, 0.28]}>
        <boxGeometry args={[0.06, 0.04, 0.06]} />
      </mesh>
      <mesh material={body} position={[0.28, 0.03, 0.28]}>
        <cylinderGeometry args={[0.035, 0.035, 0.04, 10]} />
      </mesh>
      <mesh material={accent} position={[-0.28, 0.03, -0.28]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.07, 0.03, 0.07]} />
      </mesh>
      <mesh material={body} position={[0.3, 0.03, -0.28]}>
        <torusGeometry args={[0.03, 0.01, 8, 16]} />
      </mesh>

      <mesh ref={sweep} material={energy} position={[-0.18, 0.06, 0.18]}>
        <sphereGeometry args={[0.03, 10, 10]} />
      </mesh>
    </group>
  );
}
