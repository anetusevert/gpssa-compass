"use client";

import { CalendarRange, ListOrdered, Network, Building2 } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const roadmapTabs = [
  {
    id: "roadmap",
    label: "12-Month Roadmap",
    href: "/dashboard/roadmap",
    icon: CalendarRange,
  },
  {
    id: "backlog",
    label: "Opportunity Backlog",
    href: "/dashboard/roadmap/backlog",
    icon: ListOrdered,
  },
  {
    id: "governance",
    label: "Governance & RACI",
    href: "/dashboard/roadmap/governance",
    icon: Network,
  },
  {
    id: "operating-model",
    label: "Operating Model",
    href: "/dashboard/roadmap/operating-model",
    icon: Building2,
  },
];

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <SectionTabs pillar="roadmap" items={roadmapTabs} />
      {children}
    </div>
  );
}
