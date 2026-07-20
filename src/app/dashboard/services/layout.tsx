"use client";

import { Layers, Radio, GitBranch } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const servicesTabs = [
  { id: "catalog", label: "Service Catalog", href: "/dashboard/services/catalog", icon: Layers },
  { id: "operating", label: "Operating Blueprint", href: "/dashboard/services/operating", icon: GitBranch },
  { id: "channels", label: "Channel Capabilities", href: "/dashboard/services/channels", icon: Radio },
];

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pt-4 pb-2 lg:px-6">
        <SectionTabs items={servicesTabs} pillar="services" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
