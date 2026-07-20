"use client";

import { usePathname } from "next/navigation";
import { LayoutGrid, FileCheck2, AlarmClockOff, LineChart } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const fulfilmentTabs = [
  { id: "cases", label: "Case Board", href: "/dashboard/fulfilment/cases", icon: LayoutGrid },
  { id: "sla", label: "SLA / OLA", href: "/dashboard/fulfilment/sla", icon: FileCheck2 },
  { id: "breach", label: "Breach & Aging", href: "/dashboard/fulfilment/breach", icon: AlarmClockOff },
  { id: "analytics", label: "Analytics", href: "/dashboard/fulfilment/analytics", icon: LineChart },
];

// Case Board + Breach are full-viewport routes (registered in dashboard layout).
const FULL_VIEWPORT = [
  "/dashboard/fulfilment/cases",
  "/dashboard/fulfilment/breach",
];

export default function FulfilmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFullViewport = FULL_VIEWPORT.includes(pathname);

  if (isFullViewport) {
    // Render full-bleed: the page supplies its own h-full flex chrome + scroll.
    return <>{children}</>;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 p-6 lg:p-8">
      <SectionTabs items={fulfilmentTabs} pillar="products" className="shrink-0" />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
