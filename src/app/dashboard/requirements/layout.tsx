"use client";

import { Server, Building2, GraduationCap, DollarSign, Workflow } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const requirementsTabs = [
  { id: "infrastructure", label: "Infrastructure", href: "/dashboard/requirements/infrastructure", icon: Server },
  { id: "organization", label: "Organization", href: "/dashboard/requirements/organization", icon: Building2 },
  { id: "capabilities", label: "Capabilities", href: "/dashboard/requirements/capabilities", icon: GraduationCap },
  { id: "investments", label: "Investments", href: "/dashboard/requirements/investments", icon: DollarSign },
  { id: "processes", label: "Processes", href: "/dashboard/requirements/processes", icon: Workflow },
];

export default function RequirementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <SectionTabs items={requirementsTabs} pillar="requirements" />
      {children}
    </div>
  );
}
