"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe2, X, ChevronDown, Search, Database } from "lucide-react";
import { COUNTRIES, type CountrySeed } from "@/lib/countries/catalog";
import { CountryFlag } from "@/components/ui/CountryFlag";

interface CountryWithData extends CountrySeed {
  dataCounts?: { services: number; products: number; segments: number };
}

interface CountrySelectorProps {
  selected: string[];
  onChange: (iso3List: string[]) => void;
  maxSelections?: number;
  pillar?: "services" | "products";
  variant?: "default" | "inline";
}

const FEATURED_ISO3 = ["SAU", "BHR", "KWT", "OMN", "QAT", "SGP", "AUS", "GBR", "EST", "IDN"];

export function CountrySelector({
  selected,
  onChange,
  maxSelections = 5,
  pillar = "services",
  variant = "default",
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [countriesWithData, setCountriesWithData] = useState<CountryWithData[]>([]);

  useEffect(() => {
    fetch("/api/international/countries")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: { iso3: string; dataCounts: { services: number; products: number; segments: number } }[]) => {
        const dataMap = new Map(data.map((d) => [d.iso3, d.dataCounts]));
        const enriched = COUNTRIES.filter((c) => c.iso3 !== "ARE").map((c) => ({
          ...c,
          dataCounts: dataMap.get(c.iso3),
        }));
        setCountriesWithData(enriched);
      })
      .catch(() => {
        setCountriesWithData(COUNTRIES.filter((c) => c.iso3 !== "ARE"));
      });
  }, []);

  const featured = countriesWithData.filter((c) => FEATURED_ISO3.includes(c.iso3));
  const others = countriesWithData.filter((c) => !FEATURED_ISO3.includes(c.iso3));

  const filtered = search.trim()
    ? countriesWithData.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.iso3.toLowerCase().includes(search.toLowerCase()) ||
          c.region.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const displayList = filtered ?? [...featured, ...others];

  const toggle = useCallback(
    (iso3: string) => {
      if (selected.includes(iso3)) {
        onChange(selected.filter((s) => s !== iso3));
      } else if (selected.length < maxSelections) {
        onChange([...selected, iso3]);
      }
    },
    [selected, onChange, maxSelections]
  );

  const selectedCountries = selected
    .map((iso3) => countriesWithData.find((c) => c.iso3 === iso3) ?? COUNTRIES.find((c) => c.iso3 === iso3))
    .filter(Boolean) as CountrySeed[];

  const hasData = (c: CountryWithData) => {
    if (!c.dataCounts) return false;
    if (pillar === "services") return c.dataCounts.services > 0;
    if (pillar === "products") return c.dataCounts.products > 0 || c.dataCounts.segments > 0;
    return false;
  };

  const isInline = variant === "inline";

  return (
    <div className="relative">
      <div className={`flex items-center gap-1.5 ${isInline ? "" : "flex-wrap gap-2"}`}>
        {isInline && (
          <div className="flex items-center gap-1 mr-1 shrink-0">
            <CountryFlag code="ARE" size="sm" />
            <span className="text-[10px] font-semibold text-cream uppercase tracking-wide">GPSSA</span>
            <span className="text-[10px] text-gray-muted mx-0.5">vs</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 transition-all ${
            isInline
              ? "px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-gray-muted hover:text-cream hover:border-white/15"
              : "px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-cream hover:bg-white/8 hover:border-white/20"
          }`}
        >
          <Globe2 size={isInline ? 11 : 14} className="text-gpssa-green" />
          <span>{isInline ? "Add" : "Compare with"}</span>
          <ChevronDown
            size={isInline ? 10 : 12}
            className={`text-gray-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence mode="popLayout">
          {selectedCountries.map((c) => (
            <motion.button
              key={c.iso3}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={() => toggle(c.iso3)}
              className={`inline-flex items-center gap-1 transition-colors ${
                isInline
                  ? "px-1.5 py-0.5 rounded-md bg-gpssa-green/8 border border-gpssa-green/15 text-[10px] text-cream hover:bg-gpssa-green/15"
                  : "px-2.5 py-1.5 rounded-lg bg-gpssa-green/10 border border-gpssa-green/20 text-xs text-cream hover:bg-gpssa-green/20"
              }`}
            >
              <CountryFlag code={c.iso3} size={isInline ? "xs" : "sm"} />
              <span>{isInline ? c.iso3 : c.name}</span>
              <X size={isInline ? 8 : 10} className="text-gray-muted ml-0.5" />
            </motion.button>
          ))}
        </AnimatePresence>

        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className={`uppercase tracking-wide text-gray-muted hover:text-cream transition-colors ${
              isInline ? "text-[8px] px-1" : "text-[10px] px-2 py-1"
            }`}
          >
            Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 mt-2 w-full max-w-lg rounded-xl bg-[#0f1a2e] border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="p-3 border-b border-white/5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search countries..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:border-gpssa-green/30"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-gray-muted mt-2">
                {selected.length}/{maxSelections} selected
                {selected.length >= maxSelections && " (maximum reached)"}
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 space-y-0.5">
              {displayList.map((country) => {
                const isSelected = selected.includes(country.iso3);
                const countryHasData = hasData(country);
                return (
                  <button
                    key={country.iso3}
                    onClick={() => toggle(country.iso3)}
                    disabled={!isSelected && selected.length >= maxSelections}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                      isSelected
                        ? "bg-gpssa-green/15 border border-gpssa-green/25 text-cream"
                        : "hover:bg-white/5 text-gray-muted hover:text-cream border border-transparent"
                    } ${!isSelected && selected.length >= maxSelections ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    <CountryFlag code={country.iso3} size="sm" />
                    <span className="flex-1 truncate">{country.name}</span>
                    {countryHasData && (
                      <Database size={10} className="text-gpssa-green shrink-0" />
                    )}
                    <span className="text-[10px] text-gray-muted shrink-0">{country.region}</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-gpssa-green/30 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gpssa-green" />
                      </div>
                    )}
                  </button>
                );
              })}
              {displayList.length === 0 && (
                <p className="text-xs text-gray-muted text-center py-4">No countries match your search</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
