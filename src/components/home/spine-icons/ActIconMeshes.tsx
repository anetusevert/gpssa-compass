"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, Material, Mesh } from "three";
import type { ConductorAct } from "@/lib/spine/conductor-acts";

function ease(x: number) {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

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
      return <ProcessFlow body={body} accent={accent} reduceMotion={reduceMotion} amp={amp} />;
    case "systems":
      return <SystemsScreen body={body} accent={accent} reduceMotion={reduceMotion} amp={amp} />;
    case "qa":
      return <QaScorecard body={body} accent={accent} reduceMotion={reduceMotion} amp={amp} />;
  }
}

/** Book — covers open and close with a living flutter. */
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
  const root = useRef<Group>(null);

  useFrame((state) => {
    if (!left.current || !right.current) return;
    const speed = 1.1 + amp * 0.6;
    const open = reduceMotion
      ? 0.75
      : 0.2 + (Math.sin(state.clock.elapsedTime * speed) * 0.5 + 0.5) * 1.05;
    left.current.rotation.y = open;
    right.current.rotation.y = -open;
    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 1.4) * 0.02;
    }
  });

  return (
    <group ref={root} rotation={[0.2, 0.4, 0]}>
      <mesh material={accent} position={[0, 0, -0.01]}>
        <boxGeometry args={[0.09, 0.85, 0.12]} />
      </mesh>
      <group ref={left}>
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
      <group ref={right}>
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

/** Walking figure — legs and arms swing. */
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
      <mesh material={accent} position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.14, 14, 14]} />
      </mesh>
      <mesh material={body} position={[0, 0.12, 0]}>
        <capsuleGeometry args={[0.12, 0.28, 6, 10]} />
      </mesh>
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

/**
 * Process — three step nodes linked by a line that draws between them.
 */
function ProcessFlow({
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
  const n0 = useRef<Group>(null);
  const n1 = useRef<Group>(null);
  const n2 = useRef<Group>(null);
  const link01 = useRef<Mesh>(null);
  const link12 = useRef<Mesh>(null);

  useFrame((state) => {
    const speed = 0.75 + amp * 0.35;
    const cycle = reduceMotion ? 1 : (state.clock.elapsedTime * speed) % 3.8;
    // Appear nodes, then draw links
    const nodeA = reduceMotion ? 1 : ease(cycle / 0.45);
    const nodeB = reduceMotion ? 1 : ease((cycle - 0.55) / 0.45);
    const nodeC = reduceMotion ? 1 : ease((cycle - 1.15) / 0.45);
    const draw01 = reduceMotion ? 1 : ease((cycle - 0.85) / 0.55);
    const draw12 = reduceMotion ? 1 : ease((cycle - 1.55) / 0.55);

    const applyNode = (g: Group | null, s: number) => {
      if (!g) return;
      const v = Math.max(0.001, s);
      g.scale.setScalar(v);
      g.visible = s > 0.02;
    };
    applyNode(n0.current, nodeA);
    applyNode(n1.current, nodeB);
    applyNode(n2.current, nodeC);

    // Links grow left→right between nodes
    if (link01.current) {
      const d = Math.max(0.001, draw01);
      link01.current.scale.x = d;
      link01.current.position.x = -0.32 + 0.16 * d;
      link01.current.visible = draw01 > 0.02;
    }
    if (link12.current) {
      const d = Math.max(0.001, draw12);
      link12.current.scale.x = d;
      link12.current.position.x = 0 + 0.16 * d;
      link12.current.visible = draw12 > 0.02;
    }
  });

  return (
    <group rotation={[0.25, 0.5, 0]}>
      <mesh ref={link01} material={accent} position={[-0.16, 0, 0]}>
        <boxGeometry args={[0.32, 0.05, 0.05]} />
      </mesh>
      <mesh ref={link12} material={accent} position={[0.16, 0, 0]}>
        <boxGeometry args={[0.32, 0.05, 0.05]} />
      </mesh>

      <group ref={n0} position={[-0.32, 0, 0]}>
        <mesh material={body}>
          <sphereGeometry args={[0.14, 14, 14]} />
        </mesh>
        <mesh material={accent} position={[0, 0, 0.08]}>
          <boxGeometry args={[0.06, 0.06, 0.04]} />
        </mesh>
      </group>
      <group ref={n1} position={[0, 0.04, 0.04]}>
        <mesh material={body}>
          <sphereGeometry args={[0.14, 14, 14]} />
        </mesh>
        <mesh material={accent} position={[0, 0, 0.08]}>
          <boxGeometry args={[0.06, 0.06, 0.04]} />
        </mesh>
      </group>
      <group ref={n2} position={[0.32, 0, 0]}>
        <mesh material={body}>
          <sphereGeometry args={[0.14, 14, 14]} />
        </mesh>
        <mesh material={accent} position={[0, 0, 0.08]}>
          <boxGeometry args={[0.06, 0.06, 0.04]} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Systems — monitor with lines of “writing” typing onto the screen.
 */
function SystemsScreen({
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
  const line0 = useRef<Mesh>(null);
  const line1 = useRef<Mesh>(null);
  const line2 = useRef<Mesh>(null);
  const line3 = useRef<Mesh>(null);
  const cursor = useRef<Mesh>(null);
  const root = useRef<Group>(null);

  useFrame((state) => {
    const speed = 1.3 + amp * 0.7;
    const t = reduceMotion ? 2 : state.clock.elapsedTime * speed;
    const cycle = t % 3.2;

    const lines = [line0, line1, line2, line3];
    const maxWidths = [0.48, 0.4, 0.44, 0.3];
    lines.forEach((ref, i) => {
      const mesh = ref.current;
      if (!mesh) return;
      const start = i * 0.45;
      const local = reduceMotion ? 1 : ease((cycle - start) / 0.4);
      const w = Math.max(0.001, local);
      mesh.scale.x = w;
      // grow from left edge of screen
      mesh.position.x = -0.24 + (maxWidths[i] * w) / 2;
      mesh.visible = local > 0.02;
    });

    if (cursor.current) {
      const blink = reduceMotion ? 1 : Math.sin(t * 8) > 0 ? 1 : 0.15;
      const activeLine = Math.min(3, Math.floor(cycle / 0.45));
      const y = 0.14 - activeLine * 0.1;
      const lineProg = ease((cycle - activeLine * 0.45) / 0.4);
      cursor.current.position.set(
        -0.24 + maxWidths[activeLine] * lineProg + 0.03,
        y,
        0.08
      );
      cursor.current.scale.y = blink;
    }

    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 1.3) * 0.015;
    }
  });

  return (
    <group ref={root} rotation={[0.2, 0.4, 0]}>
      {/* bezel */}
      <mesh material={body} position={[0, 0.06, 0]}>
        <boxGeometry args={[0.78, 0.56, 0.07]} />
      </mesh>
      {/* screen face */}
      <mesh material={body} position={[0, 0.06, 0.045]}>
        <boxGeometry args={[0.64, 0.42, 0.02]} />
      </mesh>
      {/* typing lines */}
      <mesh ref={line0} material={accent} position={[0, 0.14, 0.07]}>
        <boxGeometry args={[0.48, 0.045, 0.02]} />
      </mesh>
      <mesh ref={line1} material={accent} position={[0, 0.04, 0.07]}>
        <boxGeometry args={[0.4, 0.045, 0.02]} />
      </mesh>
      <mesh ref={line2} material={accent} position={[0, -0.06, 0.07]}>
        <boxGeometry args={[0.44, 0.045, 0.02]} />
      </mesh>
      <mesh ref={line3} material={accent} position={[0, -0.16, 0.07]}>
        <boxGeometry args={[0.3, 0.045, 0.02]} />
      </mesh>
      {/* cursor */}
      <mesh ref={cursor} material={accent} position={[0, 0.14, 0.08]}>
        <boxGeometry args={[0.03, 0.07, 0.02]} />
      </mesh>
      {/* stand */}
      <mesh material={accent} position={[0, -0.28, 0]}>
        <boxGeometry args={[0.12, 0.14, 0.08]} />
      </mesh>
      <mesh material={body} position={[0, -0.38, 0.04]}>
        <boxGeometry args={[0.4, 0.06, 0.22]} />
      </mesh>
    </group>
  );
}

/**
 * QA — KPI scorecard: bars fill to targets, then a check locks in.
 */
function QaScorecard({
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
  const k0 = useRef<Mesh>(null);
  const k1 = useRef<Mesh>(null);
  const k2 = useRef<Mesh>(null);
  const check = useRef<Group>(null);
  const board = useRef<Group>(null);

  useFrame((state) => {
    const speed = 0.85 + amp * 0.4;
    const cycle = reduceMotion ? 2.5 : (state.clock.elapsedTime * speed) % 3.4;

    const fill = (i: number) =>
      reduceMotion ? 1 : ease((cycle - i * 0.35) / 0.55);
    const bars = [
      { ref: k0, max: 0.45 },
      { ref: k1, max: 0.62 },
      { ref: k2, max: 0.38 },
    ];
    bars.forEach(({ ref, max }, i) => {
      const mesh = ref.current;
      if (!mesh) return;
      const f = fill(i);
      mesh.scale.y = Math.max(0.04, f);
      mesh.position.y = -0.22 + (max * f) / 2;
    });

    const checkIn = reduceMotion ? 1 : ease((cycle - 1.6) / 0.45);
    if (check.current) {
      check.current.scale.setScalar(Math.max(0.001, checkIn));
      check.current.visible = checkIn > 0.05;
      if (!reduceMotion && checkIn > 0.9) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.06;
        check.current.scale.setScalar(pulse);
      }
    }

    if (board.current && !reduceMotion) {
      board.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.1) * 0.04;
    }
  });

  return (
    <group ref={board} rotation={[0.2, 0.35, 0]}>
      {/* clipboard / scorecard */}
      <mesh material={body} position={[0, 0.02, 0]}>
        <boxGeometry args={[0.7, 0.85, 0.06]} />
      </mesh>
      <mesh material={accent} position={[0, 0.38, 0.04]}>
        <boxGeometry args={[0.28, 0.1, 0.05]} />
      </mesh>
      {/* KPI columns (empty tracks) */}
      <mesh material={body} position={[-0.18, -0.02, 0.04]}>
        <boxGeometry args={[0.12, 0.5, 0.03]} />
      </mesh>
      <mesh material={body} position={[0, -0.02, 0.04]}>
        <boxGeometry args={[0.12, 0.5, 0.03]} />
      </mesh>
      <mesh material={body} position={[0.18, -0.02, 0.04]}>
        <boxGeometry args={[0.12, 0.5, 0.03]} />
      </mesh>
      {/* filling KPI bars */}
      <mesh ref={k0} material={accent} position={[-0.18, -0.22, 0.06]}>
        <boxGeometry args={[0.09, 0.45, 0.04]} />
      </mesh>
      <mesh ref={k1} material={accent} position={[0, -0.22, 0.06]}>
        <boxGeometry args={[0.09, 0.62, 0.04]} />
      </mesh>
      <mesh ref={k2} material={accent} position={[0.18, -0.22, 0.06]}>
        <boxGeometry args={[0.09, 0.38, 0.04]} />
      </mesh>
      {/* check seal */}
      <group ref={check} position={[0.22, 0.28, 0.08]}>
        <mesh material={accent}>
          <sphereGeometry args={[0.1, 12, 12]} />
        </mesh>
        <mesh material={body} position={[-0.02, -0.01, 0.06]} rotation={[0, 0, 0.7]}>
          <boxGeometry args={[0.035, 0.1, 0.03]} />
        </mesh>
        <mesh material={body} position={[0.03, 0.02, 0.06]} rotation={[0, 0, -0.85]}>
          <boxGeometry args={[0.035, 0.16, 0.03]} />
        </mesh>
      </group>
    </group>
  );
}
