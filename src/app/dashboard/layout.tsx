"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageTransitionLoader } from "@/components/ui/PageTransitionLoader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed);
  const pathname = usePathname();
  const isBenchmarkingStage = pathname === "/dashboard/atlas/benchmarking";

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar />

      <motion.main
        className={`flex-1 ${
          isBenchmarkingStage ? "h-screen overflow-hidden" : "overflow-y-auto"
        }`}
        animate={{ marginLeft: sidebarCollapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          key="dashboard-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={isBenchmarkingStage ? "h-full overflow-hidden" : ""}
        >
          {children}
        </motion.div>
      </motion.main>
      <PageTransitionLoader />
    </div>
  );
}
