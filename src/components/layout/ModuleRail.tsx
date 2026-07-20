"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { create } from "zustand";
import { ALL_MODULES } from "@/components/home/home-modules";

const RAIL_EXPANDED = 200;
const RAIL_COLLAPSED = 48;

interface ModuleRailState {
  collapsed: boolean;
  toggle: () => void;
}

export const useModuleRailStore = create<ModuleRailState>((set) => ({
  collapsed: true,
  toggle: () => set((s) => ({ collapsed: !s.collapsed })),
}));

export function useModuleRailWidth() {
  const collapsed = useModuleRailStore((s) => s.collapsed);
  return collapsed ? RAIL_COLLAPSED : RAIL_EXPANDED;
}

export function ModuleRail() {
  const pathname = usePathname();
  const { collapsed, toggle } = useModuleRailStore();
  const width = collapsed ? RAIL_COLLAPSED : RAIL_EXPANDED;

  return (
    <motion.aside
      className="fixed right-0 top-0 z-30 flex h-screen flex-col border-l border-white/[0.06] bg-[#071322]/95 backdrop-blur-md"
      animate={{ width }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      data-module-rail
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] px-2">
        {!collapsed && (
          <span className="truncate px-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
            All modules
          </span>
        )}
        <button
          type="button"
          onClick={toggle}
          className="rounded-lg p-2 text-white/40 hover:bg-white/[0.06] hover:text-cream"
          aria-label={collapsed ? "Expand module rail" : "Collapse module rail"}
        >
          {collapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-1.5 py-2">
        <ul className="space-y-0.5">
          {ALL_MODULES.map((mod) => {
            const Icon = mod.icon;
            const active =
              pathname === mod.primaryHref || pathname.startsWith(`${mod.primaryHref}/`);
            return (
              <li key={mod.id}>
                <Link
                  href={mod.primaryHref}
                  title={mod.title}
                  className={`flex items-center gap-2 rounded-lg px-2 py-2 transition ${
                    active
                      ? "bg-white/[0.08] text-cream"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
                  }`}
                >
                  <Icon
                    size={16}
                    className="shrink-0"
                    style={{ color: active ? `var(${mod.accentVar})` : undefined }}
                  />
                  {!collapsed && (
                    <span className="truncate text-[11px] font-medium">{mod.title}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </motion.aside>
  );
}
