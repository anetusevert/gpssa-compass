"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { UserMenu } from "./UserMenu";
import {
  Globe,
  GitCompare,
  Layers,
  Radio,
  Sparkles,
  Package,
  Users2,
  Lightbulb,
  Truck,
  UserCircle,
  Network,
  Bot,
  Users,
  Database,
  ScrollText,
  Cpu,
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
  glow: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
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
      { label: "Service Analysis", href: "/dashboard/services/analysis", icon: Sparkles },
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
      { label: "Innovation", href: "/dashboard/products/innovation", icon: Lightbulb },
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
      { label: "Delivery Models", href: "/dashboard/delivery/models", icon: Network },
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
      { label: "Data Management", href: "/dashboard/admin/data", icon: Database },
      { label: "Activity Logs", href: "/dashboard/admin/activity", icon: ScrollText },
    ],
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;
const SIDEBAR_WIDTH = 280;

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  return (
    <motion.aside
      className="glass-panel fixed left-0 top-0 z-40 flex h-screen w-[280px] flex-col overflow-hidden border-r border-white/[0.03]"
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

      <Link href="/dashboard" className="relative flex flex-col items-center px-6 pb-4 pt-6">
        <div className="flex items-center gap-3">
          <Image
            src="/images/adl-logo.png"
            alt="Arthur D. Little"
            width={52}
            height={30}
            className="adl-logo-white object-contain"
          />
          <div className="h-6 w-px bg-white/10" />
          <span className="font-playfair text-2xl font-bold text-cream">
            GPSSA
          </span>
        </div>
        <span className="mt-2 text-micro uppercase tracking-[0.34em] text-white/56">
          Intelligence
        </span>
      </Link>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {NAV_SECTIONS.map((section, sectionIndex) => {
          if (section.adminOnly && userRole !== "admin") return null;

          return (
            <motion.div
              key={section.title}
              className="mb-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: sectionIndex * 0.06 }}
            >
              <div className="mb-2 flex items-center gap-2 px-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: section.color }}
                />
                <span className="text-micro font-semibold uppercase tracking-[0.22em] text-white/48">
                  {section.title}
                </span>
              </div>

              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-sm text-white/82 transition-all duration-300 hover:bg-white/[0.045] hover:text-white"
                        style={
                          isActive
                            ? {
                                background:
                                  "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
                                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 16px 32px ${section.glow}`,
                              }
                            : undefined
                        }
                      >
                        {isActive && (
                          <div
                            className="absolute inset-y-2 left-0 w-1 rounded-full"
                            style={{ backgroundColor: section.color }}
                          />
                        )}

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                          <Icon size={17} className="icon-white" strokeWidth={1.8} />
                        </div>

                        <span className="truncate whitespace-nowrap">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.04] px-4 py-3">
        <UserMenu collapsed={false} />
      </div>
    </motion.aside>
  );
}
