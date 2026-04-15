"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Cpu, Bot, Users, ScrollText, Globe, Scale } from "lucide-react";
import { SectionTabs } from "@/components/ui/SectionTabs";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const adminTabs = [
  { id: "ai-config", label: "AI Configuration", href: "/dashboard/admin/ai-config", icon: Cpu },
  { id: "agents", label: "Agents", href: "/dashboard/admin/agents", icon: Bot },
  { id: "users", label: "Users", href: "/dashboard/admin/users", icon: Users },
  { id: "research", label: "Research", href: "/dashboard/admin/research", icon: Globe },
  { id: "scoring", label: "Scoring", href: "/dashboard/admin/scoring", icon: Scale },
  { id: "activity", label: "Activity Logs", href: "/dashboard/admin/activity", icon: ScrollText },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if ((session?.user as { role?: string } | undefined)?.role !== "admin") {
    return null;
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <SectionTabs items={adminTabs} pillar="admin" />
      {children}
    </div>
  );
}
