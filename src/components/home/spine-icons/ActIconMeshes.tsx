"use client";

import type { Material } from "three";
import type { ConductorAct } from "@/lib/spine/conductor-acts";

/** Unit-space (~[-0.5,0.5]) low-poly icon silhouettes for each spine act. */
export function ActIconMeshes({
  act,
  material,
}: {
  act: Exclude<ConductorAct, "persona">;
  material: Material;
}) {
  switch (act) {
    case "episode":
      return <EpisodeMeshes material={material} />;
    case "journey":
      return <JourneyMeshes material={material} />;
    case "process":
      return <ProcessMeshes material={material} />;
    case "systems":
      return <SystemsMeshes material={material} />;
    case "qa":
      return <QaMeshes material={material} />;
  }
}

/** Open book — two pages + spine. */
function EpisodeMeshes({ material }: { material: Material }) {
  return (
    <group>
      <mesh material={material} position={[-0.22, 0, 0.02]} rotation={[0, 0.45, 0]}>
        <boxGeometry args={[0.42, 0.72, 0.05]} />
      </mesh>
      <mesh material={material} position={[0.22, 0, 0.02]} rotation={[0, -0.45, 0]}>
        <boxGeometry args={[0.42, 0.72, 0.05]} />
      </mesh>
      <mesh material={material} position={[0, 0, -0.02]}>
        <boxGeometry args={[0.1, 0.76, 0.08]} />
      </mesh>
      <mesh material={material} position={[-0.18, 0.08, 0.06]} rotation={[0, 0.45, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.02]} />
      </mesh>
      <mesh material={material} position={[0.18, -0.05, 0.06]} rotation={[0, -0.45, 0]}>
        <boxGeometry args={[0.28, 0.04, 0.02]} />
      </mesh>
    </group>
  );
}

/** Curved path with waypoint beads. */
function JourneyMeshes({ material }: { material: Material }) {
  return (
    <group rotation={[0.2, 0, 0]}>
      <mesh material={material} position={[-0.28, -0.22, 0]} rotation={[0, 0, 0.55]}>
        <capsuleGeometry args={[0.055, 0.42, 4, 8]} />
      </mesh>
      <mesh material={material} position={[0.02, 0.02, 0]} rotation={[0, 0, -0.15]}>
        <capsuleGeometry args={[0.055, 0.38, 4, 8]} />
      </mesh>
      <mesh material={material} position={[0.3, 0.28, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.055, 0.32, 4, 8]} />
      </mesh>
      <mesh material={material} position={[-0.42, -0.38, 0.04]}>
        <sphereGeometry args={[0.1, 12, 12]} />
      </mesh>
      <mesh material={material} position={[0.02, 0.02, 0.04]}>
        <sphereGeometry args={[0.1, 12, 12]} />
      </mesh>
      <mesh material={material} position={[0.42, 0.4, 0.04]}>
        <sphereGeometry args={[0.1, 12, 12]} />
      </mesh>
    </group>
  );
}

/** Vertical SOP step stack. */
function ProcessMeshes({ material }: { material: Material }) {
  return (
    <group>
      <mesh material={material} position={[0, 0.28, 0]}>
        <boxGeometry args={[0.72, 0.16, 0.28]} />
      </mesh>
      <mesh material={material} position={[0.04, 0.02, 0.02]}>
        <boxGeometry args={[0.64, 0.16, 0.26]} />
      </mesh>
      <mesh material={material} position={[-0.02, -0.24, -0.02]}>
        <boxGeometry args={[0.68, 0.16, 0.24]} />
      </mesh>
      <mesh material={material} position={[0.28, 0.28, 0.18]}>
        <boxGeometry args={[0.1, 0.1, 0.08]} />
      </mesh>
      <mesh material={material} position={[0.28, 0.02, 0.18]}>
        <boxGeometry args={[0.1, 0.1, 0.08]} />
      </mesh>
      <mesh material={material} position={[0.28, -0.24, 0.14]}>
        <boxGeometry args={[0.1, 0.1, 0.08]} />
      </mesh>
    </group>
  );
}

/** Linked system nodes. */
function SystemsMeshes({ material }: { material: Material }) {
  return (
    <group>
      <mesh material={material} position={[-0.28, 0.18, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
      </mesh>
      <mesh material={material} position={[0.28, 0.18, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
      </mesh>
      <mesh material={material} position={[0, -0.28, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
      </mesh>
      <mesh material={material} position={[0, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 0.32, 8]} />
      </mesh>
      <mesh
        material={material}
        position={[-0.14, -0.05, 0]}
        rotation={[0, 0, -0.85]}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.42, 8]} />
      </mesh>
      <mesh
        material={material}
        position={[0.14, -0.05, 0]}
        rotation={[0, 0, 0.85]}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.42, 8]} />
      </mesh>
    </group>
  );
}

/** Shield + check. */
function QaMeshes({ material }: { material: Material }) {
  return (
    <group>
      <mesh material={material} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.38, 0.42, 0.55, 6, 1]} />
      </mesh>
      <mesh material={material} position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.42, 0.28, 6]} />
      </mesh>
      {/* check mark as two bars */}
      <mesh
        material={material}
        position={[-0.08, -0.02, 0.22]}
        rotation={[0, 0, 0.7]}
      >
        <boxGeometry args={[0.08, 0.22, 0.06]} />
      </mesh>
      <mesh
        material={material}
        position={[0.1, 0.06, 0.22]}
        rotation={[0, 0, -0.85]}
      >
        <boxGeometry args={[0.08, 0.38, 0.06]} />
      </mesh>
    </group>
  );
}
