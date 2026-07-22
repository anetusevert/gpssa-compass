"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  Color,
  MeshPhysicalMaterial,
  TextureLoader,
  type Group,
} from "three";
import {
  prefersReducedMotion,
  statusToMotion,
} from "@/lib/spine/act-icon-motion";
import type { ActStatus } from "@/lib/spine/conductor-acts";
import { CLAY_PRIMARY, COLS } from "../constants";

const MUTED = "#3a5068";

function FaceDecal({ url }: { url: string }) {
  const texture = useLoader(TextureLoader, url);
  return (
    <mesh position={[0, 0.42, 0.1]}>
      <circleGeometry args={[0.09, 24]} />
      <meshPhysicalMaterial
        map={texture}
        roughness={0.55}
        metalness={0.05}
        clearcoat={0.2}
      />
    </mesh>
  );
}

function ClayBust({
  body,
  accent,
  hasFace,
}: {
  body: MeshPhysicalMaterial;
  accent: MeshPhysicalMaterial;
  hasFace: boolean;
}) {
  return (
    <group rotation={[0.12, 0.35, 0]}>
      {/* Head */}
      <mesh material={body} position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.16, 20, 20]} />
      </mesh>
      {!hasFace && (
        <>
          <mesh material={accent} position={[-0.05, 0.45, 0.13]}>
            <sphereGeometry args={[0.02, 8, 8]} />
          </mesh>
          <mesh material={accent} position={[0.05, 0.45, 0.13]}>
            <sphereGeometry args={[0.02, 8, 8]} />
          </mesh>
        </>
      )}
      {/* Neck */}
      <mesh material={body} position={[0, 0.26, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.08, 12]} />
      </mesh>
      {/* Shoulders / torso */}
      <mesh material={body} position={[0, 0.08, 0]}>
        <capsuleGeometry args={[0.14, 0.22, 8, 16]} />
      </mesh>
      <mesh material={body} position={[-0.18, 0.16, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.055, 0.1, 6, 10]} />
      </mesh>
      <mesh material={body} position={[0.18, 0.16, 0]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.055, 0.1, 6, 10]} />
      </mesh>
      {/* Collar ring */}
      <mesh material={accent} position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.018, 8, 20]} />
      </mesh>
    </group>
  );
}

/** 3D clay persona figure in column 0 of the spine strip. */
export function PersonaFigureNode({
  colIndex,
  radius,
  selected,
  hovered,
  status,
  accent,
  avatarUrl,
}: {
  colIndex: number;
  radius: number;
  selected: boolean;
  hovered: boolean;
  status: ActStatus;
  accent: string | null;
  avatarUrl?: string | null;
}) {
  const { viewport } = useThree();
  const root = useRef<Group>(null);
  const icon = useRef<Group>(null);
  const smoothedAmp = useRef(0);
  const smoothedMute = useRef(1);
  const smoothedScale = useRef(1);
  const colorGoal = useRef(new Color());
  const mutedColor = useRef(new Color(MUTED));
  const [reduceMotion, setReduceMotion] = useState(false);
  const [faceOk, setFaceOk] = useState(false);

  useEffect(() => {
    setReduceMotion(prefersReducedMotion());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!avatarUrl) {
      setFaceOk(false);
      return;
    }
    const img = new Image();
    img.onload = () => setFaceOk(true);
    img.onerror = () => setFaceOk(false);
    img.src = avatarUrl;
  }, [avatarUrl]);

  const bodyMaterial = useMemo(() => {
    const c = accent || CLAY_PRIMARY;
    return new MeshPhysicalMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 0.06,
      metalness: 0.12,
      roughness: 0.65,
      clearcoat: 0.15,
      transparent: false,
      opacity: 1,
    });
  }, [accent]);

  const accentMaterial = useMemo(() => {
    return new MeshPhysicalMaterial({
      color: "#A8C4B8",
      emissive: "#A8C4B8",
      emissiveIntensity: 0.08,
      metalness: 0.1,
      roughness: 0.55,
      clearcoat: 0.12,
    });
  }, []);

  useEffect(
    () => () => {
      bodyMaterial.dispose();
      accentMaterial.dispose();
    },
    [bodyMaterial, accentMaterial]
  );

  const x = ((colIndex + 0.5) / COLS - 0.5) * viewport.width;
  const targets = statusToMotion({ selected, hovered, status });
  const active = selected || hovered;
  const current = status === "current";

  useFrame((state, delta) => {
    const lerpSpeed = 1 - Math.pow(0.001, delta);
    smoothedAmp.current += (targets.amp - smoothedAmp.current) * lerpSpeed;
    smoothedMute.current += (targets.mute - smoothedMute.current) * lerpSpeed;
    smoothedScale.current += (targets.scale - smoothedScale.current) * lerpSpeed;

    const live = accent || CLAY_PRIMARY;
    const mute = smoothedMute.current;
    colorGoal.current.set(live).lerp(mutedColor.current, mute * 0.85);
    bodyMaterial.color.copy(colorGoal.current);
    bodyMaterial.emissive.copy(colorGoal.current);
    bodyMaterial.emissiveIntensity =
      0.05 + smoothedAmp.current * 0.22 * (1 - mute);

    if (!root.current || !icon.current) return;
    const t = state.clock.elapsedTime;
    const pulse = reduceMotion
      ? 1
      : 1 + Math.sin(t * 0.35) * 0.03 + smoothedAmp.current * 0.04;
    root.current.scale.setScalar(radius * 1.45 * smoothedScale.current * pulse);
    root.current.position.y = reduceMotion
      ? 0
      : Math.sin(t * 0.45) * radius * 0.05;

    if (!reduceMotion) {
      icon.current.rotation.y += delta * (active || current ? 0.22 : 0.08);
      icon.current.rotation.x = 0.08 + Math.sin(t * 0.2) * 0.03;
    } else {
      icon.current.rotation.y = 0.3;
      icon.current.rotation.x = 0.1;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      <group ref={root}>
        <group ref={icon}>
          <ClayBust
            body={bodyMaterial}
            accent={accentMaterial}
            hasFace={faceOk}
          />
          {faceOk && avatarUrl ? (
            <Suspense fallback={null}>
              <FaceDecal url={avatarUrl} />
            </Suspense>
          ) : null}
        </group>
      </group>
    </group>
  );
}
