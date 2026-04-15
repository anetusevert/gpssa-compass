"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, type LucideIcon } from "lucide-react";

export interface StatBarItem {
  icon: LucideIcon;
  value: string | number;
  label: string;
  detail?: React.ReactNode;
}

interface StatBarProps {
  items: StatBarItem[];
}

export function StatBar({ items }: StatBarProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <>
      <div className="shrink-0 h-12 flex items-center gap-1 px-4 bg-white/[0.03] backdrop-blur-md border-t border-white/[0.06]">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={() => item.detail && setOpenIdx(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                item.detail
                  ? "hover:bg-white/[0.06] cursor-pointer"
                  : "cursor-default"
              }`}
            >
              <Icon size={13} className="text-gray-muted shrink-0" />
              <span className="font-bold text-cream tabular-nums">{item.value}</span>
              <span className="text-gray-muted hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {openIdx !== null && items[openIdx]?.detail && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
              onClick={() => setOpenIdx(null)}
            />
            <motion.div
              className="relative glass-panel rounded-2xl p-6 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <button
                onClick={() => setOpenIdx(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-muted hover:text-cream hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-3 mb-4 pr-8">
                {(() => { const Icon = items[openIdx].icon; return <Icon size={20} className="text-gpssa-green" />; })()}
                <div>
                  <p className="text-2xl font-bold text-cream font-playfair">{items[openIdx].value}</p>
                  <p className="text-xs text-gray-muted uppercase tracking-wide">{items[openIdx].label}</p>
                </div>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                {items[openIdx].detail}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
