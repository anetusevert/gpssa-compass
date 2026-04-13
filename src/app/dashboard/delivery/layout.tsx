"use client";

import { Truck, UserCircle, Network } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";

const deliveryTabs = [
  { id: "channels", label: "Channels", href: "/dashboard/delivery/channels", icon: Truck },
  { id: "personas", label: "Personas", href: "/dashboard/delivery/personas", icon: UserCircle },
  { id: "models", label: "Delivery Models", href: "/dashboard/delivery/models", icon: Network },
];

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <SectionTabs items={deliveryTabs} pillar="delivery" />
      {children}
    </div>
  );
}
