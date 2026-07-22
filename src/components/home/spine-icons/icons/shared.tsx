"use client";

import { useMemo, type RefObject } from "react";
import { ExtrudeGeometry, Shape, type Group, type Material } from "three";

export function ease(x: number) {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

export function useGearGeometry(
  teeth: number,
  outerR: number,
  innerR: number,
  depth: number
) {
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
      bevelThickness: 0.014,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 3,
    });
    geo.translate(0, 0, -depth / 2);
    return geo;
  }, [teeth, outerR, innerR, depth]);
}

export function GearMesh({
  material,
  teeth,
  outerR,
  innerR,
  depth,
  position,
  groupRef,
  scale = 1,
}: {
  material: Material;
  teeth: number;
  outerR: number;
  innerR: number;
  depth: number;
  position: [number, number, number];
  groupRef?: RefObject<Group | null>;
  scale?: number;
}) {
  const geo = useGearGeometry(teeth, outerR, innerR, depth);
  const hubR = innerR * 0.42;
  const tube = innerR * 0.12;
  const ref = groupRef as unknown as RefObject<Group> | undefined;
  return (
    <group
      ref={ref}
      position={position}
      scale={scale}
    >
      <mesh geometry={geo} material={material} />
      <mesh material={material} position={[0, 0, depth * 0.22]}>
        <torusGeometry args={[hubR, tube, 10, 24]} />
      </mesh>
    </group>
  );
}

/** High-detail clay footprint sole + toes (left foot). Flip scale.x for right. */
export function useFootprintGeometry() {
  return useMemo(() => {
    const sole = new Shape();
    sole.moveTo(0, -0.28);
    sole.bezierCurveTo(0.09, -0.29, 0.13, -0.22, 0.135, -0.14);
    sole.bezierCurveTo(0.14, -0.04, 0.13, 0.06, 0.11, 0.14);
    sole.bezierCurveTo(0.1, 0.18, 0.07, 0.2, 0.04, 0.205);
    sole.lineTo(-0.04, 0.205);
    sole.bezierCurveTo(-0.07, 0.2, -0.1, 0.18, -0.11, 0.14);
    sole.bezierCurveTo(-0.13, 0.06, -0.14, -0.04, -0.135, -0.14);
    sole.bezierCurveTo(-0.13, -0.22, -0.09, -0.29, 0, -0.28);
    sole.closePath();

    const geo = new ExtrudeGeometry(sole, {
      depth: 0.07,
      bevelEnabled: true,
      bevelThickness: 0.016,
      bevelSize: 0.014,
      bevelSegments: 3,
      curveSegments: 14,
    });
    geo.translate(0, 0, -0.035);
    geo.rotateX(-Math.PI / 2);

    const toes: [number, number, number][] = [
      [-0.055, 0.255, 0.038],
      [-0.02, 0.285, 0.034],
      [0.015, 0.29, 0.032],
      [0.048, 0.275, 0.028],
      [0.078, 0.245, 0.024],
    ];

    return { sole: geo, toes };
  }, []);
}
