"use client";

import { useMemo, useRef, type ReactNode, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  ExtrudeGeometry,
  Shape,
  type Group,
  type Material,
  type Mesh,
} from "three";
import type { ConductorAct } from "@/lib/spine/conductor-acts";

function ease(x: number) {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

/** Animated, telling silhouettes matching the reference living icons. */
export function ActIconMeshes({
  act,
  body,
  accent,
  metal,
  energy,
  reduceMotion,
  amp,
}: {
  act: Exclude<ConductorAct, "persona">;
  body: Material;
  accent: Material;
  metal: Material;
  energy: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  switch (act) {
    case "episode":
      return (
        <EpisodeBook
          body={body}
          accent={accent}
          metal={metal}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
    case "journey":
      return (
        <JourneyWalker
          body={body}
          accent={accent}
          metal={metal}
          energy={energy}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
    case "process":
      return (
        <ProcessGears
          metal={metal}
          energy={energy}
          accent={accent}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
    case "systems":
      return (
        <SystemsHud
          body={body}
          accent={accent}
          energy={energy}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
    case "qa":
      return (
        <QaPyramid
          body={body}
          accent={accent}
          energy={energy}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
  }
}

/** 1 — Closed emerald book with brushed-metal hardware. */
function EpisodeBook({
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
      {/* Page block */}
      <mesh material={accent} position={[0.02, 0, 0]}>
        <boxGeometry args={[0.52, 0.78, 0.22]} />
      </mesh>
      {/* Page edge lines suggestion */}
      {[-0.08, -0.02, 0.04, 0.1].map((z, i) => (
        <mesh key={i} material={accent} position={[0.28, 0, z]} scale={[1, 1, 0.15]}>
          <boxGeometry args={[0.01, 0.74, 0.2]} />
        </mesh>
      ))}

      {/* Front cover */}
      <group ref={cover} position={[0, 0, 0.13]}>
        <mesh material={body} position={[0, 0, 0]}>
          <boxGeometry args={[0.56, 0.84, 0.04]} />
        </mesh>
        {/* Vertical metal band near spine */}
        <mesh material={metal} position={[-0.18, 0, 0.025]}>
          <boxGeometry args={[0.07, 0.82, 0.02]} />
        </mesh>
        {/* Corner protectors */}
        <mesh material={metal} position={[0.22, 0.34, 0.028]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[0.14, 0.14, 0.018]} />
        </mesh>
        <mesh material={metal} position={[0.22, -0.34, 0.028]}>
          <boxGeometry args={[0.14, 0.14, 0.018]} />
        </mesh>
        {/* Clasp plate */}
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

      {/* Back cover */}
      <mesh material={body} position={[0, 0, -0.13]}>
        <boxGeometry args={[0.56, 0.84, 0.04]} />
      </mesh>

      {/* Spine */}
      <mesh material={body} position={[-0.29, 0, 0]} rotation={[0, 0, 0]}>
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

/** 2 — Green/silver android on a continuous walk cycle. */
function JourneyWalker({
  body,
  accent,
  metal,
  energy,
  reduceMotion,
  amp,
}: {
  body: Material;
  accent: Material;
  metal: Material;
  energy: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  const root = useRef<Group>(null);
  const leftThigh = useRef<Group>(null);
  const rightThigh = useRef<Group>(null);
  const leftCalf = useRef<Group>(null);
  const rightCalf = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftFore = useRef<Group>(null);
  const rightFore = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * (2.4 + amp * 1.1);
    const swing = reduceMotion ? 0.18 : Math.sin(t) * 0.62;
    const knee = reduceMotion ? 0.1 : Math.max(0, -Math.sin(t)) * 0.55;

    if (leftThigh.current) leftThigh.current.rotation.x = swing;
    if (rightThigh.current) rightThigh.current.rotation.x = -swing;
    if (leftCalf.current) leftCalf.current.rotation.x = swing > 0 ? knee : 0.08;
    if (rightCalf.current) rightCalf.current.rotation.x = swing < 0 ? knee : 0.08;
    if (leftArm.current) leftArm.current.rotation.x = -swing * 0.9;
    if (rightArm.current) rightArm.current.rotation.x = swing * 0.9;
    if (leftFore.current) leftFore.current.rotation.x = -0.25 + Math.abs(swing) * 0.2;
    if (rightFore.current) rightFore.current.rotation.x = -0.25 + Math.abs(swing) * 0.2;
    if (root.current && !reduceMotion) {
      root.current.position.y = Math.abs(Math.sin(t * 2)) * 0.035;
      root.current.rotation.y = 0.85 + Math.sin(t * 0.5) * 0.04;
    }
  });

  return (
    <group ref={root} rotation={[0.08, 0.9, 0]} scale={0.95}>
      {/* Faceted head */}
      <mesh material={metal} position={[0, 0.52, 0]}>
        <icosahedronGeometry args={[0.11, 0]} />
      </mesh>
      <mesh material={metal} position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.06, 6]} />
      </mesh>

      {/* Torso armor */}
      <mesh material={body} position={[0, 0.22, 0]}>
        <boxGeometry args={[0.28, 0.32, 0.16]} />
      </mesh>
      <mesh material={metal} position={[0, 0.22, 0]}>
        <boxGeometry args={[0.18, 0.34, 0.1]} />
      </mesh>
      {/* Chest glow strips */}
      <mesh material={energy} position={[-0.12, 0.24, 0.09]}>
        <boxGeometry args={[0.03, 0.1, 0.02]} />
      </mesh>
      <mesh material={energy} position={[-0.12, 0.12, 0.09]}>
        <boxGeometry args={[0.03, 0.06, 0.02]} />
      </mesh>
      {/* Shoulder pads */}
      <mesh material={body} position={[-0.2, 0.34, 0]}>
        <sphereGeometry args={[0.09, 10, 10]} />
      </mesh>
      <mesh material={body} position={[0.2, 0.34, 0]}>
        <sphereGeometry args={[0.09, 10, 10]} />
      </mesh>
      <mesh material={accent} position={[-0.2, 0.34, 0.07]}>
        <boxGeometry args={[0.04, 0.03, 0.02]} />
      </mesh>

      {/* Arms */}
      <group ref={leftArm} position={[-0.22, 0.3, 0]}>
        <mesh material={metal} position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.035, 0.12, 4, 8]} />
        </mesh>
        <group ref={leftFore} position={[0, -0.2, 0]}>
          <mesh material={body} position={[0, -0.08, 0]}>
            <capsuleGeometry args={[0.032, 0.12, 4, 8]} />
          </mesh>
        </group>
      </group>
      <group ref={rightArm} position={[0.22, 0.3, 0]}>
        <mesh material={metal} position={[0, -0.1, 0]}>
          <capsuleGeometry args={[0.035, 0.12, 4, 8]} />
        </mesh>
        <group ref={rightFore} position={[0, -0.2, 0]}>
          <mesh material={body} position={[0, -0.08, 0]}>
            <capsuleGeometry args={[0.032, 0.12, 4, 8]} />
          </mesh>
        </group>
      </group>

      {/* Legs */}
      <group ref={leftThigh} position={[-0.08, 0.02, 0]}>
        <mesh material={body} position={[0, -0.12, 0]}>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
        </mesh>
        <mesh material={metal} position={[0, -0.22, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>
        <group ref={leftCalf} position={[0, -0.24, 0]}>
          <mesh material={body} position={[0, -0.12, 0]}>
            <boxGeometry args={[0.09, 0.2, 0.09]} />
          </mesh>
          <mesh material={metal} position={[0, -0.24, 0.02]}>
            <boxGeometry args={[0.1, 0.05, 0.16]} />
          </mesh>
        </group>
      </group>
      <group ref={rightThigh} position={[0.08, 0.02, 0]}>
        <mesh material={body} position={[0, -0.12, 0]}>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
        </mesh>
        <mesh material={metal} position={[0, -0.22, 0]}>
          <sphereGeometry args={[0.045, 8, 8]} />
        </mesh>
        <group ref={rightCalf} position={[0, -0.24, 0]}>
          <mesh material={body} position={[0, -0.12, 0]}>
            <boxGeometry args={[0.09, 0.2, 0.09]} />
          </mesh>
          <mesh material={metal} position={[0, -0.24, 0.02]}>
            <boxGeometry args={[0.1, 0.05, 0.16]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function useGearGeometry(teeth: number, outerR: number, innerR: number, depth: number) {
  return useMemo(() => {
    const shape = new Shape();
    const toothDepth = (outerR - innerR) * 0.55;
    const tipR = outerR;
    const rootR = outerR - toothDepth;
    for (let i = 0; i < teeth; i++) {
      const a0 = (i / teeth) * Math.PI * 2;
      const a1 = ((i + 0.35) / teeth) * Math.PI * 2;
      const a2 = ((i + 0.5) / teeth) * Math.PI * 2;
      const a3 = ((i + 0.85) / teeth) * Math.PI * 2;
      const pts = [
        [Math.cos(a0) * rootR, Math.sin(a0) * rootR],
        [Math.cos(a1) * tipR, Math.sin(a1) * tipR],
        [Math.cos(a2) * tipR, Math.sin(a2) * tipR],
        [Math.cos(a3) * rootR, Math.sin(a3) * rootR],
      ] as const;
      if (i === 0) shape.moveTo(pts[0][0], pts[0][1]);
      else shape.lineTo(pts[0][0], pts[0][1]);
      shape.lineTo(pts[1][0], pts[1][1]);
      shape.lineTo(pts[2][0], pts[2][1]);
      shape.lineTo(pts[3][0], pts[3][1]);
    }
    shape.closePath();
    const hole = new Shape();
    hole.absarc(0, 0, innerR * 0.45, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const geo = new ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.01,
      bevelSegments: 1,
      curveSegments: 2,
    });
    geo.translate(0, 0, -depth / 2);
    return geo;
  }, [teeth, outerR, innerR, depth]);
}

function GearMesh({
  material,
  teeth,
  outerR,
  innerR,
  depth,
  position,
  groupRef,
}: {
  material: Material;
  teeth: number;
  outerR: number;
  innerR: number;
  depth: number;
  position: [number, number, number];
  groupRef: RefObject<Group | null>;
}) {
  const geo = useGearGeometry(teeth, outerR, innerR, depth);
  return (
    <group ref={groupRef as RefObject<Group>} position={position}>
      <mesh geometry={geo} material={material} />
      <mesh material={material} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[innerR * 0.55, innerR * 0.55, depth * 0.9, 16]} />
      </mesh>
    </group>
  );
}

/** 3 — Interlocking silver gears with neon energy ribbons. */
function ProcessGears({
  metal,
  energy,
  accent,
  reduceMotion,
  amp,
}: {
  metal: Material;
  energy: Material;
  accent: Material;
  reduceMotion: boolean;
  amp: number;
}) {
  const g0 = useRef<Group>(null);
  const g1 = useRef<Group>(null);
  const g2 = useRef<Group>(null);
  const g3 = useRef<Group>(null);
  const energyRoot = useRef<Group>(null);
  const root = useRef<Group>(null);

  useFrame((state, delta) => {
    const speed = (0.7 + amp * 0.55) * (reduceMotion ? 0.15 : 1);
    if (g0.current) g0.current.rotation.z += delta * speed;
    if (g1.current) g1.current.rotation.z -= delta * speed * 1.15;
    if (g2.current) g2.current.rotation.z -= delta * speed * 1.35;
    if (g3.current) g3.current.rotation.z += delta * speed * 1.6;
    if (energyRoot.current && !reduceMotion) {
      energyRoot.current.rotation.z += delta * (1.2 + amp);
      const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      energyRoot.current.scale.setScalar(pulse);
    }
    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
    }
  });

  return (
    <group ref={root} rotation={[0.55, 0.35, 0.15]} scale={0.92}>
      {/* Soft code-panel backdrop planes */}
      <mesh material={accent} position={[-0.45, 0.2, -0.25]} rotation={[0, 0.3, 0.1]}>
        <planeGeometry args={[0.35, 0.45]} />
      </mesh>
      <mesh material={accent} position={[0.42, -0.15, -0.22]} rotation={[0, -0.25, -0.08]}>
        <planeGeometry args={[0.28, 0.38]} />
      </mesh>

      <GearMesh
        groupRef={g0}
        material={metal}
        teeth={14}
        outerR={0.38}
        innerR={0.22}
        depth={0.1}
        position={[0.02, -0.12, 0.05]}
      />
      <GearMesh
        groupRef={g1}
        material={metal}
        teeth={12}
        outerR={0.3}
        innerR={0.17}
        depth={0.09}
        position={[-0.02, 0.28, -0.02]}
      />
      <GearMesh
        groupRef={g2}
        material={metal}
        teeth={11}
        outerR={0.26}
        innerR={0.15}
        depth={0.08}
        position={[-0.32, 0.02, -0.08]}
      />
      <GearMesh
        groupRef={g3}
        material={metal}
        teeth={9}
        outerR={0.18}
        innerR={0.1}
        depth={0.07}
        position={[0.3, 0.18, 0.02]}
      />

      {/* Energy ribbons through hubs */}
      <group ref={energyRoot}>
        <mesh material={energy} position={[0, 0.05, 0.08]} rotation={[0.4, 0.2, 0.3]}>
          <torusGeometry args={[0.22, 0.018, 8, 32, Math.PI * 1.4]} />
        </mesh>
        <mesh material={energy} position={[-0.08, 0.1, 0.12]} rotation={[-0.5, 0.6, 1.1]}>
          <torusGeometry args={[0.16, 0.014, 8, 28, Math.PI * 1.2]} />
        </mesh>
        <mesh material={energy} position={[0.1, -0.05, 0.1]}>
          <sphereGeometry args={[0.05, 12, 12]} />
        </mesh>
        <mesh material={energy} position={[-0.12, 0.22, 0.06]}>
          <sphereGeometry args={[0.035, 10, 10]} />
        </mesh>
      </group>
    </group>
  );
}

/** Thin HUD panel frame with corner brackets. */
function HudFrame({
  w,
  h,
  material,
  children,
}: {
  w: number;
  h: number;
  material: Material;
  children?: ReactNode;
}) {
  const t = 0.012;
  const corner = 0.06;
  return (
    <group>
      <mesh material={material} position={[0, 0, -0.01]}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* Border edges */}
      <mesh material={material} position={[0, h / 2, 0]}>
        <boxGeometry args={[w, t, t]} />
      </mesh>
      <mesh material={material} position={[0, -h / 2, 0]}>
        <boxGeometry args={[w, t, t]} />
      </mesh>
      <mesh material={material} position={[-w / 2, 0, 0]}>
        <boxGeometry args={[t, h, t]} />
      </mesh>
      <mesh material={material} position={[w / 2, 0, 0]}>
        <boxGeometry args={[t, h, t]} />
      </mesh>
      {/* Corner brackets */}
      {(
        [
          [-w / 2, h / 2],
          [w / 2, h / 2],
          [-w / 2, -h / 2],
          [w / 2, -h / 2],
        ] as const
      ).map(([x, y], i) => (
        <group key={i} position={[x, y, 0.01]}>
          <mesh material={material}>
            <boxGeometry args={[corner, t * 1.6, t]} />
          </mesh>
          <mesh material={material}>
            <boxGeometry args={[t * 1.6, corner, t]} />
          </mesh>
        </group>
      ))}
      {children}
    </group>
  );
}

/** 4 — Floating cyan holographic system panels. */
function SystemsHud({
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
  const codeLines = useRef<Group>(null);
  const bars = useRef<Group>(null);
  const pills = useRef<Group>(null);
  const dial = useRef<Group>(null);
  const progress = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * (1.1 + amp * 0.5);
    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(t * 0.9) * 0.02;
      root.current.rotation.y = Math.sin(t * 0.35) * 0.08;
    }
    if (codeLines.current && !reduceMotion) {
      const scroll = (t * 0.08) % 0.12;
      codeLines.current.position.y = scroll;
    }
    if (pills.current) {
      const active = reduceMotion ? 1 : Math.floor(t * 0.7) % 4;
      pills.current.children.forEach((child, i) => {
        const s = i === active ? 1.15 : 0.72;
        child.scale.setScalar(s);
      });
    }
    if (dial.current && !reduceMotion) {
      dial.current.rotation.z = t * 0.8;
    }
    if (progress.current) {
      const fill = reduceMotion ? 0.72 : 0.35 + ease((Math.sin(t * 0.6) * 0.5 + 0.5)) * 0.55;
      progress.current.scale.x = Math.max(0.04, fill);
      progress.current.position.x = -0.22 + (0.44 * fill) / 2;
    }
    if (bars.current && !reduceMotion) {
      bars.current.children.forEach((child, i) => {
        const mesh = child as Mesh;
        const w = 0.3 + Math.sin(t * 1.4 + i) * 0.2;
        mesh.scale.x = Math.max(0.15, w);
      });
    }
  });

  return (
    <group ref={root} rotation={[0.25, 0.4, 0]} scale={0.85}>
      {/* Main systems / code panel */}
      <group position={[-0.22, 0.05, 0.05]} rotation={[0, 0.15, 0.05]}>
        <HudFrame w={0.55} h={0.85} material={body}>
          <mesh material={accent} position={[0, 0.35, 0.01]}>
            <boxGeometry args={[0.42, 0.06, 0.01]} />
          </mesh>
          <group ref={codeLines} position={[0, 0.05, 0.02]}>
            {[0.2, 0.12, 0.04, -0.04, -0.12, -0.2, -0.28].map((y, i) => (
              <mesh key={i} material={energy} position={[-0.05 + (i % 3) * 0.02, y, 0]}>
                <boxGeometry args={[0.28 - (i % 4) * 0.04, 0.035, 0.008]} />
              </mesh>
            ))}
          </group>
          <group ref={bars} position={[0, -0.32, 0.02]}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} material={accent} position={[(-0.15 + (i % 2) * 0.22), i < 2 ? 0.06 : -0.04, 0]}>
                <boxGeometry args={[0.18, 0.04, 0.008]} />
              </mesh>
            ))}
          </group>
        </HudFrame>
      </group>

      {/* Process-style pill stack */}
      <group position={[0.32, 0.22, -0.02]} rotation={[0, -0.25, -0.05]}>
        <HudFrame w={0.32} h={0.55} material={body}>
          <group ref={pills} position={[0, 0.05, 0.02]}>
            {[0.16, 0.04, -0.08, -0.2].map((y, i) => (
              <mesh key={i} material={energy} position={[0.02, y, 0]}>
                <capsuleGeometry args={[0.04, 0.14, 4, 8]} />
              </mesh>
            ))}
          </group>
        </HudFrame>
      </group>

      {/* QA-style dial + progress panel */}
      <group position={[0.18, -0.32, 0.08]} rotation={[0.1, -0.1, 0.08]}>
        <HudFrame w={0.62} h={0.32} material={body}>
          <group ref={dial} position={[-0.18, 0.02, 0.02]}>
            <mesh material={energy}>
              <torusGeometry args={[0.08, 0.01, 8, 24]} />
            </mesh>
            <mesh material={accent}>
              <torusGeometry args={[0.055, 0.008, 8, 20]} />
            </mesh>
            <mesh material={energy} position={[0.06, 0, 0]}>
              <boxGeometry args={[0.05, 0.012, 0.01]} />
            </mesh>
          </group>
          <mesh material={accent} position={[0.12, 0.06, 0.02]}>
            <boxGeometry args={[0.28, 0.12, 0.008]} />
          </mesh>
          <mesh material={body} position={[0, -0.1, 0.02]}>
            <boxGeometry args={[0.48, 0.05, 0.008]} />
          </mesh>
          <mesh ref={progress} material={energy} position={[0, -0.1, 0.03]}>
            <boxGeometry args={[0.44, 0.035, 0.01]} />
          </mesh>
        </HudFrame>
      </group>
    </group>
  );
}

/** 5 — Glass pyramid with plasma core and radar aura. */
function QaPyramid({
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
  const core = useRef<Group>(null);
  const bolts = useRef<Group>(null);
  const aura = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(t * 1.3) * 0.025;
      root.current.rotation.y += 0.004 + amp * 0.004;
    }
    if (core.current) {
      const pulse = reduceMotion
        ? 1
        : 0.85 + Math.sin(t * (5 + amp * 3)) * 0.2;
      core.current.scale.setScalar(pulse);
    }
    if (bolts.current && !reduceMotion) {
      bolts.current.children.forEach((child, i) => {
        child.rotation.z = Math.sin(t * 8 + i * 1.7) * 0.5;
        child.scale.y = 0.6 + Math.abs(Math.sin(t * 11 + i)) * 0.8;
        child.visible = Math.sin(t * 14 + i * 2.1) > -0.3;
      });
    }
    if (aura.current && !reduceMotion) {
      aura.current.rotation.z = t * 0.6;
      const s = 1 + Math.sin(t * 2.2) * 0.06;
      aura.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={root} rotation={[0.15, 0.4, 0]}>
      {/* Radial aura ticks behind pyramid */}
      <group ref={aura} position={[0, -0.05, -0.2]} rotation={[0.2, 0, 0]}>
        {Array.from({ length: 28 }, (_, i) => {
          const a = (i / 28) * Math.PI * 2;
          const r = 0.52;
          return (
            <mesh
              key={i}
              material={energy}
              position={[Math.cos(a) * r, Math.sin(a) * r, 0]}
              rotation={[0, 0, a]}
            >
              <boxGeometry args={[0.012, 0.08 + (i % 3) * 0.03, 0.008]} />
            </mesh>
          );
        })}
        <mesh material={energy}>
          <torusGeometry args={[0.42, 0.008, 8, 48]} />
        </mesh>
      </group>

      {/* Glass pyramid */}
      <mesh material={body} position={[0, -0.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.42, 0.72, 4]} />
      </mesh>
      {/* Apex / facet catch lights */}
      <mesh material={accent} position={[0, 0.28, 0.08]}>
        <sphereGeometry args={[0.03, 8, 8]} />
      </mesh>

      {/* Plasma core */}
      <group ref={core} position={[0, -0.08, 0]}>
        <mesh material={energy}>
          <sphereGeometry args={[0.1, 16, 16]} />
        </mesh>
        <mesh material={accent}>
          <sphereGeometry args={[0.045, 12, 12]} />
        </mesh>
      </group>

      {/* Lightning bolts */}
      <group ref={bolts} position={[0, -0.08, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              material={energy}
              position={[Math.cos(a) * 0.08, Math.sin(a) * 0.05, Math.sin(a * 2) * 0.06]}
              rotation={[0.4, 0, a + 0.4]}
            >
              <boxGeometry args={[0.018, 0.22, 0.018]} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}
