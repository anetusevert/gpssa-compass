"use client";

import {
  LayoutGrid,
  ClipboardCheck,
  ListChecks,
  Scale,
  Network,
  Wrench,
} from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const qualityTabs = [
  { id: "framework", label: "Framework", href: "/dashboard/quality/framework", icon: LayoutGrid },
  { id: "scorecards", label: "Scorecards", href: "/dashboard/quality/scorecards", icon: ClipboardCheck },
  { id: "reviews", label: "Reviews & Sampling", href: "/dashboard/quality/reviews", icon: ListChecks },
  { id: "calibration", label: "Calibration", href: "/dashboard/quality/calibration", icon: Scale },
  { id: "taxonomy", label: "Error Taxonomy", href: "/dashboard/quality/taxonomy", icon: Network },
  { id: "capa", label: "Corrective Actions", href: "/dashboard/quality/capa", icon: Wrench },
];

export default function QualityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-4 lg:p-6">
      <div className="shrink-0">
        <SectionTabs pillar="delivery" items={qualityTabs} />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
