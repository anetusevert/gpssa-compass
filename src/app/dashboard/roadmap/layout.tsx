"use client";

import { Map, ListOrdered, FileText, AlertTriangle, BarChart3 } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const roadmapTabs = [
  { id: "strategic", label: "Strategic Plan", href: "/dashboard/roadmap/strategic", icon: Map },
  { id: "prioritization", label: "Prioritization", href: "/dashboard/roadmap/prioritization", icon: ListOrdered },
  { id: "concepts", label: "Concept Sheets", href: "/dashboard/roadmap/concepts", icon: FileText },
  { id: "risks", label: "Risks", href: "/dashboard/roadmap/risks", icon: AlertTriangle },
  { id: "governance", label: "Governance & KPIs", href: "/dashboard/roadmap/governance", icon: BarChart3 },
];

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <SectionTabs items={roadmapTabs} pillar="roadmap" />
      {children}
    </div>
  );
}
