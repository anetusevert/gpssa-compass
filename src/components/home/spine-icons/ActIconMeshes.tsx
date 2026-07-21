"use client";

import { useMemo, useRef, type RefObject } from "react";
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
        <SystemsMonitor
          body={body}
          accent={accent}
          metal={metal}
          energy={energy}
          reduceMotion={reduceMotion}
          amp={amp}
        />
      );
    case "qa":
      return (
        <QaRoboticArm
          body={body}
          accent={accent}
          metal={metal}
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
  groupRef?: RefObject<Group | null>;
}) {
  const geo = useGearGeometry(teeth, outerR, innerR, depth);
  return (
    <group ref={groupRef as RefObject<Group> | undefined} position={position}>
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

/** 4 — Ultra-wide systems workstation with living diagnostic UI. */
function SystemsMonitor({
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
  const gCenter = useRef<Group>(null);
  const gTop = useRef<Group>(null);
  const gBottom = useRef<Group>(null);
  const gLeft = useRef<Group>(null);
  const gRight = useRef<Group>(null);
  const trails = useRef<Group>(null);
  const led = useRef<Mesh>(null);
  const trackball = useRef<Mesh>(null);

  useFrame((state, delta) => {
    const speed = (0.9 + amp * 0.6) * (reduceMotion ? 0.12 : 1);
    if (gCenter.current) gCenter.current.rotation.z += delta * speed;
    if (gTop.current) gTop.current.rotation.z -= delta * speed * 1.25;
    if (gBottom.current) gBottom.current.rotation.z -= delta * speed * 1.1;
    if (gLeft.current) gLeft.current.rotation.z += delta * speed * 1.4;
    if (gRight.current) gRight.current.rotation.z += delta * speed * 1.35;

    if (trails.current && !reduceMotion) {
      trails.current.rotation.z += delta * (1.3 + amp);
      const pulse = 0.9 + Math.sin(state.clock.elapsedTime * 3.2) * 0.12;
      trails.current.scale.setScalar(pulse);
    }
    if (led.current && !reduceMotion) {
      const blink = 0.7 + Math.sin(state.clock.elapsedTime * 4.5) * 0.3;
      led.current.scale.setScalar(0.85 + blink * 0.2);
    }
    if (trackball.current && !reduceMotion) {
      trackball.current.rotation.x += delta * 0.8;
      trackball.current.rotation.y += delta * 0.45;
    }
    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(state.clock.elapsedTime * 1.15) * 0.015;
    }
  });

  return (
    <group ref={root} rotation={[0.18, 0.35, 0]} scale={0.88} position={[0, -0.12, 0]}>
      {/* Cable bundle from rear-left */}
      <group position={[-0.55, -0.22, -0.12]} rotation={[0.2, 0.4, 0.5]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} material={metal} position={[i * 0.025, 0, i * 0.01]} rotation={[0, 0, 0.6 + i * 0.08]}>
            <capsuleGeometry args={[0.014, 0.42, 4, 6]} />
          </mesh>
        ))}
      </group>

      {/* V-stand */}
      <mesh material={metal} position={[-0.1, -0.28, 0.02]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.28, 0.04, 0.05]} />
      </mesh>
      <mesh material={metal} position={[0.1, -0.28, 0.02]} rotation={[0, 0, -0.55]}>
        <boxGeometry args={[0.28, 0.04, 0.05]} />
      </mesh>
      <mesh material={metal} position={[0, -0.18, 0]}>
        <boxGeometry args={[0.08, 0.16, 0.04]} />
      </mesh>

      {/* Monitor housing — slight wrap via three panels */}
      <group position={[0, 0.18, 0]}>
        {/* Outer teal bezel */}
        <mesh material={body} position={[0, 0, -0.02]}>
          <boxGeometry args={[1.15, 0.58, 0.08]} />
        </mesh>
        {/* Curved side wings */}
        <mesh material={body} position={[-0.58, 0, -0.01]} rotation={[0, 0.28, 0]}>
          <boxGeometry args={[0.12, 0.56, 0.07]} />
        </mesh>
        <mesh material={body} position={[0.58, 0, -0.01]} rotation={[0, -0.28, 0]}>
          <boxGeometry args={[0.12, 0.56, 0.07]} />
        </mesh>
        {/* Inner silver bezel */}
        <mesh material={metal} position={[0, 0, 0.03]}>
          <boxGeometry args={[1.02, 0.48, 0.03]} />
        </mesh>
        {/* Dark screen plane */}
        <mesh material={accent} position={[0, 0, 0.05]}>
          <boxGeometry args={[0.94, 0.4, 0.015]} />
        </mesh>

        {/* Screen UI content */}
        <group position={[0, 0, 0.07]}>
          {/* Left status block */}
          <group position={[-0.32, 0.02, 0]}>
            <mesh material={energy} position={[0.08, 0.08, 0]}>
              <boxGeometry args={[0.005, 0.18, 0.005]} />
            </mesh>
            <mesh material={energy} position={[0.02, 0.12, 0]}>
              <boxGeometry args={[0.14, 0.025, 0.005]} />
            </mesh>
            <mesh material={energy} position={[0.0, 0.05, 0]}>
              <boxGeometry args={[0.1, 0.02, 0.005]} />
            </mesh>
            <mesh material={accent} position={[0.01, -0.02, 0]}>
              <boxGeometry args={[0.12, 0.018, 0.004]} />
            </mesh>
          </group>

          {/* Right status block */}
          <group position={[0.32, 0.02, 0]}>
            <mesh material={energy} position={[-0.08, 0.08, 0]}>
              <boxGeometry args={[0.005, 0.18, 0.005]} />
            </mesh>
            <mesh material={energy} position={[-0.02, 0.12, 0]}>
              <boxGeometry args={[0.14, 0.025, 0.005]} />
            </mesh>
            <mesh material={energy} position={[0.0, 0.05, 0]}>
              <boxGeometry args={[0.12, 0.02, 0.005]} />
            </mesh>
            <mesh material={accent} position={[-0.01, -0.02, 0]}>
              <boxGeometry args={[0.1, 0.018, 0.004]} />
            </mesh>
          </group>

          {/* Central gear cluster */}
          <group scale={0.55}>
            <GearMesh
              groupRef={gCenter}
              material={energy}
              teeth={12}
              outerR={0.22}
              innerR={0.12}
              depth={0.04}
              position={[0, 0.02, 0.01]}
            />
            <GearMesh
              groupRef={gTop}
              material={body}
              teeth={9}
              outerR={0.12}
              innerR={0.07}
              depth={0.03}
              position={[0, 0.28, 0]}
            />
            <GearMesh
              groupRef={gBottom}
              material={body}
              teeth={9}
              outerR={0.12}
              innerR={0.07}
              depth={0.03}
              position={[0, -0.24, 0]}
            />
            <GearMesh
              groupRef={gLeft}
              material={body}
              teeth={8}
              outerR={0.11}
              innerR={0.06}
              depth={0.03}
              position={[-0.24, 0.02, 0]}
            />
            <GearMesh
              groupRef={gRight}
              material={body}
              teeth={8}
              outerR={0.11}
              innerR={0.06}
              depth={0.03}
              position={[0.24, 0.02, 0]}
            />
            {/* Concentric glow rings on center gear */}
            <mesh material={energy} position={[0, 0.02, 0.03]}>
              <torusGeometry args={[0.1, 0.01, 8, 24]} />
            </mesh>
            <mesh material={energy} position={[0, 0.02, 0.03]}>
              <torusGeometry args={[0.06, 0.008, 8, 20]} />
            </mesh>
            <group ref={trails}>
              <mesh material={energy} rotation={[0.3, 0.2, 0.4]}>
                <torusGeometry args={[0.3, 0.012, 8, 28, Math.PI * 1.2]} />
              </mesh>
              <mesh material={energy} rotation={[-0.4, 0.5, 1.2]}>
                <torusGeometry args={[0.22, 0.01, 8, 24, Math.PI]} />
              </mesh>
            </group>
          </group>

          {/* Power status */}
          <mesh ref={led} material={energy} position={[0, -0.14, 0.01]}>
            <boxGeometry args={[0.05, 0.025, 0.01]} />
          </mesh>
          <mesh material={accent} position={[0, -0.17, 0.008]}>
            <boxGeometry args={[0.22, 0.016, 0.005]} />
          </mesh>
        </group>
      </group>

      {/* Keyboard */}
      <mesh material={metal} position={[0, -0.38, 0.18]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.55, 0.03, 0.18]} />
      </mesh>
      <mesh material={accent} position={[0, -0.36, 0.18]} rotation={[-0.15, 0, 0]}>
        <boxGeometry args={[0.5, 0.008, 0.14]} />
      </mesh>

      {/* Trackball */}
      <group position={[0.38, -0.38, 0.2]}>
        <mesh material={metal}>
          <boxGeometry args={[0.14, 0.04, 0.14]} />
        </mesh>
        <mesh ref={trackball} material={body} position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.055, 14, 14]} />
        </mesh>
      </group>
    </group>
  );
}

/** 5 — Industrial QA robotic arm: scan, reach, grip. */
function QaRoboticArm({
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
  const baseYaw = useRef<Group>(null);
  const shoulder = useRef<Group>(null);
  const elbow = useRef<Group>(null);
  const wrist = useRef<Group>(null);
  const jawL = useRef<Group>(null);
  const jawR = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime * (0.85 + amp * 0.45);
    if (root.current && !reduceMotion) {
      root.current.position.y = Math.sin(t * 1.1) * 0.012;
    }

    // Base scans side to side
    if (baseYaw.current) {
      baseYaw.current.rotation.y = reduceMotion
        ? 0.15
        : Math.sin(t * 0.55) * 0.55;
    }
    // Shoulder lifts / lowers (reach)
    if (shoulder.current) {
      shoulder.current.rotation.z = reduceMotion
        ? 0.55
        : 0.35 + Math.sin(t * 0.7) * 0.35;
    }
    // Elbow flexes opposite the shoulder for a natural fold
    if (elbow.current) {
      elbow.current.rotation.z = reduceMotion
        ? -1.1
        : -0.85 - Math.sin(t * 0.7 + 0.4) * 0.45;
    }
    // Wrist tilts as if inspecting
    if (wrist.current) {
      wrist.current.rotation.z = reduceMotion
        ? -0.35
        : -0.25 + Math.sin(t * 1.1) * 0.35;
      wrist.current.rotation.x = reduceMotion
        ? 0
        : Math.sin(t * 0.9) * 0.25;
    }
    // Gripper opens / closes on a slower cycle
    const grip = reduceMotion
      ? 0.35
      : 0.15 + (Math.sin(t * 1.35) * 0.5 + 0.5) * 0.55;
    if (jawL.current) jawL.current.rotation.z = grip;
    if (jawR.current) jawR.current.rotation.z = -grip;
  });

  return (
    <group ref={root} rotation={[0.2, 0.65, 0]} scale={0.95} position={[0, -0.28, 0]}>
      {/* Mounting plate */}
      <mesh material={body} position={[0, 0.02, 0]}>
        <boxGeometry args={[0.42, 0.05, 0.42]} />
      </mesh>
      <mesh material={accent} position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.04, 20]} />
      </mesh>

      <group ref={baseYaw} position={[0, 0.08, 0]}>
        {/* Rotating base drum */}
        <mesh material={body} position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.15, 0.17, 0.2, 20]} />
        </mesh>
        <mesh material={metal} position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.06, 16]} />
        </mesh>

        {/* Shoulder hinge */}
        <group ref={shoulder} position={[0, 0.26, 0]} rotation={[0, 0, 0.55]}>
          <mesh material={body} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.16, 16]} />
          </mesh>
          <mesh material={accent} position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.04, 16]} />
          </mesh>

          {/* Lower arm boom */}
          <mesh material={metal} position={[0.22, 0, 0]}>
            <boxGeometry args={[0.38, 0.11, 0.11]} />
          </mesh>
          {/* Cable run along lower arm */}
          <mesh material={accent} position={[0.22, 0.07, 0.07]}>
            <capsuleGeometry args={[0.015, 0.28, 4, 6]} />
          </mesh>
          <mesh material={accent} position={[0.22, 0.07, -0.07]}>
            <capsuleGeometry args={[0.015, 0.28, 4, 6]} />
          </mesh>

          {/* Elbow */}
          <group ref={elbow} position={[0.42, 0, 0]} rotation={[0, 0, -1.1]}>
            <mesh material={body} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.085, 0.085, 0.14, 16]} />
            </mesh>
            <mesh material={accent} position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.065, 0.065, 0.035, 16]} />
            </mesh>

            {/* Upper arm boom */}
            <mesh material={metal} position={[0.2, 0, 0]}>
              <boxGeometry args={[0.34, 0.1, 0.1]} />
            </mesh>
            <mesh material={accent} position={[0.2, 0.065, 0.06]}>
              <capsuleGeometry args={[0.012, 0.24, 4, 6]} />
            </mesh>

            {/* Wrist cluster */}
            <group ref={wrist} position={[0.4, 0, 0]} rotation={[0, 0, -0.35]}>
              <mesh material={body} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.06, 0.06, 0.12, 14]} />
              </mesh>
              <mesh material={body} position={[0.08, 0, 0]}>
                <sphereGeometry args={[0.055, 12, 12]} />
              </mesh>
              <mesh material={metal} position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.045, 0.1, 12]} />
              </mesh>

              {/* Gripper base */}
              <mesh material={metal} position={[0.24, 0, 0]}>
                <boxGeometry args={[0.1, 0.08, 0.1]} />
              </mesh>

              {/* Jaws */}
              <group ref={jawL} position={[0.3, 0.02, 0]} rotation={[0, 0, 0.35]}>
                <mesh material={metal} position={[0.08, 0.02, 0]}>
                  <boxGeometry args={[0.14, 0.035, 0.05]} />
                </mesh>
                <mesh material={metal} position={[0.15, -0.01, 0]} rotation={[0, 0, -0.45]}>
                  <boxGeometry args={[0.08, 0.03, 0.045]} />
                </mesh>
              </group>
              <group ref={jawR} position={[0.3, -0.02, 0]} rotation={[0, 0, -0.35]}>
                <mesh material={metal} position={[0.08, -0.02, 0]}>
                  <boxGeometry args={[0.14, 0.035, 0.05]} />
                </mesh>
                <mesh material={metal} position={[0.15, 0.01, 0]} rotation={[0, 0, 0.45]}>
                  <boxGeometry args={[0.08, 0.03, 0.045]} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
