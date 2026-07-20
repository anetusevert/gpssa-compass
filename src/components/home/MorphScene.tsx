"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import { Color, type Mesh } from "three";
import type { EngagementPhaseId } from "@/lib/engagement/playbook";

export type MorphTargetKey = EngagementPhaseId | string | "idle";

const TARGETS: Record<
  string,
  { color: string; distort: number; speed: number; scale: number; metalness: number }
> = {
  idle: { color: "#1B7A4A", distort: 0.28, speed: 1.4, scale: 1, metalness: 0.35 },
  discover: { color: "#00A86B", distort: 0.42, speed: 1.6, scale: 1.05, metalness: 0.4 },
  evidence: { color: "#E76363", distort: 0.55, speed: 2.0, scale: 0.95, metalness: 0.25 },
  shape: { color: "#E7B02E", distort: 0.38, speed: 1.5, scale: 1.08, metalness: 0.45 },
  lock: { color: "#4899FF", distort: 0.22, speed: 1.1, scale: 1.12, metalness: 0.55 },
  handover: { color: "#7DB9A4", distort: 0.18, speed: 0.9, scale: 1.0, metalness: 0.5 },
  atlas: { color: "#00A86B", distort: 0.35, speed: 1.3, scale: 1.1, metalness: 0.4 },
  mandate: { color: "#1B7A4A", distort: 0.2, speed: 1.0, scale: 1.0, metalness: 0.5 },
  services: { color: "#2D4A8C", distort: 0.4, speed: 1.5, scale: 1.02, metalness: 0.35 },
  products: { color: "#C5A572", distort: 0.32, speed: 1.2, scale: 1.06, metalness: 0.45 },
  delivery: { color: "#7DB9A4", distort: 0.36, speed: 1.4, scale: 0.98, metalness: 0.3 },
  quality: { color: "#2DD4BF", distort: 0.3, speed: 1.3, scale: 1.04, metalness: 0.4 },
  fulfilment: { color: "#E9A23B", distort: 0.48, speed: 1.8, scale: 0.96, metalness: 0.28 },
  performance: { color: "#00A86B", distort: 0.26, speed: 1.2, scale: 1.05, metalness: 0.42 },
  planning: { color: "#C5A572", distort: 0.24, speed: 1.0, scale: 1.1, metalness: 0.48 },
};

function resolveTarget(key: MorphTargetKey) {
  return TARGETS[key] ?? TARGETS.idle;
}

function MorphOrb({ targetKey }: { targetKey: MorphTargetKey }) {
  const mesh = useRef<Mesh>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mat = useRef<any>(null);
  const color = useRef(new Color());
  const goalColor = useRef(new Color());
  const current = useRef(resolveTarget(targetKey));
  const goal = useMemo(() => resolveTarget(targetKey), [targetKey]);

  useFrame((state, delta) => {
    const t = Math.min(1, delta * 2.2);
    const cur = current.current;
    cur.distort += (goal.distort - cur.distort) * t;
    cur.speed += (goal.speed - cur.speed) * t;
    cur.scale += (goal.scale - cur.scale) * t;
    cur.metalness += (goal.metalness - cur.metalness) * t;

    goalColor.current.set(goal.color);
    color.current.lerp(goalColor.current, t);

    if (mesh.current) {
      mesh.current.scale.setScalar(cur.scale);
      mesh.current.rotation.y += delta * 0.18;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.12;
    }
    if (mat.current) {
      mat.current.distort = cur.distort;
      mat.current.speed = cur.speed;
      mat.current.metalness = cur.metalness;
      mat.current.color.copy(color.current);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.35} floatIntensity={0.55}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.35, 8]} />
        <MeshDistortMaterial
          ref={mat}
          color={goal.color}
          distort={goal.distort}
          speed={goal.speed}
          roughness={0.22}
          metalness={goal.metalness}
          envMapIntensity={0.85}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0.2, 0]} scale={1.85}>
        <torusGeometry args={[1.05, 0.018, 16, 80]} />
        <meshBasicMaterial color={goal.color} transparent opacity={0.35} />
      </mesh>
    </Float>
  );
}

export function MorphScene({ targetKey }: { targetKey: MorphTargetKey }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 2]} intensity={1.15} color="#e8f5ef" />
      <pointLight position={[-3, -2, -2]} intensity={0.55} color="#4899FF" />
      <MorphOrb targetKey={targetKey} />
      <Environment preset="city" />
    </>
  );
}
