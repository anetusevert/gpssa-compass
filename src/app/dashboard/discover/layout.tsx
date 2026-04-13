"use client";

import { usePathname } from "next/navigation";
import { Globe, GitCompare, Layers, Monitor, Lightbulb } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const discoverTabs = [
  { id: "atlas", label: "Global Atlas", href: "/dashboard/discover/atlas", icon: Globe },
  { id: "benchmarking", label: "Benchmarking", href: "/dashboard/discover/benchmarking", icon: GitCompare },
  { id: "services", label: "Service Landscape", href: "/dashboard/discover/services", icon: Layers },
  { id: "systems", label: "Systems & Delivery", href: "/dashboard/discover/systems", icon: Monitor },
  { id: "design", label: "Design Studio", href: "/dashboard/discover/design", icon: Lightbulb },
];

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBenchmarkingStage = pathname === "/dashboard/discover/benchmarking";

  return (
    <div
      className={
        isBenchmarkingStage
          ? "flex h-full min-h-0 flex-col gap-2 overflow-hidden px-3 pb-2 pt-3 lg:px-4 lg:pb-3 lg:pt-4"
          : "space-y-6 p-6 lg:p-8"
      }
    >
      <SectionTabs
        items={discoverTabs}
        pillar="discover"
        className={isBenchmarkingStage ? "shrink-0 flex-wrap overflow-visible pb-0" : ""}
      />
      <div className={isBenchmarkingStage ? "min-h-0 flex-1 overflow-hidden" : ""}>
        {children}
      </div>
    </div>
  );
}
