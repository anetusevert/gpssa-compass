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
    <div className="space-y-6 p-6 lg:p-8">
      <SectionTabs items={productsTabs} pillar="products" />
      {children}
    </div>
  );
}
