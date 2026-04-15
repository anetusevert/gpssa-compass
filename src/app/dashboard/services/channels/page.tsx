"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Radio,
  Smartphone,
  Building2,
  Headphones,
  Link2,
  Code2,
  Gauge,
  Layers,
  Globe2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { ComparisonBanner } from "@/components/comparison/ComparisonBanner";
import { COUNTRIES } from "@/lib/countries/catalog";
import { CountryFlag } from "@/components/ui/CountryFlag";

const CHANNELS = [
  { id: "portal", label: "Digital Portal", short: "Portal", icon: LayoutGrid },
  { id: "mobile", label: "Mobile App", short: "App", icon: Smartphone },
  { id: "centers", label: "Service Centers", short: "Centers", icon: Building2 },
  { id: "call", label: "Call Center", short: "Call", icon: Headphones },
  { id: "partner", label: "Partner Channels", short: "Partner", icon: Link2 },
  { id: "api", label: "API / Integration", short: "API", icon: Code2 },
] as const;

const CATEGORIES = ["Employer", "Insured", "Beneficiary", "Agent/Guardian", "GCC", "Military", "General"] as const;
type Category = (typeof CATEGORIES)[number];
type ChannelId = (typeof CHANNELS)[number]["id"];
type Capability = "Full" | "Partial" | "Planned" | "None";

interface ServiceChannelRow {
  id: string;
  name: string;
  category: Category;
  channels: Record<ChannelId, Capability>;
}

interface IntlChannelRow {
  countryIso3: string;
  countryName: string;
  flag: string;
  id: string;
  name: string;
  category: string;
  channels: Record<ChannelId, Capability>;
}

const PORTFOLIO_TOTAL = 31;

const STATIC_SERVICE_MATRIX: ServiceChannelRow[] = [
  { id: "s-01", name: "Registration of an Insured", category: "Employer", channels: { portal: "Full", mobile: "Partial", centers: "Full", call: "Partial", partner: "Planned", api: "Planned" } },
  { id: "s-02", name: "Employers Registration", category: "Employer", channels: { portal: "Full", mobile: "Partial", centers: "Full", call: "Full", partner: "None", api: "Partial" } },
  { id: "s-10", name: "Merge Service Period — Civil", category: "Insured", channels: { portal: "Partial", mobile: "None", centers: "Full", call: "Partial", partner: "None", api: "Planned" } },
  { id: "s-11", name: "Purchase of Service Years", category: "Insured", channels: { portal: "Partial", mobile: "Planned", centers: "Full", call: "Partial", partner: "None", api: "None" } },
  { id: "s-13", name: "Pension Advisory Service", category: "Insured", channels: { portal: "Partial", mobile: "Partial", centers: "Full", call: "Full", partner: "None", api: "None" } },
  { id: "s-17", name: "Beneficiary Registration", category: "Beneficiary", channels: { portal: "Planned", mobile: "None", centers: "Full", call: "Partial", partner: "None", api: "Planned" } },
  { id: "s-19", name: "Report a Death", category: "Beneficiary", channels: { portal: "Partial", mobile: "Planned", centers: "Full", call: "Full", partner: "Partial", api: "Planned" } },
  { id: "s-20", name: "Agent Enrollment", category: "Agent/Guardian", channels: { portal: "Partial", mobile: "None", centers: "Full", call: "Partial", partner: "None", api: "None" } },
  { id: "s-23", name: "Registration of GCC Nationals", category: "GCC", channels: { portal: "Partial", mobile: "Partial", centers: "Full", call: "Partial", partner: "Partial", api: "Planned" } },
  { id: "s-25", name: "End of Service — GCC Nationals", category: "GCC", channels: { portal: "Partial", mobile: "None", centers: "Full", call: "Full", partner: "Partial", api: "Planned" } },
  { id: "s-27", name: "End of Service — Military", category: "Military", channels: { portal: "None", mobile: "None", centers: "Full", call: "Partial", partner: "None", api: "None" } },
  { id: "s-28", name: "Merge Service Period — Military", category: "Military", channels: { portal: "None", mobile: "None", centers: "Full", call: "Partial", partner: "None", api: "Planned" } },
  { id: "s-29", name: "Generate Certificates", category: "General", channels: { portal: "Full", mobile: "Full", centers: "Partial", call: "Partial", partner: "None", api: "Partial" } },
  { id: "s-30", name: "Submit Complaint", category: "General", channels: { portal: "Partial", mobile: "Partial", centers: "Full", call: "Full", partner: "None", api: "Planned" } },
  { id: "s-31", name: "Submit Inquiry / Suggestion", category: "General", channels: { portal: "Full", mobile: "Partial", centers: "Partial", call: "Full", partner: "None", api: "None" } },
];

const capabilityScore: Record<Capability, number> = { Full: 4, Partial: 2, Planned: 1, None: 0 };

function capabilityVariant(level: Capability): "green" | "gold" | "blue" | "gray" {
  switch (level) { case "Full": return "green"; case "Partial": return "gold"; case "Planned": return "blue"; default: return "gray"; }
}

function CapabilityCell({ level }: { level: Capability }) {
  return <Badge variant={capabilityVariant(level)} size="sm" className="tabular-nums">{level}</Badge>;
}

function computeMaturity(rows: ServiceChannelRow[] | IntlChannelRow[]) {
  return CHANNELS.map((ch) => {
    if (rows.length === 0) return { ...ch, score: 0, maturityTier: "—" as const };
    const sum = rows.reduce((acc, r) => acc + capabilityScore[r.channels[ch.id] ?? "None"], 0);
    const max = rows.length * 4;
    const pct = Math.round((sum / max) * 100);
    let maturityTier: "Mature" | "Progressing" | "Foundational" | "Emerging" = "Emerging";
    if (pct >= 75) maturityTier = "Mature";
    else if (pct >= 50) maturityTier = "Progressing";
    else if (pct >= 30) maturityTier = "Foundational";
    return { ...ch, score: pct, maturityTier };
  });
}

export default function ChannelCapabilitiesPage() {
  const [serviceMatrix, setServiceMatrix] = useState<ServiceChannelRow[]>(STATIC_SERVICE_MATRIX);
  const [category, setCategory] = useState<string>("All");
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);
  const [intlServices, setIntlServices] = useState<IntlChannelRow[]>([]);

  useEffect(() => {
    fetch("/api/services/channels")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const rowMap = new Map<string, ServiceChannelRow>();
        for (const item of data) {
          const svc = item.service;
          if (!svc) continue;
          const serviceId = String(svc.id);
          if (!rowMap.has(serviceId)) {
            rowMap.set(serviceId, { id: serviceId, name: String(svc.name ?? ""), category: String(svc.category ?? "General") as Category, channels: { portal: "None", mobile: "None", centers: "None", call: "None", partner: "None", api: "None" } });
          }
          const row = rowMap.get(serviceId)!;
          const chName = String(item.channelName ?? "") as ChannelId;
          if (chName in row.channels) row.channels[chName] = String(item.capabilityLevel ?? "None") as Capability;
        }
        if (rowMap.size > 0) setServiceMatrix(Array.from(rowMap.values()));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (comparisonCountries.length === 0) { setIntlServices([]); return; }
    const params = new URLSearchParams({ countries: comparisonCountries.join(",") });
    fetch(`/api/international/services?${params}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const rows: IntlChannelRow[] = data
          .filter((s) => s.channelCapabilities)
          .map((s) => {
            const channels: Record<ChannelId, Capability> = { portal: "None", mobile: "None", centers: "None", call: "None", partner: "None", api: "None" };
            try {
              const parsed = typeof s.channelCapabilities === "string" ? JSON.parse(s.channelCapabilities) : s.channelCapabilities;
              for (const [k, v] of Object.entries(parsed)) {
                if (k in channels) channels[k as ChannelId] = (v as Capability) ?? "None";
              }
            } catch { /* keep defaults */ }
            const country = COUNTRIES.find((c) => c.iso3 === s.countryIso3);
            return { countryIso3: s.countryIso3, countryName: country?.name ?? s.countryIso3, flag: s.countryIso3, id: s.id, name: s.name, category: s.category, channels };
          });
        setIntlServices(rows);
      })
      .catch(() => setIntlServices([]));
  }, [comparisonCountries]);

  const filtered = useMemo(() => {
    if (category === "All") return serviceMatrix;
    return serviceMatrix.filter((r) => r.category === category);
  }, [category, serviceMatrix]);

  const stats = useMemo(() => {
    const rows = serviceMatrix;
    const fullyDigital = rows.filter((r) => r.channels.portal === "Full" && r.channels.mobile === "Full").length;
    const highTouch = rows.filter((r) => r.channels.centers === "Full" || r.channels.call === "Full").length;
    const withApi = rows.filter((r) => r.channels.api === "Full" || r.channels.api === "Partial").length;
    return { portfolioTotal: PORTFOLIO_TOTAL, sampleRows: rows.length, channelCount: CHANNELS.length, fullyDigital, omniStrong: highTouch, apiSurface: withApi };
  }, [serviceMatrix]);

  const gpssaMaturity = useMemo(() => computeMaturity(filtered), [filtered]);

  const intlByCountry = useMemo(() => {
    const map = new Map<string, IntlChannelRow[]>();
    for (const s of intlServices) {
      const list = map.get(s.countryIso3) ?? [];
      list.push(s);
      map.set(s.countryIso3, list);
    }
    return map;
  }, [intlServices]);

  const grouped = useMemo(() => {
    const map = new Map<Category, ServiceChannelRow[]>();
    for (const cat of CATEGORIES) map.set(cat, []);
    for (const row of filtered) map.get(row.category)!.push(row);
    return CATEGORIES.map((c) => ({ category: c, rows: map.get(c)! })).filter((g) => g.rows.length > 0);
  }, [filtered]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Channel Capabilities"
        badge={{ label: "Knowledge base", variant: "blue" }}
        description="Cross-channel view of how services are delivered—digital, assisted, and partner-led—with global comparison."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Services in portfolio" value={stats.portfolioTotal} trend="neutral" change="RFI baseline" />
        <StatCard icon={Radio} label="Channels in framework" value={stats.channelCount} trend="neutral" />
        <StatCard icon={Smartphone} label="Full digital (portal + app)" value={stats.fullyDigital} trend="up" change={`${stats.sampleRows} mapped`} />
        <StatCard icon={Gauge} label="Strong assisted (center/call)" value={stats.omniStrong} trend="neutral" />
      </div>

      <CountrySelector selected={comparisonCountries} onChange={setComparisonCountries} pillar="services" />

      <AnimatePresence>
        {comparisonCountries.length > 0 && <ComparisonBanner selectedCountries={comparisonCountries} />}
      </AnimatePresence>

      <div className="flex flex-wrap gap-1.5">
        {["All", ...CATEGORIES].map((cat) => (
          <button key={cat} type="button" onClick={() => setCategory(cat)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${category === cat ? "bg-gpssa-green/20 text-gpssa-green border-gpssa-green/30" : "text-gray-muted hover:text-cream hover:bg-white/5 border-transparent"}`}
          >{cat}</button>
        ))}
      </div>

      {/* GPSSA Matrix */}
      <Card variant="glass" padding="md" className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-playfair text-lg font-semibold text-cream flex items-center gap-2">🇦🇪 GPSSA Delivery Matrix</h2>
            <p className="text-xs text-gray-muted mt-0.5">Capability levels per channel for each service in view.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide text-gray-muted">
            {(["Full", "Partial", "Planned", "None"] as Capability[]).map((level) => (
              <Badge key={level} variant={capabilityVariant(level)} size="sm">{level}</Badge>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full min-w-[920px] text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-playfair text-xs font-semibold text-cream w-[220px]">Service</th>
                {CHANNELS.map((ch) => { const Icon = ch.icon; return (
                  <th key={ch.id} className="text-center py-3 px-1 font-normal text-[11px] text-gray-muted uppercase tracking-wide">
                    <div className="flex flex-col items-center gap-1"><Icon size={14} className="text-teal-400/90" /><span className="hidden xl:inline">{ch.label}</span><span className="xl:hidden">{ch.short}</span></div>
                  </th>
                ); })}
              </tr>
            </thead>
            <tbody>
              {grouped.map(({ category: cat, rows }) => (
                <>{/* eslint-disable-next-line react/jsx-key */}
                  <tr className="bg-white/[0.03]"><td colSpan={CHANNELS.length + 1} className="py-2 px-2 text-xs font-playfair font-semibold text-teal-400/90 tracking-wide">{cat}</td></tr>
                  {rows.map((row) => (
                    <motion.tr key={row.id} layout className="border-b border-border/60 hover:bg-white/[0.02]">
                      <td className="py-3 pr-4 align-middle"><p className="text-cream text-xs font-medium leading-snug">{row.name}</p></td>
                      {CHANNELS.map((ch) => (<td key={ch.id} className="py-2 px-1 text-center align-middle"><div className="flex justify-center"><CapabilityCell level={row.channels[ch.id]} /></div></td>))}
                    </motion.tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* International matrices */}
      {Array.from(intlByCountry.entries()).map(([iso3, rows]) => {
        const country = COUNTRIES.find((c) => c.iso3 === iso3);
        return (
          <Card key={iso3} variant="glass" padding="md" className="overflow-hidden">
            <div className="mb-4">
              <h2 className="font-playfair text-lg font-semibold text-cream flex items-center gap-2">
                <CountryFlag code={iso3} size="md" /> {country?.name} Channel Matrix
              </h2>
              <p className="text-xs text-gray-muted mt-0.5">{rows.length} services with channel data</p>
            </div>
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full min-w-[920px] text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 font-playfair text-xs font-semibold text-cream w-[220px]">Service</th>
                    {CHANNELS.map((ch) => { const Icon = ch.icon; return (
                      <th key={ch.id} className="text-center py-3 px-1 font-normal text-[11px] text-gray-muted uppercase tracking-wide">
                        <div className="flex flex-col items-center gap-1"><Icon size={14} className="text-gpssa-green/80" /><span>{ch.short}</span></div>
                      </th>
                    ); })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 hover:bg-white/[0.02]">
                      <td className="py-3 pr-4 align-middle"><p className="text-cream text-xs font-medium">{row.name}</p><span className="text-[10px] text-gray-muted">{row.category}</span></td>
                      {CHANNELS.map((ch) => (<td key={ch.id} className="py-2 px-1 text-center align-middle"><div className="flex justify-center"><CapabilityCell level={row.channels[ch.id]} /></div></td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}

      {comparisonCountries.length > 0 && intlServices.length === 0 && (
        <div className="glass-card rounded-xl p-8 text-center">
          <Globe2 size={32} className="mx-auto text-gray-muted mb-3" />
          <p className="text-sm text-cream mb-1">No international channel data available yet</p>
          <p className="text-xs text-gray-muted">Run the International Services/Channels Research Agent to populate comparison data.</p>
        </div>
      )}

      {/* Maturity comparison */}
      <div>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-1">Channel Maturity Comparison</h2>
        <p className="text-xs text-gray-muted mb-4 max-w-2xl">
          Normalized maturity for each channel. {comparisonCountries.length > 0 ? "Bars show GPSSA vs. comparison countries." : "Based on the filtered service set."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {gpssaMaturity.map((ch) => {
            const Icon = ch.icon;
            const intlMaturityForChannel = comparisonCountries.map((iso3) => {
              const rows = intlByCountry.get(iso3) ?? [];
              if (rows.length === 0) return null;
              const mat = computeMaturity(rows).find((m) => m.id === ch.id);
              const country = COUNTRIES.find((c) => c.iso3 === iso3);
              return mat ? { iso3, flag: iso3, name: country?.name ?? iso3, score: mat.score, tier: mat.maturityTier } : null;
            }).filter(Boolean) as { iso3: string; flag: string; name: string; score: number; tier: string }[];

            return (
              <Card key={ch.id} variant="glass" padding="md" hover>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-white/5"><Icon size={18} className="text-teal-400" /></div>
                  <Badge variant="blue" size="sm" dot>{ch.maturityTier}</Badge>
                </div>
                <p className="font-playfair text-sm text-cream mb-3">{ch.label}</p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-muted w-16 shrink-0 flex items-center gap-1"><CountryFlag code="ARE" size="xs" /> GPSSA</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gradient-to-r from-adl-blue to-gpssa-green" initial={{ width: 0 }} animate={{ width: `${ch.score}%` }} transition={{ duration: 0.6 }} />
                    </div>
                    <span className="text-xs font-bold text-cream w-8 text-right">{ch.score}%</span>
                  </div>
                  {intlMaturityForChannel.map((intl) => (
                    <div key={intl.iso3} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-muted w-16 shrink-0 truncate flex items-center gap-1"><CountryFlag code={intl.iso3} size="xs" /> {intl.name.split(" ")[0]}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gpssa-green/60" initial={{ width: 0 }} animate={{ width: `${intl.score}%` }} transition={{ duration: 0.6, delay: 0.1 }} />
                      </div>
                      <span className="text-xs text-cream/70 w-8 text-right">{intl.score}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
