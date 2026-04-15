"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Building2,
  Layers,
  Package,
  BookOpen,
  ArrowRight,
  Download,
  Upload,
  Database,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DataCounts {
  services: number;
  institutions: number;
  products: number;
  sources: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

const TILES = [
  {
    id: "institutions",
    label: "Institutions",
    description: "Pension institutions, social security organizations, and government bodies across all tracked countries.",
    icon: Building2,
    href: "/dashboard/data/institutions",
    color: "#00A86B",
    countKey: "institutions" as const,
  },
  {
    id: "services",
    label: "Services",
    description: "GPSSA service catalog and international service benchmarks with channel capabilities.",
    icon: Layers,
    href: "/dashboard/data/services",
    color: "#2D4A8C",
    countKey: "services" as const,
  },
  {
    id: "products",
    label: "Products",
    description: "Product portfolio across tiers, coverage types, and international product comparisons.",
    icon: Package,
    href: "/dashboard/data/products",
    color: "#C5A572",
    countKey: "products" as const,
  },
  {
    id: "sources",
    label: "Sources",
    description: "Data sources, research references, and citation linkages backing all research data.",
    icon: BookOpen,
    href: "/dashboard/data/sources",
    color: "#2DD4BF",
    countKey: "sources" as const,
  },
];

export default function DataHubPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const [counts, setCounts] = useState<DataCounts>({ services: 0, institutions: 0, products: 0, sources: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [svcRes, instRes, prodRes, srcRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/research/institutions"),
          fetch("/api/products"),
          fetch("/api/admin/data/sources"),
        ]);
        setCounts({
          services: svcRes.ok ? (await svcRes.json()).length : 0,
          institutions: instRes.ok ? (await instRes.json()).length : 0,
          products: prodRes.ok ? (await prodRes.json()).length : 0,
          sources: srcRes.ok ? (await srcRes.json()).length : 0,
        });
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/admin/data/export");
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `gpssa-data-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ } finally {
      setExporting(false);
    }
  }

  const totalRecords = counts.services + counts.institutions + counts.products + counts.sources;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader
          title="Data & Sources"
          description="Explore all data powering the GPSSA Intelligence platform — institutions, services, products, and their source references."
        />
        {isAdmin && (
          <div className="flex items-center gap-2 shrink-0">
            <Button onClick={handleExport} loading={exporting} variant="secondary" size="sm">
              <Download size={14} /> Export All
            </Button>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="rounded-xl border border-white/[0.06] p-4 flex items-center gap-6 flex-wrap"
        style={{ background: "rgba(10,22,40,0.5)" }}
      >
        <div className="flex items-center gap-2">
          <Database size={14} className="text-adl-blue" />
          <span className="text-xs text-gray-muted">Total Records</span>
          <span className="font-playfair text-lg font-bold text-cream">{loading ? "..." : totalRecords}</span>
        </div>
        <div className="h-5 w-px bg-white/10" />
        {TILES.map((tile) => (
          <div key={tile.id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tile.color }} />
            <span className="text-[11px] text-gray-muted">{tile.label}</span>
            <span className="text-xs font-semibold text-cream">{loading ? "..." : counts[tile.countKey]}</span>
          </div>
        ))}
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {TILES.map((tile, i) => {
            const Icon = tile.icon;
            const count = counts[tile.countKey];
            return (
              <motion.button
                key={tile.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: i * 0.08 }}
                onClick={() => router.push(tile.href)}
                className="group relative rounded-2xl border border-white/[0.06] p-6 text-left transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.02]"
                style={{ background: "linear-gradient(135deg, rgba(10,22,40,0.6), rgba(10,22,40,0.3))" }}
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: `radial-gradient(ellipse at top left, ${tile.color}08, transparent 60%)` }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl" style={{ background: `${tile.color}14` }}>
                      <Icon size={22} style={{ color: tile.color }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-playfair text-2xl font-bold text-cream">{count}</span>
                      <span className="text-xs text-gray-muted">records</span>
                    </div>
                  </div>

                  <h3 className="font-playfair text-lg font-semibold text-cream mb-1">{tile.label}</h3>
                  <p className="text-xs text-gray-muted leading-relaxed mb-4">{tile.description}</p>

                  <div className="flex items-center gap-1.5 text-xs font-medium transition-colors" style={{ color: tile.color }}>
                    <span>Browse all {tile.label.toLowerCase()}</span>
                    <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
