"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { MorphScene, type MorphTargetKey } from "./MorphScene";

export default function MorphCanvas({ targetKey }: { targetKey: MorphTargetKey }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <MorphScene targetKey={targetKey} />
      </Suspense>
    </Canvas>
  );
}
