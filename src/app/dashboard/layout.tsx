"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar, useSidebarStore } from "@/components/layout/Sidebar";
import { PageTransitionLoader } from "@/components/ui/PageTransitionLoader";
import { BriefingDeck } from "@/components/briefing/BriefingDeck";
import { CompassTour } from "@/components/tour/CompassTour";
import { DemoDataBanner } from "@/components/engagement/DemoDataBanner";
import { NextActionBar } from "@/components/engagement/NextActionBar";

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
  const isFullViewport = pathname === "/dashboard"
    || pathname === "/dashboard/atlas/benchmarking"
    || pathname === "/dashboard/services/catalog"
    || pathname === "/dashboard/services/channels"
    || pathname === "/dashboard/delivery/channels"
    || pathname === "/dashboard/delivery/personas"
    || pathname === "/dashboard/products/portfolio"
    || pathname === "/dashboard/products/segments"
    || pathname === "/dashboard/fulfilment/cases"
    || pathname === "/dashboard/fulfilment/breach"
    || isMandatePage
    || isAtlasCountryPage;
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
  const showChrome = pathname !== "/dashboard";

  return (
    <div className="flex min-h-screen bg-navy">
      <Sidebar />

      <motion.main
        className={`flex flex-1 flex-col ${
          isFullViewport ? "h-screen overflow-hidden" : "overflow-y-auto"
        }`}
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {showChrome && (
          <>
            <DemoDataBanner pathname={pathname} />
            <NextActionBar pathname={pathname} />
          </>
        )}
        <motion.div
          key="dashboard-content"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={isFullViewport ? "min-h-0 flex-1 overflow-hidden" : ""}
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
