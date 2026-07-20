"use client";

import { Package, Users2 } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const productsTabs = [
  { id: "portfolio", label: "Portfolio", href: "/dashboard/products/portfolio", icon: Package },
  { id: "segments", label: "Segment Coverage", href: "/dashboard/products/segments", icon: Users2 },
];

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pt-4 pb-2 lg:px-6">
        <SectionTabs items={productsTabs} pillar="products" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
