"use client";

import { Layers, Radio } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const servicesTabs = [
  { id: "catalog", label: "Service Catalog", href: "/dashboard/services/catalog", icon: Layers },
  { id: "channels", label: "Channel Capabilities", href: "/dashboard/services/channels", icon: Radio },
];

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-5 pb-2">
        <SectionTabs items={servicesTabs} pillar="services" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
