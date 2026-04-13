"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const pillarAccent = {
  discover: "bg-gpssa-green/20 border-gpssa-green/30 text-gpssa-green",
  requirements: "bg-adl-blue/20 border-adl-blue/30 text-adl-blue",
  roadmap: "bg-gold/20 border-gold/30 text-gold",
  admin: "bg-gray-muted/20 border-gray-muted/30 text-cream",
  atlas: "bg-gpssa-green/20 border-gpssa-green/30 text-gpssa-green",
  services: "bg-adl-blue/20 border-adl-blue/30 text-adl-blue",
  products: "bg-gold/20 border-gold/30 text-gold",
  delivery: "bg-teal-400/20 border-teal-400/30 text-teal-400",
} as const;

const pillarLayoutId = {
  discover: "section-tab-discover",
  requirements: "section-tab-requirements",
  roadmap: "section-tab-roadmap",
  admin: "section-tab-admin",
  atlas: "section-tab-atlas",
  services: "section-tab-services",
  products: "section-tab-products",
  delivery: "section-tab-delivery",
} as const;

interface SectionTabItem {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
}

interface SectionTabsProps {
  items: SectionTabItem[];
  pillar?: keyof typeof pillarAccent;
  className?: string;
}

export function SectionTabs({
  items,
  pillar = "discover",
  className = "",
}: SectionTabsProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`flex gap-1.5 overflow-x-auto pb-1 scrollbar-none ${className}`}
    >
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`
              relative shrink-0 inline-flex items-center gap-2
              px-4 py-2 rounded-xl text-sm font-medium
              transition-colors duration-200
              ${isActive ? "text-cream" : "text-gray-muted hover:text-cream hover:bg-white/5"}
            `}
          >
            {isActive && (
              <motion.div
                layoutId={pillarLayoutId[pillar]}
                className={`absolute inset-0 rounded-xl border ${pillarAccent[pillar]}`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-2">
              {Icon && <Icon size={16} />}
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
