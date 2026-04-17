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
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0 px-6 pt-5 pb-2">
        <SectionTabs items={productsTabs} pillar="products" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
