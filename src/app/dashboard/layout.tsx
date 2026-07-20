"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Sidebar, useSidebarStore } from "@/components/layout/Sidebar";
import { ModuleRail, useModuleRailWidth } from "@/components/layout/ModuleRail";
import { PageTransitionLoader } from "@/components/ui/PageTransitionLoader";
import { BriefingDeck } from "@/components/briefing/BriefingDeck";
import { CompassTour } from "@/components/tour/CompassTour";
import { DemoDataBanner } from "@/components/engagement/DemoDataBanner";
import { NextActionBar } from "@/components/engagement/NextActionBar";
import { SpineRibbon } from "@/components/spine/SpineRibbon";

const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 56;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const railWidth = useModuleRailWidth();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
  const showChrome = pathname !== "/dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-navy">
      <Sidebar />

      <motion.main
        className="flex h-screen min-h-0 flex-1 flex-col overflow-hidden"
        animate={{ marginLeft: sidebarWidth, marginRight: railWidth }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {showChrome && (
          <div className="shrink-0">
            <DemoDataBanner pathname={pathname} />
            <NextActionBar pathname={pathname} />
            <SpineRibbon pathname={pathname} />
          </div>
        )}
        <motion.div
          key="dashboard-content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-0 flex-1 overflow-hidden"
        >
          {children}
        </motion.div>
      </motion.main>

      <ModuleRail />
      <PageTransitionLoader />
      <BriefingDeck />
      <CompassTour />
    </div>
  );
}
