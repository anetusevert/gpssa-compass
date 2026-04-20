"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar, useSidebarStore } from "@/components/layout/Sidebar";
import { PageTransitionLoader } from "@/components/ui/PageTransitionLoader";
import { BriefingDeck } from "@/components/briefing/BriefingDeck";
import { CompassTour } from "@/components/tour/CompassTour";

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 56;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const isAtlasCountryPage = pathname.startsWith("/dashboard/atlas/country/");
  // Every Mandate route is a single-viewport experience (no document scroll).
  const isMandatePage = pathname.startsWith("/dashboard/mandate");
  const isFullViewport = pathname === "/dashboard/atlas/benchmarking"
    || pathname === "/dashboard/services/catalog"
    || pathname === "/dashboard/services/channels"
    || pathname === "/dashboard/delivery/channels"
    || pathname === "/dashboard/delivery/personas"
    || pathname === "/dashboard/products/portfolio"
    || pathname === "/dashboard/products/segments"
    || isMandatePage
    || isAtlasCountryPage;
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar />

      <motion.main
        className={`flex-1 ${
          isFullViewport ? "h-screen overflow-hidden" : "overflow-y-auto"
        }`}
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          key="dashboard-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={isFullViewport ? "h-full overflow-hidden" : ""}
        >
          {children}
        </motion.div>
      </motion.main>
      <PageTransitionLoader />
      <BriefingDeck />
      <CompassTour />
    </div>
  );
}
