"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { PageTransitionLoader } from "@/components/ui/PageTransitionLoader";

const SIDEBAR_WIDTH = 280;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isBenchmarkingStage = pathname === "/dashboard/atlas/benchmarking";

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar />

      <motion.main
        className={`flex-1 ${
          isBenchmarkingStage ? "h-screen overflow-hidden" : "overflow-y-auto"
        }`}
        animate={{ marginLeft: SIDEBAR_WIDTH }}
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
