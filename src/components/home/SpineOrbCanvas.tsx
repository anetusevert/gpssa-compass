"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { SpineOrbScene } from "./SpineOrbScene";
import type { SpineNodeId } from "@/lib/spine/types";

export default function SpineOrbCanvas({
  selected,
  hovered,
  emphasized,
  conducting,
  accent,
}: {
  selected: SpineNodeId | null;
  hovered: SpineNodeId | null;
  emphasized: Set<SpineNodeId>;
  conducting: boolean;
  accent: string | null;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      orthographic
      camera={{ position: [0, 0, 10], zoom: 100, near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <SpineOrbScene
          selected={selected}
          hovered={hovered}
          emphasized={emphasized}
          conducting={conducting}
          accent={accent}
        />
      </Suspense>
    </Canvas>
  );
}
