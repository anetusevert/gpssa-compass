"use client";

import type { Material } from "three";
import type { ConductorAct } from "@/lib/spine/conductor-acts";

/** Unit-space (~[-0.5,0.5]) low-poly icon silhouettes — open forms that read through glass. */
export function ActIconMeshes({
  act,
  body,
  accent,
}: {
  act: Exclude<ConductorAct, "persona">;
  body: Material;
  accent: Material;
}) {
  switch (act) {
    case "episode":
      return <EpisodeMeshes body={body} accent={accent} />;
    case "journey":
      return <JourneyMeshes body={body} accent={accent} />;
    case "process":
      return <ProcessMeshes body={body} accent={accent} />;
    case "systems":
      return <SystemsMeshes body={body} accent={accent} />;
    case "qa":
      return <QaMeshes body={body} accent={accent} />;
  }
}

/** Open book — pages spread so the form reads as a book, not a pillar. */
function EpisodeMeshes({ body, accent }: { body: Material; accent: Material }) {
  return (
    <group rotation={[0.15, 0.55, 0]}>
      <mesh material={body} position={[-0.28, 0, 0]} rotation={[0, 0.85, 0]}>
        <boxGeometry args={[0.48, 0.78, 0.04]} />
      </mesh>
      <mesh material={body} position={[0.28, 0, 0]} rotation={[0, -0.85, 0]}>
        <boxGeometry args={[0.48, 0.78, 0.04]} />
      </mesh>
      <mesh material={accent} position={[0, 0, -0.02]}>
        <boxGeometry args={[0.08, 0.82, 0.1]} />
      </mesh>
      <mesh material={accent} position={[-0.22, 0.12, 0.08]} rotation={[0, 0.85, 0]}>
        <boxGeometry args={[0.3, 0.035, 0.02]} />
      </mesh>
      <mesh material={accent} position={[-0.22, -0.05, 0.08]} rotation={[0, 0.85, 0]}>
        <boxGeometry args={[0.26, 0.035, 0.02]} />
      </mesh>
      <mesh material={accent} position={[0.22, 0.12, 0.08]} rotation={[0, -0.85, 0]}>
        <boxGeometry args={[0.3, 0.035, 0.02]} />
      </mesh>
    </group>
  );
}

/** Path ribbon + clear waypoint beads. */
function JourneyMeshes({ body, accent }: { body: Material; accent: Material }) {
  return (
    <group rotation={[0.35, -0.4, 0.1]}>
      <mesh material={body} position={[-0.22, -0.18, 0]} rotation={[0, 0, 0.65]}>
        <capsuleGeometry args={[0.07, 0.5, 6, 10]} />
      </mesh>
      <mesh material={body} position={[0.08, 0.06, 0.04]} rotation={[0, 0, -0.2]}>
        <capsuleGeometry args={[0.07, 0.46, 6, 10]} />
      </mesh>
      <mesh material={body} position={[0.32, 0.32, 0.08]} rotation={[0, 0, 0.45]}>
        <capsuleGeometry args={[0.07, 0.36, 6, 10]} />
      </mesh>
      <mesh material={accent} position={[-0.4, -0.36, 0.06]}>
        <sphereGeometry args={[0.13, 14, 14]} />
      </mesh>
      <mesh material={accent} position={[0.08, 0.06, 0.1]}>
        <sphereGeometry args={[0.13, 14, 14]} />
      </mesh>
      <mesh material={accent} position={[0.44, 0.42, 0.12]}>
        <sphereGeometry args={[0.13, 14, 14]} />
      </mesh>
      <mesh material={body} position={[-0.4, -0.36, 0.06]} scale={[1.35, 1.35, 0.35]}>
        <torusGeometry args={[0.14, 0.025, 8, 20]} />
      </mesh>
    </group>
  );
}

/** Staggered SOP stairs — gaps and depth read through glass. */
function ProcessMeshes({ body, accent }: { body: Material; accent: Material }) {
  return (
    <group rotation={[0.25, 0.55, 0]}>
      <mesh material={body} position={[-0.12, 0.3, -0.08]}>
        <boxGeometry args={[0.7, 0.14, 0.36]} />
      </mesh>
      <mesh material={body} position={[0.02, 0.02, 0.02]}>
        <boxGeometry args={[0.7, 0.14, 0.36]} />
      </mesh>
      <mesh material={body} position={[0.14, -0.26, 0.12]}>
        <boxGeometry args={[0.7, 0.14, 0.36]} />
      </mesh>
      <mesh material={accent} position={[0.28, 0.3, 0.14]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
      </mesh>
      <mesh material={accent} position={[0.28, 0.02, 0.24]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
      </mesh>
      <mesh material={accent} position={[0.28, -0.26, 0.34]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
      </mesh>
    </group>
  );
}

/** Orbital node cluster — spheres + links, not a solid building. */
function SystemsMeshes({ body, accent }: { body: Material; accent: Material }) {
  return (
    <group rotation={[0.3, 0.6, 0]}>
      <mesh material={body} position={[-0.32, 0.22, 0.1]}>
        <octahedronGeometry args={[0.2, 0]} />
      </mesh>
      <mesh material={body} position={[0.32, 0.18, -0.08]}>
        <octahedronGeometry args={[0.2, 0]} />
      </mesh>
      <mesh material={body} position={[0, -0.3, 0.06]}>
        <octahedronGeometry args={[0.22, 0]} />
      </mesh>
      <mesh material={accent} position={[0, 0.2, 0.01]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.55, 8]} />
      </mesh>
      <mesh material={accent} position={[-0.16, -0.04, 0.08]} rotation={[0, 0, -0.95]}>
        <cylinderGeometry args={[0.035, 0.035, 0.55, 8]} />
      </mesh>
      <mesh material={accent} position={[0.16, -0.06, -0.01]} rotation={[0, 0, 0.95]}>
        <cylinderGeometry args={[0.035, 0.035, 0.55, 8]} />
      </mesh>
      <mesh material={accent} position={[0, 0.02, 0.2]}>
        <sphereGeometry args={[0.08, 12, 12]} />
      </mesh>
    </group>
  );
}

/** Flat shield plate + raised check — silhouette stays readable when translucent. */
function QaMeshes({ body, accent }: { body: Material; accent: Material }) {
  return (
    <group rotation={[0.15, 0.35, 0]}>
      <mesh material={body} position={[0, 0.08, 0]} scale={[1, 1.15, 0.35]}>
        <cylinderGeometry args={[0.4, 0.44, 0.5, 6, 1]} />
      </mesh>
      <mesh material={body} position={[0, -0.28, 0]} rotation={[Math.PI, 0, 0]} scale={[1, 1, 0.35]}>
        <coneGeometry args={[0.44, 0.32, 6]} />
      </mesh>
      <mesh material={accent} position={[-0.1, -0.02, 0.16]} rotation={[0, 0, 0.7]}>
        <boxGeometry args={[0.07, 0.24, 0.07]} />
      </mesh>
      <mesh material={accent} position={[0.1, 0.08, 0.16]} rotation={[0, 0, -0.85]}>
        <boxGeometry args={[0.07, 0.42, 0.07]} />
      </mesh>
    </group>
  );
}
