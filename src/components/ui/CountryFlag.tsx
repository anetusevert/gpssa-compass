"use client";

import { iso3ToIso2 } from "@/lib/countries/country-data";

interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 (e.g. "ae") or alpha-3 (e.g. "ARE") code */
  code: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  square?: boolean;
}

const SIZE_MAP: Record<string, string> = {
  xs: "text-[0.75rem] leading-none",
  sm: "text-[1rem] leading-none",
  md: "text-[1.25rem] leading-none",
  lg: "text-[1.75rem] leading-none",
  xl: "text-[2.25rem] leading-none",
};

export function CountryFlag({ code, size = "md", className = "", square = false }: CountryFlagProps) {
  const iso2 = code.length === 3 ? iso3ToIso2(code) : code.toLowerCase();
  if (!iso2) return null;

  return (
    <span
      className={`fi fi-${iso2} ${square ? "fis" : ""} ${SIZE_MAP[size] ?? SIZE_MAP.md} inline-block shrink-0 ${className}`}
    />
  );
}
