"use client";

import { motion } from "framer-motion";
import { Globe2, ArrowLeftRight } from "lucide-react";
import { COUNTRIES } from "@/lib/countries/catalog";

interface ComparisonBannerProps {
  selectedCountries: string[];
}

export function ComparisonBanner({ selectedCountries }: ComparisonBannerProps) {
  if (selectedCountries.length === 0) return null;

  const countries = selectedCountries
    .map((iso3) => COUNTRIES.find((c) => c.iso3 === iso3))
    .filter(Boolean);

  const gpssa = COUNTRIES.find((c) => c.iso3 === "ARE");

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gpssa-green/8 via-adl-blue/5 to-gold/8 border border-gpssa-green/15"
    >
      <Globe2 size={14} className="text-gpssa-green shrink-0" />
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-cream">
          {gpssa?.flag} GPSSA
        </span>
        <ArrowLeftRight size={10} className="text-gray-muted" />
        {countries.map((c, i) => (
          <span key={c!.iso3} className="inline-flex items-center gap-1 text-cream/80">
            {i > 0 && <span className="text-gray-muted mx-0.5">·</span>}
            <span className="text-sm">{c!.flag}</span>
            <span>{c!.name}</span>
          </span>
        ))}
      </div>
      <span className="ml-auto text-[10px] uppercase tracking-wide text-gpssa-green/60 shrink-0">
        Comparing
      </span>
    </motion.div>
  );
}
