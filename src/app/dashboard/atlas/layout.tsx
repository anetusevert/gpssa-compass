"use client";

import { usePathname } from "next/navigation";
import { Globe, GitCompare } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const atlasTabs = [
  { id: "map", label: "World Map", href: "/dashboard/atlas", icon: Globe },
  { id: "benchmarking", label: "Benchmarking", href: "/dashboard/atlas/benchmarking", icon: GitCompare },
];

export default function AtlasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBenchmarkingStage = pathname === "/dashboard/atlas/benchmarking";
  const isCountryDetail = pathname.startsWith("/dashboard/atlas/country/");

  if (isCountryDetail) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {children}
      </div>
    );
  }

  return (
    <div
      className={
        isBenchmarkingStage
          ? "flex h-full min-h-0 flex-col gap-2 overflow-hidden px-3 pb-2 pt-3 lg:px-4 lg:pb-3 lg:pt-4"
          : "space-y-6 p-6 lg:p-8"
      }
    >
      <SectionTabs
        items={atlasTabs}
        pillar="atlas"
        className={isBenchmarkingStage ? "shrink-0 flex-wrap overflow-visible pb-0" : ""}
      />
      <div className={isBenchmarkingStage ? "min-h-0 flex-1 overflow-hidden" : ""}>
        {children}
      </div>
    </div>
  );
}
