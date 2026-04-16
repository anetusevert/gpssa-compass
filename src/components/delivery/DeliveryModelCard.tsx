"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type MaturityLevel = "High" | "Medium" | "Low";

export interface DeliveryModelData {
  id: string;
  title: string;
  icon: LucideIcon;
  description: string;
  covers: string[];
  targets: string[];
  maturity: MaturityLevel;
  enablers: string[];
}

function maturityColor(level: MaturityLevel) {
  if (level === "High") return { variant: "green" as const, width: "85%" };
  if (level === "Medium") return { variant: "gold" as const, width: "55%" };
  return { variant: "gray" as const, width: "30%" };
}

const cardVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24, delay: i * 0.08 },
  }),
};

interface DeliveryModelCardProps {
  model: DeliveryModelData;
  index: number;
}

export function DeliveryModelCard({ model, index }: DeliveryModelCardProps) {
  const Icon = model.icon;
  const { variant, width } = maturityColor(model.maturity);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3.5 hover:bg-white/[0.05] transition-colors duration-300 group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] shrink-0 group-hover:bg-white/[0.07] transition-colors">
          <Icon size={16} className="text-teal-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-playfair text-sm font-semibold text-cream truncate">{model.title}</h4>
            <Badge variant={variant} size="sm" dot>{model.maturity}</Badge>
          </div>

          <p className="text-[11px] text-gray-muted leading-relaxed mt-1 line-clamp-2">{model.description}</p>

          <div className="mt-2.5">
            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-adl-blue via-teal-400 to-gpssa-green"
                initial={{ width: 0 }}
                animate={{ width }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 + index * 0.08 }}
              />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {model.covers.slice(0, 3).map((ch) => (
              <span key={ch} className="text-[9px] px-1.5 py-0.5 rounded bg-adl-blue/10 text-adl-blue/80 border border-adl-blue/15">
                {ch}
              </span>
            ))}
            {model.covers.length > 3 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-muted">
                +{model.covers.length - 3}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap gap-1">
            {model.targets.slice(0, 2).map((t) => (
              <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-gold/10 text-gold/80 border border-gold/15">
                {t}
              </span>
            ))}
            {model.targets.length > 2 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-muted">
                +{model.targets.length - 2}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
