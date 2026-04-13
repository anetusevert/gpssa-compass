"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import {
  Globe,
  GitCompare,
  Layers,
  Monitor,
  Lightbulb,
  Server,
  Building2,
  GraduationCap,
  DollarSign,
  Workflow,
  Map,
  ListOrdered,
  FileText,
  AlertTriangle,
  BarChart3,
  Bot,
  Users,
  Database,
  ScrollText,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  prefix: string;
  color: string;
  dotColor: string;
  hoverBg: string;
  activeColor: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "DISCOVER",
    prefix: "/dashboard/discover",
    color: "text-gpssa-green",
    dotColor: "bg-gpssa-green",
    hoverBg: "hover:bg-gpssa-green/10",
    activeColor: "bg-gpssa-green/15 text-gpssa-green",
    items: [
      { label: "Global Atlas", href: "/dashboard/discover/atlas", icon: Globe },
      { label: "Benchmarking", href: "/dashboard/discover/benchmarking", icon: GitCompare },
      { label: "Service Landscape", href: "/dashboard/discover/services", icon: Layers },
      { label: "Systems & Delivery", href: "/dashboard/discover/systems", icon: Monitor },
      { label: "Design Studio", href: "/dashboard/discover/design", icon: Lightbulb },
    ],
  },
  {
    title: "REQUIREMENTS",
    prefix: "/dashboard/requirements",
    color: "text-adl-blue",
    dotColor: "bg-adl-blue",
    hoverBg: "hover:bg-adl-blue/10",
    activeColor: "bg-adl-blue/15 text-adl-blue",
    items: [
      { label: "Infrastructure", href: "/dashboard/requirements/infrastructure", icon: Server },
      { label: "Organization", href: "/dashboard/requirements/organization", icon: Building2 },
      { label: "Capabilities", href: "/dashboard/requirements/capabilities", icon: GraduationCap },
      { label: "Investments", href: "/dashboard/requirements/investments", icon: DollarSign },
      { label: "Processes", href: "/dashboard/requirements/processes", icon: Workflow },
    ],
  },
  {
    title: "ROADMAP",
    prefix: "/dashboard/roadmap",
    color: "text-gold",
    dotColor: "bg-gold",
    hoverBg: "hover:bg-gold/10",
    activeColor: "bg-gold/15 text-gold",
    items: [
      { label: "Strategic Plan", href: "/dashboard/roadmap/strategic", icon: Map },
      { label: "Prioritization", href: "/dashboard/roadmap/prioritization", icon: ListOrdered },
      { label: "Concept Sheets", href: "/dashboard/roadmap/concepts", icon: FileText },
      { label: "Risks", href: "/dashboard/roadmap/risks", icon: AlertTriangle },
      { label: "Governance & KPIs", href: "/dashboard/roadmap/governance", icon: BarChart3 },
    ],
  },
  {
    title: "ADMIN",
    prefix: "/dashboard/admin",
    color: "text-gray-muted",
    dotColor: "bg-gray-muted",
    hoverBg: "hover:bg-gray-muted/10",
    activeColor: "bg-gray-muted/15 text-cream",
    adminOnly: true,
    items: [
      { label: "AI Configuration", href: "/dashboard/admin/ai-config", icon: Bot },
      { label: "Users", href: "/dashboard/admin/users", icon: Users },
      { label: "Data Management", href: "/dashboard/admin/data", icon: Database },
      { label: "Activity Logs", href: "/dashboard/admin/activity", icon: ScrollText },
    ],
  },
];

const SECTION_EASE = [0.16, 1, 0.3, 1] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  const userRole = (session?.user as { role?: string } | undefined)?.role;

  return (
    <motion.aside
      className="glass-panel fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--border)]"
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: SECTION_EASE }}
    >
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex flex-col items-center px-4 pb-2 pt-5"
      >
        <AnimatePresence mode="wait">
          {sidebarCollapsed ? (
            <motion.div
              key="collapsed-logo"
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src="/images/adl-logo.png"
                alt="Arthur D. Little"
                width={28}
                height={14}
                className="object-contain brightness-0 invert"
              />
              <span className="font-playfair text-[13px] font-bold text-cream">
                GPSSA
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/images/adl-logo.png"
                  alt="Arthur D. Little"
                  width={36}
                  height={18}
                  className="object-contain brightness-0 invert"
                />
                <div className="h-5 w-px bg-[var(--border)]" />
                <span className="font-playfair text-xl font-bold text-cream">
                  GPSSA
                </span>
              </div>
              <motion.span
                className="text-micro uppercase tracking-[0.3em] text-gpssa-green"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                COMPASS
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Divider */}
      <div className="mx-4 my-3 h-px bg-[var(--border)]" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3">
        {NAV_SECTIONS.map((section) => {
          if (section.adminOnly && userRole !== "admin") return null;

          const isSectionActive = pathname.startsWith(section.prefix);

          return (
            <div key={section.title} className="mb-2">
              {/* Section header -- always visible */}
              {!sidebarCollapsed ? (
                <Link
                  href={section.items[0].href}
                  className={`mb-1 flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-200 group ${
                    isSectionActive
                      ? ""
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                    isSectionActive ? section.dotColor : "bg-gray-muted/40 group-hover:" + section.dotColor
                  }`} />
                  <span className={`text-micro font-semibold uppercase tracking-wider flex-1 transition-colors duration-200 ${
                    isSectionActive ? section.color : "text-gray-muted/60 group-hover:text-gray-muted"
                  }`}>
                    {section.title}
                  </span>
                  {!isSectionActive && (
                    <ChevronRight size={12} className="text-gray-muted/40 group-hover:text-gray-muted transition-colors" />
                  )}
                </Link>
              ) : (
                <Link
                  href={section.items[0].href}
                  className="mb-1.5 flex justify-center"
                  title={section.title}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    isSectionActive ? section.dotColor : "bg-gray-muted/40"
                  }`} />
                </Link>
              )}

              {/* Section items -- only when active (or when sidebar is collapsed, show all icons) */}
              <AnimatePresence initial={false}>
                {(isSectionActive || sidebarCollapsed) && (
                  <motion.ul
                    className="space-y-0.5 overflow-hidden"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: SECTION_EASE }}
                  >
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                              isActive
                                ? section.activeColor
                                : `text-gray-muted ${section.hoverBg} hover:text-cream`
                            }`}
                            title={sidebarCollapsed ? item.label : undefined}
                          >
                            <Icon
                              size={18}
                              className={`shrink-0 transition-colors duration-200 ${
                                isActive ? "" : "group-hover:text-cream"
                              }`}
                            />
                            <AnimatePresence>
                              {!sidebarCollapsed && (
                                <motion.span
                                  className="truncate whitespace-nowrap"
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: "auto" }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  {item.label}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-[var(--border)] p-3">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-muted transition-colors duration-200 hover:bg-white/5 hover:text-cream"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeft size={18} />
          ) : (
            <>
              <PanelLeftClose size={18} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
