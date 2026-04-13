"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "underline" | "pills";
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className = "",
}: TabsProps) {
  if (variant === "pills") {
    return (
      <div className={`inline-flex gap-1 p-1 glass rounded-xl ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                relative px-4 py-2 text-sm font-medium rounded-lg
                transition-colors duration-200
                ${isActive ? "text-white" : "text-gray-muted hover:text-cream"}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="pill-bg"
                  className="absolute inset-0 bg-gpssa-green/20 border border-gpssa-green/30 rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-2">
                {Icon && <Icon size={16} />}
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative glass rounded-xl p-1 ${className}`}>
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                relative flex-1 px-4 py-2.5 text-sm font-medium
                transition-colors duration-200
                ${isActive ? "text-cream" : "text-gray-muted hover:text-cream"}
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-gpssa-green rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                {Icon && <Icon size={16} />}
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
