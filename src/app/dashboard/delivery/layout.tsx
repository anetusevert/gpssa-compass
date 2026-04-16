"use client";

import { Truck, UserCircle } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const deliveryTabs = [
  { id: "channels", label: "Channels & Delivery Model", href: "/dashboard/delivery/channels", icon: Truck },
  { id: "personas", label: "Personas", href: "/dashboard/delivery/personas", icon: UserCircle },
];

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 px-6 lg:px-8 pt-6 lg:pt-8 pb-4">
        <SectionTabs items={deliveryTabs} pillar="delivery" />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
