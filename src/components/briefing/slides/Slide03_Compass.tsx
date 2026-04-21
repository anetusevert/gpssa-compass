"use client";

import { Globe, Layers, Package, Truck, ScrollText } from "lucide-react";
import { SlideLayout } from "./SlideLayout";
import { OrbitDiagram, type OrbitNode } from "../charts/OrbitDiagram";
import type { BriefingSnapshot } from "@/lib/briefing/types";

interface Props {
  snapshot: BriefingSnapshot;
}

export function Slide03_Compass({ snapshot }: Props) {
  const nodes: OrbitNode[] = [
    {
      id: "atlas",
      label: "Atlas",
      icon: Globe,
      color: "#00A86B",
      count: snapshot.atlas.countryCount,
    },
    {
      id: "services",
      label: "Services",
      icon: Layers,
      color: "#2D4A8C",
      count: snapshot.services.count,
    },
    {
      id: "products",
      label: "Products",
      icon: Package,
      color: "#C5A572",
      count: snapshot.products.count,
    },
    {
      id: "delivery",
      label: "Delivery",
      icon: Truck,
      color: "#2DD4BF",
      count: snapshot.delivery.channels.length,
    },
    {
      id: "standards",
      label: "Standards",
      icon: ScrollText,
      color: "#AA9CFF",
      count: snapshot.standards.count,
    },
  ];

  return (
    <SlideLayout
      eyebrow="Foundation · The Compass"
      title="Five pillars. One operating picture."
      subtitle="Every fact in this deck flows from these five canonical pillars — refreshed continuously by autonomous research agents."
    >
      <div className="flex h-full items-center justify-center">
        <OrbitDiagram
          centerLabel="GPSSA"
          centerSub="Compass"
          nodes={nodes}
          radius={210}
          size={560}
        />
      </div>
    </SlideLayout>
  );
}
