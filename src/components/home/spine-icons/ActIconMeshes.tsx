"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Material, Mesh } from "three";
import type { ConductorAct } from "@/lib/spine/conductor-acts";

/** Animated, telling silhouettes for each spine act. */
export function ActIconMeshes({
  act,
  body,
  accent,
  reduceMotion,
  amp,
}: {
  act: Exclude<ConductorAct, "persona">;
  body: Material;
  accent: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  switch (act) {
    case "episode":
      return <EpisodeBook body={body} accent={accent} reduceMotion={reduceMotion} amp={amp} />;
    case "journey":
      return <JourneyWalker body={body} accent={accent} reduceMotion={reduceMotion} amp={amp} />;
    case "process":
      return <ProcessBars body={body} accent={accent} reduceMotion={reduceMotion} amp={amp} />;
    case "systems":
      return <SystemsComputer body={body} accent={accent} reduceMotion={reduceMotion} amp={amp} />;
    case "qa":
      return <QaMagnifier body={body} accent={accent} reduceMotion={reduceMotion} amp={amp} />;
  }
}

/** Book — covers open and close. */
function EpisodeBook({
  body,
  accent,
  reduceMotion,
  amp,
}: {
  body: Material;
  accent: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);

  useFrame((state) => {
    if (!left.current || !right.current) return;
    const speed = 1.1 + amp * 0.6;
    const open = reduceMotion
      ? 0.75
      : 0.2 + (Math.sin(state.clock.elapsedTime * speed) * 0.5 + 0.5) * 1.05;
    left.current.rotation.y = open;
    right.current.rotation.y = -open;
  });

  return (
    <group rotation={[0.2, 0.4, 0]}>
      <mesh material={accent} position={[0, 0, -0.01]}>
        <boxGeometry args={[0.09, 0.85, 0.12]} />
      </mesh>
      <group ref={left} position={[0, 0, 0]}>
        <mesh material={body} position={[-0.26, 0, 0.02]}>
          <boxGeometry args={[0.5, 0.8, 0.035]} />
        </mesh>
        <mesh material={accent} position={[-0.22, 0.12, 0.05]}>
          <boxGeometry args={[0.32, 0.03, 0.02]} />
        </mesh>
        <mesh material={accent} position={[-0.22, -0.02, 0.05]}>
          <boxGeometry args={[0.28, 0.03, 0.02]} />
        </mesh>
      </group>
      <group ref={right} position={[0, 0, 0]}>
        <mesh material={body} position={[0.26, 0, 0.02]}>
          <boxGeometry args={[0.5, 0.8, 0.035]} />
        </mesh>
        <mesh material={accent} position={[0.22, 0.12, 0.05]}>
          <boxGeometry args={[0.32, 0.03, 0.02]} />
        </mesh>
        <mesh material={accent} position={[0.22, -0.02, 0.05]}>
          <boxGeometry args={[0.28, 0.03, 0.02]} />
        </mesh>
      </group>
    </group>
  );
}

/** Simple walking figure — legs and arms swing. */
function JourneyWalker({
  body,
  accent,
  reduceMotion,
  amp,
}: {
  body: Material;
  accent: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const bodyRoot = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * (2.2 + amp * 1.2);
    const swing = reduceMotion ? 0.15 : Math.sin(t) * 0.55;
    if (leftLeg.current) leftLeg.current.rotation.x = swing;
    if (rightLeg.current) rightLeg.current.rotation.x = -swing;
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.85;
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.85;
    if (bodyRoot.current && !reduceMotion) {
      bodyRoot.current.position.y = Math.abs(Math.sin(t * 2)) * 0.03;
    }
  });

  return (
    <group ref={bodyRoot} rotation={[0.15, 0.5, 0]}>
      {/* head */}
      <mesh material={accent} position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.14, 14, 14]} />
      </mesh>
      {/* torso */}
      <mesh material={body} position={[0, 0.12, 0]}>
        <capsuleGeometry args={[0.12, 0.28, 6, 10]} />
      </mesh>
      {/* arms */}
      <group ref={leftArm} position={[-0.16, 0.22, 0]}>
        <mesh material={body} position={[0, -0.14, 0]}>
          <capsuleGeometry args={[0.045, 0.2, 4, 8]} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.16, 0.22, 0]}>
        <mesh material={body} position={[0, -0.14, 0]}>
          <capsuleGeometry args={[0.045, 0.2, 4, 8]} />
        </mesh>
      </group>
      {/* legs */}
      <group ref={leftLeg} position={[-0.07, -0.08, 0]}>
        <mesh material={accent} position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.05, 0.22, 4, 8]} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.07, -0.08, 0]}>
        <mesh material={accent} position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.05, 0.22, 4, 8]} />
        </mesh>
      </group>
    </group>
  );
}

/** Three bars that build up in sequence. */
function ProcessBars({
  body,
  accent,
  reduceMotion,
  amp,
}: {
  body: Material;
  accent: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  const b0 = useRef<Mesh>(null);
  const b1 = useRef<Mesh>(null);
  const b2 = useRef<Mesh>(null);

  useFrame((state) => {
    const speed = 0.7 + amp * 0.35;
    const t = reduceMotion ? 2.5 : state.clock.elapsedTime * speed;
    // Staggered build 0→1 with hold, then reset
    const phase = (t % 3.6) / 3.6;
    const h = (i: number) => {
      const start = i * 0.18;
      const local = Math.min(1, Math.max(0, (phase - start) / 0.22));
      // ease out
      return local * local * (3 - 2 * local);
    };
    const bars = [b0.current, b1.current, b2.current];
    const heights = [0.22, 0.4, 0.62];
    bars.forEach((mesh, i) => {
      if (!mesh) return;
      const grow = reduceMotion ? 1 : h(i);
      const y = heights[i] * grow;
      mesh.scale.set(1, Math.max(0.04, grow), 1);
      mesh.position.y = -0.32 + y / 2;
    });
  });

  return (
    <group rotation={[0.2, 0.55, 0]}>
      <mesh ref={b0} material={body} position={[-0.28, 0, 0]}>
        <boxGeometry args={[0.2, 0.22, 0.2]} />
      </mesh>
      <mesh ref={b1} material={accent} position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
      </mesh>
      <mesh ref={b2} material={body} position={[0.28, 0, 0]}>
        <boxGeometry args={[0.2, 0.62, 0.2]} />
      </mesh>
      <mesh material={accent} position={[0, -0.42, 0]}>
        <boxGeometry args={[0.85, 0.05, 0.28]} />
      </mesh>
    </group>
  );
}

/** Computer that assembles — base, stand, then screen. */
function SystemsComputer({
  body,
  accent,
  reduceMotion,
  amp,
}: {
  body: Material;
  accent: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  const base = useRef<Mesh>(null);
  const stand = useRef<Mesh>(null);
  const screen = useRef<Group>(null);

  useFrame((state) => {
    const speed = 0.65 + amp * 0.3;
    const t = reduceMotion ? 1 : (state.clock.elapsedTime * speed) % 3.2;
    const a = reduceMotion ? 1 : Math.min(1, t / 0.7);
    const b = reduceMotion ? 1 : Math.min(1, Math.max(0, (t - 0.55) / 0.7));
    const c = reduceMotion ? 1 : Math.min(1, Math.max(0, (t - 1.1) / 0.8));
    const ease = (x: number) => x * x * (3 - 2 * x);

    if (base.current) {
      const e = ease(a);
      base.current.scale.set(e, e, e);
      base.current.visible = e > 0.02;
    }
    if (stand.current) {
      const e = ease(b);
      stand.current.scale.set(1, e, 1);
      stand.current.position.y = -0.12 + e * 0.12;
      stand.current.visible = e > 0.02;
    }
    if (screen.current) {
      const e = ease(c);
      screen.current.scale.set(e, e, e);
      screen.current.position.y = 0.18 + (1 - e) * 0.2;
      screen.current.visible = e > 0.02;
    }
  });

  return (
    <group rotation={[0.2, 0.45, 0]}>
      <mesh ref={base} material={body} position={[0, -0.38, 0.05]}>
        <boxGeometry args={[0.55, 0.08, 0.32]} />
      </mesh>
      <mesh ref={stand} material={accent} position={[0, -0.12, 0]}>
        <boxGeometry args={[0.1, 0.28, 0.08]} />
      </mesh>
      <group ref={screen} position={[0, 0.18, 0]}>
        <mesh material={body}>
          <boxGeometry args={[0.72, 0.5, 0.06]} />
        </mesh>
        <mesh material={accent} position={[0, 0, 0.04]}>
          <boxGeometry args={[0.58, 0.36, 0.03]} />
        </mesh>
      </group>
    </group>
  );
}

/** Magnifying glass — lens + handle, gentle scan bob. */
function QaMagnifier({
  body,
  accent,
  reduceMotion,
  amp,
}: {
  body: Material;
  accent: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  const root = useRef<Group>(null);

  useFrame((state) => {
    if (!root.current) return;
    const t = state.clock.elapsedTime * (1.1 + amp * 0.4);
    if (reduceMotion) {
      root.current.rotation.z = -0.35;
      root.current.position.set(0, 0, 0);
      return;
    }
    root.current.rotation.z = -0.35 + Math.sin(t) * 0.2;
    root.current.position.x = Math.sin(t * 0.7) * 0.06;
    root.current.position.y = Math.cos(t * 0.9) * 0.05;
  });

  return (
    <group ref={root} rotation={[0.25, 0.35, 0]}>
      {/* lens ring */}
      <mesh material={body} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.055, 12, 32]} />
      </mesh>
      {/* glass disc */}
      <mesh material={accent} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 24]} />
      </mesh>
      {/* handle */}
      <mesh material={body} position={[0.28, -0.28, 0]} rotation={[0, 0, -0.7]}>
        <capsuleGeometry args={[0.05, 0.38, 4, 8]} />
      </mesh>
      {/* highlight spark */}
      <mesh material={accent} position={[-0.1, 0.12, 0.04]}>
        <sphereGeometry args={[0.04, 8, 8]} />
      </mesh>
    </group>
  );
}
