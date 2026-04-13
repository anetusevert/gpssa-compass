"use client";

import { Layers, Radio, Sparkles } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const servicesTabs = [
  { id: "catalog", label: "Service Catalog", href: "/dashboard/services/catalog", icon: Layers },
  { id: "channels", label: "Channel Capabilities", href: "/dashboard/services/channels", icon: Radio },
  { id: "analysis", label: "Service Analysis", href: "/dashboard/services/analysis", icon: Sparkles },
];

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <SectionTabs items={servicesTabs} pillar="services" />
      {children}
    </div>
  );
}
