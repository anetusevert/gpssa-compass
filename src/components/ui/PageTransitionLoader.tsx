"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Globe, GitCompare, Layers, Monitor, Lightbulb,
  Server, Building2, GraduationCap, DollarSign, Workflow,
  Map, ListOrdered, FileText, AlertTriangle, BarChart3,
  LayoutDashboard, type LucideIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Route → label + icon mapping
───────────────────────────────────────────────────────────── */

const ROUTES: Record<string, { label: string; icon: LucideIcon; pillar: "discover" | "requirements" | "roadmap" | "home" }> = {
  "/dashboard":                                  { label: "Home",                  icon: LayoutDashboard, pillar: "home" },
  "/dashboard/discover/atlas":                   { label: "Global Atlas",          icon: Globe,           pillar: "discover" },
  "/dashboard/discover/benchmarking":            { label: "Benchmarking",          icon: GitCompare,      pillar: "discover" },
  "/dashboard/discover/services":                { label: "Service Landscape",     icon: Layers,          pillar: "discover" },
  "/dashboard/discover/systems":                 { label: "Systems & Delivery",    icon: Monitor,         pillar: "discover" },
  "/dashboard/discover/design":                  { label: "Design Studio",         icon: Lightbulb,       pillar: "discover" },
  "/dashboard/requirements/infrastructure":      { label: "Infrastructure",        icon: Server,          pillar: "requirements" },
  "/dashboard/requirements/organization":        { label: "Organization",          icon: Building2,       pillar: "requirements" },
  "/dashboard/requirements/capabilities":        { label: "Capabilities",          icon: GraduationCap,   pillar: "requirements" },
  "/dashboard/requirements/investments":         { label: "Investments",           icon: DollarSign,      pillar: "requirements" },
  "/dashboard/requirements/processes":           { label: "Processes",             icon: Workflow,        pillar: "requirements" },
  "/dashboard/roadmap/strategic":                { label: "Strategic Plan",        icon: Map,             pillar: "roadmap" },
  "/dashboard/roadmap/prioritization":           { label: "Prioritization",        icon: ListOrdered,     pillar: "roadmap" },
  "/dashboard/roadmap/concepts":                 { label: "Concept Sheets",        icon: FileText,        pillar: "roadmap" },
  "/dashboard/roadmap/risks":                    { label: "Risks & Mitigations",   icon: AlertTriangle,   pillar: "roadmap" },
  "/dashboard/roadmap/governance":               { label: "Governance & KPIs",     icon: BarChart3,       pillar: "roadmap" },
};

const PILLAR_COLORS: Record<string, string> = {
  discover:     "var(--gpssa-green)",
  requirements: "var(--adl-blue)",
  roadmap:      "var(--gold)",
  home:         "var(--cream)",
};

function getRoute(path: string) {
  if (ROUTES[path]) return ROUTES[path];
  // Try prefix match (longest first)
  const match = Object.keys(ROUTES)
    .filter((r) => path.startsWith(r) && r !== "/dashboard")
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTES[match] : { label: "Loading", icon: LayoutDashboard, pillar: "home" as const };
}

/* ─────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────── */

export function PageTransitionLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [route, setRoute] = useState<ReturnType<typeof getRoute> | null>(null);
  const prevPath = useRef(pathname);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPath.current = pathname;
      return;
    }
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      setRoute(getRoute(pathname));
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 750);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && route && (() => {
        const Icon = route.icon;
        const accentColor = PILLAR_COLORS[route.pillar];
        return (
          <motion.div
            key="page-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none"
            style={{ backgroundColor: "rgba(10,22,40,0.92)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }}
          >
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />

            {/* Ambient glow */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 400,
                height: 400,
                background: `radial-gradient(circle, color-mix(in srgb, ${accentColor} 12%, transparent) 0%, transparent 70%)`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -8 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center"
            >
              {/* Logos */}
              <div className="flex items-center gap-4 mb-8">
                <Image
                  src="/images/adl-logo.png"
                  alt="Arthur D. Little"
                  width={44}
                  height={22}
                  className="object-contain opacity-50"
                  priority
                />
                <div className="w-px h-6 bg-white/20" />
                <span className="font-playfair text-2xl font-bold text-cream/70 tracking-wide">
                  GPSSA
                </span>
              </div>

              {/* Divider line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="h-px w-20 mb-6"
                style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
              />

              {/* Route name */}
              <div className="flex items-center gap-3 mb-6">
                <Icon size={20} strokeWidth={1.6} style={{ color: accentColor }} />
                <span className="font-playfair text-xl text-cream font-semibold">
                  {route.label}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-36 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.65, ease: "easeInOut" }}
                  className="h-full rounded-full"
                  style={{ background: accentColor }}
                />
              </div>

              {/* Compass label */}
              <p className="mt-5 text-[10px] uppercase tracking-[0.35em] font-medium" style={{ color: `${accentColor}80` }}>
                Compass
              </p>
            </motion.div>
          </motion.div>
        );
      })()}
    </AnimatePresence>
  );
}
