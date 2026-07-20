"use client";

import { ListChecks, Gauge, MessageSquareHeart, Target } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const performanceTabs = [
  { id: "catalogue", label: "KPI / KQI", href: "/dashboard/performance/catalogue", icon: ListChecks },
  { id: "dashboards", label: "Dashboards", href: "/dashboard/performance/dashboards", icon: Gauge },
  { id: "voc", label: "Voice of Customer", href: "/dashboard/performance/voc", icon: MessageSquareHeart },
  { id: "benefits", label: "Benefits Realisation", href: "/dashboard/performance/benefits", icon: Target },
];

export default function PerformanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 lg:p-8">
      <div className="shrink-0">
        <SectionTabs pillar="atlas" items={performanceTabs} />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
