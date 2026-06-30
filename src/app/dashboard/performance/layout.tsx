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
    <div className="p-6 lg:p-8 space-y-6">
      <SectionTabs pillar="atlas" items={performanceTabs} />
      {children}
    </div>
  );
}
