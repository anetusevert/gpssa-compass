"use client";

import { Truck, UserCircle, Network } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const deliveryTabs = [
  { id: "channels", label: "Channels", href: "/dashboard/delivery/channels", icon: Truck },
  { id: "models", label: "Delivery Models", href: "/dashboard/delivery/models", icon: Network },
  { id: "personas", label: "Personas", href: "/dashboard/delivery/personas", icon: UserCircle },
];

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 px-5 pt-4 pb-2 lg:px-6">
        <SectionTabs items={deliveryTabs} pillar="delivery" />
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
