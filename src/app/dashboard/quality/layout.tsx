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
    <div className="p-6 lg:p-8 space-y-6">
      <SectionTabs pillar="delivery" items={qualityTabs} />
      {children}
    </div>
  );
}
