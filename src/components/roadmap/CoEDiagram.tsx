"use client";

import { motion } from "framer-motion";
import { Building2, Users } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

const DEPARTMENTS = [
  "End of Service",
  "Member Services",
  "Employer Relations",
  "Contributions",
  "Benefits & Payments",
  "Digital Channels",
];

export function CoEDiagram() {
  return (
    <div className="space-y-5">
      {/* Coordinating council */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-2xl border border-adl-blue/30 bg-adl-blue/10 px-4 py-3 text-center"
      >
        <Users size={16} className="text-adl-blue" />
        <span className="text-sm font-semibold text-cream">
          Sector Quality Council
        </span>
        <span className="text-xs text-gray-muted">(cross-functional)</span>
      </motion.div>

      <div className="flex justify-center">
        <div className="h-5 w-px bg-white/15" />
      </div>

      {/* Central CoE */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
        className="mx-auto max-w-lg rounded-2xl border border-gold/40 bg-gradient-to-b from-gold/15 to-transparent p-5 text-center"
      >
        <div className="mb-2 inline-flex items-center gap-2">
          <Building2 size={18} className="text-gold" />
          <h3 className="font-playfair text-lg font-semibold text-cream">
            Quality / CX Centre of Excellence
          </h3>
        </div>
        <p className="text-xs text-gray-muted">
          Owns QA scorecards, sampling rules, error taxonomy, KPI/KQI catalogue,
          calibration &amp; governance standards — sets the method, not the
          day-to-day delivery.
        </p>
      </motion.div>

      <div className="flex justify-center">
        <div className="h-5 w-px bg-white/15" />
      </div>

      {/* Embedded departments */}
      <div>
        <p className="mb-2 text-center text-[11px] uppercase tracking-wide text-gray-muted">
          Execution accountability embedded in each department
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {DEPARTMENTS.map((d, i) => (
            <motion.div
              key={d}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.04, ease: EASE }}
              className="rounded-xl border border-teal-400/25 bg-teal-400/5 px-3 py-2.5 text-center text-xs font-medium text-cream"
            >
              {d}
            </motion.div>
          ))}
        </div>
      </div>

      <p className="rounded-xl border border-border bg-navy-light/40 p-3 text-center text-[11px] text-gray-muted">
        <span className="font-semibold text-cream">Federated / hybrid model:</span>{" "}
        consistency from the CoE plus local ownership in departments — countering
        fragmented governance without creating a central bottleneck.
      </p>
    </div>
  );
}
