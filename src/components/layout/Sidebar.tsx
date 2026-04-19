"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { UserMenu } from "./UserMenu";
import { BriefingTrigger } from "@/components/briefing/BriefingTrigger";
import {
  Globe,
  GitCompare,
  Layers,
  Radio,
  Package,
  Users2,
  Truck,
  UserCircle,
  Bot,
  Users,
  Database,
  ScrollText,
  Cpu,
  PanelLeftClose,
  PanelLeftOpen,
  Scale,
  Network,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { create } from "zustand";

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: false,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  title: string;
  prefix: string;
  color: string;
  glow: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "MANDATE",
    prefix: "/dashboard/mandate",
    color: "var(--gpssa-green)",
    glow: "rgba(0,168,107,0.14)",
    items: [
      { label: "Legal & Governance", href: "/dashboard/mandate", icon: Scale },
      { label: "RFI Alignment", href: "/dashboard/mandate/rfi-alignment", icon: Network },
    ],
  },
  {
    title: "GLOBAL ATLAS",
    prefix: "/dashboard/atlas",
    color: "var(--gpssa-green)",
    glow: "rgba(0,168,107,0.14)",
    items: [
      { label: "World Map", href: "/dashboard/atlas", icon: Globe },
      { label: "Benchmarking", href: "/dashboard/atlas/benchmarking", icon: GitCompare },
    ],
  },
  {
    title: "SERVICES",
    prefix: "/dashboard/services",
    color: "var(--adl-blue)",
    glow: "rgba(45,74,140,0.14)",
    items: [
      { label: "Service Catalog", href: "/dashboard/services/catalog", icon: Layers },
      { label: "Channel Capabilities", href: "/dashboard/services/channels", icon: Radio },
    ],
  },
  {
    title: "PRODUCTS",
    prefix: "/dashboard/products",
    color: "var(--gold)",
    glow: "rgba(197,165,114,0.14)",
    items: [
      { label: "Portfolio", href: "/dashboard/products/portfolio", icon: Package },
      { label: "Segment Coverage", href: "/dashboard/products/segments", icon: Users2 },
    ],
  },
  {
    title: "DELIVERY",
    prefix: "/dashboard/delivery",
    color: "var(--teal)",
    glow: "rgba(45,212,191,0.14)",
    items: [
      { label: "Channels", href: "/dashboard/delivery/channels", icon: Truck },
      { label: "Personas", href: "/dashboard/delivery/personas", icon: UserCircle },
    ],
  },
  {
    title: "DATA",
    prefix: "/dashboard/data",
    color: "var(--adl-blue)",
    glow: "rgba(45,74,140,0.14)",
    items: [
      { label: "Data & Sources", href: "/dashboard/data", icon: Database },
    ],
  },
  {
    title: "ADMIN",
    prefix: "/dashboard/admin",
    color: "rgba(255,255,255,0.72)",
    glow: "rgba(255,255,255,0.1)",
    adminOnly: true,
    items: [
      { label: "AI Configuration", href: "/dashboard/admin/ai-config", icon: Cpu },
      { label: "Agents", href: "/dashboard/admin/agents", icon: Bot },
      { label: "Users", href: "/dashboard/admin/users", icon: Users },
      { label: "Activity Logs", href: "/dashboard/admin/activity", icon: ScrollText },
    ],
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;
const SIDEBAR_EXPANDED = 260;
const SIDEBAR_COLLAPSED = 56;

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  const { collapsed, toggle } = useSidebarStore();

  const width = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  return (
    <motion.aside
      className="glass-panel fixed left-0 top-0 z-40 flex h-screen flex-col overflow-hidden border-r border-white/[0.03]"
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1, width }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

      {/* Header */}
      <Link href="/dashboard" className="relative flex flex-col items-center px-3 pb-2 pt-4">
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.span
              key="collapsed-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="font-playfair text-lg font-bold text-cream"
            >
              G
            </motion.span>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="flex items-center gap-2.5">
                <Image
                  src="/images/adl-logo.png"
                  alt="Arthur D. Little"
                  width={44}
                  height={26}
                  className="object-contain brightness-0 invert"
                />
                <div className="h-5 w-px bg-white/10" />
                <span className="font-playfair text-xl font-bold text-cream">
                  GPSSA
                </span>
              </div>
              <span className="mt-1 text-[9px] uppercase tracking-[0.34em] text-white/50">
                Intelligence
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      <BriefingTrigger collapsed={collapsed} />

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2 pb-1 scrollbar-none">
        {NAV_SECTIONS.map((section, sectionIndex) => {
          if (section.adminOnly && userRole !== "admin") return null;

          return (
            <div
              key={section.title}
              className="mb-2"
            >
              {!collapsed && (
                <div className="mb-1 flex items-center gap-1.5 px-2 pt-1">
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{ backgroundColor: section.color }}
                  />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    {section.title}
                  </span>
                </div>
              )}

              <ul className="space-y-px">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`group relative flex items-center overflow-hidden rounded-xl text-[13px] text-white/75 transition-all duration-200 hover:bg-white/[0.045] hover:text-white ${
                          collapsed ? "justify-center px-2 py-2" : "gap-2.5 px-2.5 py-2"
                        } ${isActive ? "text-white" : ""}`}
                        style={
                          isActive
                            ? {
                                background:
                                  "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px ${section.glow}`,
                              }
                            : undefined
                        }
                      >
                        {isActive && (
                          <div
                            className="absolute inset-y-1.5 left-0 w-[3px] rounded-full"
                            style={{ backgroundColor: section.color }}
                          />
                        )}

                        <Icon size={16} className="shrink-0 opacity-70 group-hover:opacity-100" strokeWidth={1.8} />

                        {!collapsed && (
                          <span className="truncate whitespace-nowrap">{item.label}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="px-2 pb-0.5">
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center rounded-lg py-1.5 text-white/30 transition-colors hover:bg-white/[0.04] hover:text-white/60"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* User */}
      <div className="border-t border-white/[0.04] px-2 py-2">
        <UserMenu collapsed={collapsed} />
      </div>
    </motion.aside>
  );
}
