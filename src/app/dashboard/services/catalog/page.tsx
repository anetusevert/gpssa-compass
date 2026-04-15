"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Layers,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  FolderOpen,
  Users,
  CheckCircle2,
  Briefcase,
  Shield,
  UserCheck,
  Globe2,
  Sword,
  FileText,
  Scale,
  ArrowLeftRight,
  ChevronRight,
  BarChart3,
  PieChart,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { StatBar, type StatBarItem } from "@/components/ui/StatBar";
import { COUNTRIES } from "@/lib/countries/catalog";
import { CountryFlag } from "@/components/ui/CountryFlag";

/* ───── Types ───── */
interface GPSSAService {
  id: string;
  name: string;
  category: string;
  description: string | null;
  userTypes: string[] | null;
  currentState: string | null;
  painPoints: string[] | null;
  opportunities: string[] | null;
}

interface IntlService {
  id: string;
  countryIso3: string;
  name: string;
  category: string;
  description: string | null;
  userTypes: string | null;
  digitalReadiness: number | null;
  maturityLevel: string | null;
  strengths: string | null;
  painPoints: string | null;
  iloAlignment: string | null;
  channelCapabilities: string | null;
  institution: { id: string; name: string; shortName: string | null; country: string } | null;
}

/* ───── Constants ───── */
const CATEGORIES = [
  "Employer", "Insured", "Beneficiary", "Agent/Guardian", "GCC", "Military", "General",
] as const;
type Category = (typeof CATEGORIES)[number];

const categoryConfig: Record<Category, { icon: typeof Layers; color: "green" | "blue" | "gold" | "gray" | "red" }> = {
  Employer: { icon: Briefcase, color: "blue" },
  Insured: { icon: Shield, color: "green" },
  Beneficiary: { icon: UserCheck, color: "gold" },
  "Agent/Guardian": { icon: Users, color: "gray" },
  GCC: { icon: Globe2, color: "blue" },
  Military: { icon: Sword, color: "red" },
  General: { icon: FileText, color: "green" },
};

const CAT_DOT: Record<string, string> = {
  Employer: "bg-adl-blue",
  Insured: "bg-gpssa-green",
  Beneficiary: "bg-gold",
  "Agent/Guardian": "bg-gray-muted",
  GCC: "bg-adl-blue",
  Military: "bg-red-400",
  General: "bg-gpssa-green",
};

const STATIC_SERVICES: GPSSAService[] = [
  { id: "s-01", name: "Registration of an Insured", category: "Employer", description: "Register new insured individuals under an employer's account with GPSSA.", userTypes: ["Employer", "HR"], currentState: "Semi-digital process with paper-based document submission.", painPoints: ["Manual document verification", "Long processing times", "Duplicate entry risks"], opportunities: ["Digital onboarding portal", "AI document verification", "Real-time validation"] },
  { id: "s-02", name: "Employers Registration", category: "Employer", description: "Register new employers with GPSSA for pension and social security contributions.", userTypes: ["Employer"], currentState: "Partially online with in-person verification required.", painPoints: ["Complex registration forms", "Multiple visits required", "Inconsistent processing"], opportunities: ["End-to-end digital registration", "eKYC integration", "Automated compliance checks"] },
  { id: "s-03", name: "Apply for End Of Service - Civil", category: "Employer", description: "Process end-of-service benefits for civil sector employees.", userTypes: ["Employer", "HR"], currentState: "Manual calculation with multi-step approval workflow.", painPoints: ["Complex benefit calculations", "Delayed payments", "Paper-heavy process"], opportunities: ["Automated benefit calculator", "Digital approval workflow", "Direct bank transfers"] },
  { id: "s-04", name: "Benefit Exchange - Inward", category: "Employer", description: "Handle incoming benefit transfers from other pension authorities.", userTypes: ["Employer", "Insured"], currentState: "Manual inter-authority coordination.", painPoints: ["Slow inter-authority communication", "Data reconciliation issues", "Lack of transparency"], opportunities: ["API integration with GCC authorities", "Blockchain-based verification", "Real-time tracking"] },
  { id: "s-05", name: "Benefit Exchange - Outward", category: "Employer", description: "Process outgoing benefit transfers to other pension authorities.", userTypes: ["Employer", "Insured"], currentState: "Paper-based with manual tracking.", painPoints: ["Long transfer timelines", "Documentation overhead", "Status uncertainty"], opportunities: ["Digital transfer protocols", "Automated documentation", "Cross-border digital identity"] },
  { id: "s-06", name: "Service Awareness Request", category: "Employer", description: "Handle employer requests for information about GPSSA services and obligations.", userTypes: ["Employer", "HR"], currentState: "Call center and email-based inquiries.", painPoints: ["High call volumes", "Inconsistent information", "No self-service"], opportunities: ["AI chatbot", "Knowledge base portal", "Personalized employer dashboards"] },
  { id: "s-07", name: "Work Fitness Assessment", category: "Employer", description: "Assess work fitness for insured individuals returning from medical leave.", userTypes: ["Employer", "Medical"], currentState: "Manual assessment with physical report submission.", painPoints: ["Scheduling delays", "Paper medical reports", "Subjective assessments"], opportunities: ["Digital health record integration", "Telemedicine options", "Standardized assessment tools"] },
  { id: "s-08", name: "Employer DeRegistration", category: "Employer", description: "Process the deregistration of employers from GPSSA.", userTypes: ["Employer"], currentState: "Multi-step manual process requiring clearance.", painPoints: ["Complex clearance requirements", "Outstanding balance issues", "Long processing time"], opportunities: ["Digital clearance workflow", "Automated balance reconciliation", "Exit process automation"] },
  { id: "s-09", name: "Workplace Injury Compensation", category: "Employer", description: "Process compensation claims for workplace injuries.", userTypes: ["Employer", "Insured"], currentState: "Paper-based claims with manual medical review.", painPoints: ["Slow claims processing", "Fragmented medical records", "Dispute resolution delays"], opportunities: ["Digital claims portal", "Integrated medical records", "AI-assisted assessment"] },
  { id: "s-10", name: "Merge Service Period - Civil", category: "Insured", description: "Merge service periods from multiple employers for civil sector workers.", userTypes: ["Insured"], currentState: "Complex manual process requiring documentation from multiple employers.", painPoints: ["Multiple employer coordination", "Document gathering burden", "Calculation complexity"], opportunities: ["Automated service period reconciliation", "Digital employer verification", "Self-service portal"] },
  { id: "s-11", name: "Purchase of Service Years", category: "Insured", description: "Allow insured individuals to purchase additional service years for pension benefits.", userTypes: ["Insured"], currentState: "In-person application with manual actuarial calculations.", painPoints: ["Complex cost calculations", "Limited payment options", "Lengthy approval process"], opportunities: ["Online purchase portal", "Instant cost calculator", "Flexible payment plans"] },
  { id: "s-12", name: "Cancel Merge/Purchase Payments", category: "Insured", description: "Process cancellation of previously arranged merge or purchase payment plans.", userTypes: ["Insured"], currentState: "Manual cancellation requiring multiple approvals.", painPoints: ["Refund delays", "Complex reversal calculations", "Lack of self-service"], opportunities: ["Self-service cancellation", "Automated refund processing", "Real-time balance updates"] },
  { id: "s-13", name: "Pension Advisory Service", category: "Insured", description: "Provide personalized pension planning advice to insured individuals.", userTypes: ["Insured"], currentState: "Limited in-person advisory with long wait times.", painPoints: ["Limited advisor availability", "Generic advice", "No digital tools"], opportunities: ["AI-powered pension simulator", "Digital advisory platform", "Personalized recommendations"] },
  { id: "s-14", name: "Update Payment Schedule", category: "Insured", description: "Modify existing payment schedules for service purchases or contributions.", userTypes: ["Insured"], currentState: "Requires in-person visit for schedule changes.", painPoints: ["No online modification", "Rigid schedule options", "Processing delays"], opportunities: ["Self-service schedule management", "Flexible payment options", "Automated reminders"] },
  { id: "s-15", name: "Change Payment Method", category: "Insured", description: "Allow insured individuals to change their payment method for contributions.", userTypes: ["Insured"], currentState: "Paper form submission with bank verification.", painPoints: ["Manual bank verification", "Form processing delays", "Limited payment methods"], opportunities: ["Digital payment integration", "Multiple payment gateways", "Instant verification"] },
  { id: "s-16", name: "Shourak Payment", category: "Insured", description: "Process Shourak (voluntary contribution) payments for pension enhancement.", userTypes: ["Insured"], currentState: "Semi-digital with manual reconciliation.", painPoints: ["Limited awareness", "Manual tracking", "Reconciliation errors"], opportunities: ["Integrated digital payments", "Automated reconciliation", "Contribution tracking dashboard"] },
  { id: "s-17", name: "Beneficiary Registration", category: "Beneficiary", description: "Register beneficiaries to receive pension benefits from a deceased or retired insured person.", userTypes: ["Beneficiary", "Family"], currentState: "Paper-based registration with extensive documentation.", painPoints: ["Emotional process burden", "Extensive documentation", "Long verification times"], opportunities: ["Compassionate digital process", "Pre-registration options", "Simplified verification"] },
  { id: "s-18", name: "Pension Entitlement Update", category: "Beneficiary", description: "Update pension entitlement details for registered beneficiaries.", userTypes: ["Beneficiary"], currentState: "Manual update process requiring supporting documents.", painPoints: ["Repeated document submission", "Slow updates", "Unclear eligibility rules"], opportunities: ["Self-service updates", "Document reuse", "Clear eligibility calculator"] },
  { id: "s-19", name: "Report a Death", category: "Beneficiary", description: "Report the death of an insured person or beneficiary to initiate benefit transfers.", userTypes: ["Beneficiary", "Family"], currentState: "In-person reporting with death certificate submission.", painPoints: ["Sensitive timing", "Multiple office visits", "Delayed benefit activation"], opportunities: ["Digital reporting with gov integration", "Automated benefit activation", "Proactive family support"] },
  { id: "s-20", name: "Agent Enrollment", category: "Agent/Guardian", description: "Enroll authorized agents to act on behalf of insured individuals or employers.", userTypes: ["Agent"], currentState: "Paper-based authorization with notarization.", painPoints: ["Notarization requirements", "Limited agent portal", "Authorization verification delays"], opportunities: ["Digital power of attorney", "Agent self-service portal", "Real-time authorization"] },
  { id: "s-21", name: "Guardian Enrollment", category: "Agent/Guardian", description: "Enroll legal guardians to manage pension affairs for minors or incapacitated beneficiaries.", userTypes: ["Guardian", "Family"], currentState: "Court document-based enrollment.", painPoints: ["Court document processing", "Complex eligibility verification", "Limited digital access"], opportunities: ["Digital court integration", "Simplified guardian portal", "Automated eligibility checks"] },
  { id: "s-22", name: "Caretaker Enrollment", category: "Agent/Guardian", description: "Enroll caretakers for beneficiaries requiring assisted management.", userTypes: ["Caretaker", "Family"], currentState: "Manual enrollment with medical certification.", painPoints: ["Medical certification overhead", "Renewal complexity", "Lack of tracking"], opportunities: ["Digital medical integration", "Automated renewals", "Caretaker dashboard"] },
  { id: "s-23", name: "Registration of GCC Nationals", category: "GCC", description: "Register GCC nationals working in the UAE for pension benefits.", userTypes: ["Employer", "GCC National"], currentState: "Inter-country coordination with manual data exchange.", painPoints: ["Cross-border data exchange", "Inconsistent processes", "Long registration times"], opportunities: ["GCC-wide digital identity", "API-based data exchange", "Unified registration portal"] },
  { id: "s-24", name: "Registration of UAE Nationals in GCC", category: "GCC", description: "Register UAE nationals working in GCC countries for benefit coordination.", userTypes: ["UAE National", "Employer"], currentState: "Manual coordination with GCC pension authorities.", painPoints: ["Multiple authority coordination", "Documentation burden", "Status tracking difficulty"], opportunities: ["Bilateral digital agreements", "Automated status sync", "Cross-border portal"] },
  { id: "s-25", name: "End of Service of GCC Nationals", category: "GCC", description: "Process end-of-service benefits for GCC nationals in the UAE.", userTypes: ["GCC National", "Employer"], currentState: "Complex cross-border settlement process.", painPoints: ["Multi-currency settlements", "Lengthy processing", "Regulatory complexity"], opportunities: ["Automated settlement engine", "Real-time currency conversion", "Digital compliance checks"] },
  { id: "s-26", name: "End of Service for UAE Nationals in GCC", category: "GCC", description: "Process end-of-service benefits for UAE nationals working in GCC countries.", userTypes: ["UAE National"], currentState: "Manual benefit calculation with inter-country coordination.", painPoints: ["Benefit portability issues", "Calculation discrepancies", "Communication gaps"], opportunities: ["Portable benefit framework", "Unified calculation engine", "Digital liaison platform"] },
  { id: "s-27", name: "Apply for End Of Service - Military", category: "Military", description: "Process end-of-service benefits for military sector personnel.", userTypes: ["Military Personnel", "MOD"], currentState: "Classified process with specialized handling.", painPoints: ["Security clearance requirements", "Specialized calculations", "Limited transparency"], opportunities: ["Secure digital processing", "Role-based access controls", "Encrypted benefit calculations"] },
  { id: "s-28", name: "Merge Service Period - Military", category: "Military", description: "Merge military service periods with civil service for comprehensive benefit calculation.", userTypes: ["Military Personnel"], currentState: "Cross-sector manual coordination.", painPoints: ["Inter-sector data silos", "Complex eligibility rules", "Manual reconciliation"], opportunities: ["Cross-sector data integration", "Automated eligibility engine", "Unified service record"] },
  { id: "s-29", name: "Generate Certificates", category: "General", description: "Generate various certificates including service certificates, pension certificates, and salary certificates.", userTypes: ["Insured", "Employer", "Beneficiary"], currentState: "Semi-digital with manual approval steps.", painPoints: ["Approval bottlenecks", "Format inconsistencies", "No instant generation"], opportunities: ["Instant digital certificate generation", "QR code verification", "API for third-party verification"] },
  { id: "s-30", name: "Submit Complaint", category: "General", description: "Submit and track complaints about GPSSA services.", userTypes: ["Insured", "Employer", "Beneficiary"], currentState: "Multi-channel submission with manual routing.", painPoints: ["Inconsistent routing", "Slow resolution", "Poor tracking"], opportunities: ["AI-powered routing", "Sentiment analysis", "SLA tracking dashboard"] },
  { id: "s-31", name: "Submit Inquiry / Suggestion", category: "General", description: "Submit inquiries or suggestions for GPSSA service improvements.", userTypes: ["Insured", "Employer", "Beneficiary"], currentState: "Email and call-based with limited tracking.", painPoints: ["No structured tracking", "Feedback black hole", "Limited follow-up"], opportunities: ["Feedback management platform", "Idea voting system", "Automated acknowledgment"] },
];

/* ───── Helpers ───── */
function parseJsonField<T>(val: unknown): T | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val as T;
  if (typeof val === "string") {
    try { return JSON.parse(val) as T; } catch { return null; }
  }
  return val as T;
}

function getCategoryConfig(cat: string) {
  return categoryConfig[cat as Category] ?? { icon: Layers, color: "gray" as const };
}

/* ───── Page Component ───── */
export default function ServiceCatalogPage() {
  const [services, setServices] = useState<GPSSAService[]>([]);
  const [intlServices, setIntlServices] = useState<IntlService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState<GPSSAService | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data: Record<string, unknown>[] = await res.json();
          if (data.length > 0) {
            const enriched = STATIC_SERVICES.map((staticSvc) => {
              const apiMatch = data.find(
                (d) => d.id === staticSvc.id || (d.name as string)?.toLowerCase() === staticSvc.name.toLowerCase()
              );
              if (!apiMatch) return staticSvc;
              const parsed = {
                userTypes: parseJsonField<string[]>(apiMatch.userTypes),
                painPoints: parseJsonField<string[]>(apiMatch.painPoints),
                opportunities: parseJsonField<string[]>(apiMatch.opportunities),
              };
              return {
                ...staticSvc,
                painPoints: parsed.painPoints?.length ? parsed.painPoints : staticSvc.painPoints,
                opportunities: parsed.opportunities?.length ? parsed.opportunities : staticSvc.opportunities,
                userTypes: parsed.userTypes?.length ? parsed.userTypes : staticSvc.userTypes,
                description: (apiMatch.description as string) || staticSvc.description,
                currentState: (apiMatch.currentState as string) || staticSvc.currentState,
              };
            });
            setServices(enriched);
          } else {
            setServices(STATIC_SERVICES);
          }
        } else {
          setServices(STATIC_SERVICES);
        }
      } catch {
        setServices(STATIC_SERVICES);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (comparisonCountries.length === 0) { setIntlServices([]); return; }
    const params = new URLSearchParams({ countries: comparisonCountries.join(",") });
    fetch(`/api/international/services?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => { if (Array.isArray(data)) setIntlServices(data); })
      .catch(() => setIntlServices([]));
  }, [comparisonCountries]);

  const filtered = useMemo(() => {
    let list = services;
    if (activeCategory !== "All") list = list.filter((s) => s.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || (s.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [services, activeCategory, searchQuery]);

  const grouped = useMemo(() => {
    const map = new Map<string, GPSSAService[]>();
    for (const svc of filtered) {
      const list = map.get(svc.category) ?? [];
      list.push(svc);
      map.set(svc.category, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const stats = useMemo(() => {
    const cats = new Set(services.map((s) => s.category));
    const painTotal = services.reduce((acc, s) => acc + (s.painPoints?.length ?? 0), 0);
    const oppTotal = services.reduce((acc, s) => acc + (s.opportunities?.length ?? 0), 0);
    return { total: services.length, categories: cats.size, painPoints: painTotal, opportunities: oppTotal, intlCount: intlServices.length, countriesCompared: comparisonCountries.length };
  }, [services, intlServices.length, comparisonCountries.length]);

  const selectedService = useMemo(() =>
    selectedId ? services.find((s) => s.id === selectedId) ?? null : null
  , [selectedId, services]);

  const matchingIntl = useMemo(() => {
    if (!selectedService || intlServices.length === 0) return [];
    const name = selectedService.name.toLowerCase();
    const cat = selectedService.category.toLowerCase();
    return intlServices.filter((s) => {
      const n = s.name.toLowerCase();
      const firstWord = name.split(" ")[0];
      const intlFirst = n.split(" ")[0];
      return n.includes(firstWord) || name.includes(intlFirst) || s.category.toLowerCase() === cat;
    }).slice(0, 8);
  }, [selectedService, intlServices]);

  const catDistribution = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of services) map.set(s.category, (map.get(s.category) ?? 0) + 1);
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [services]);

  const handleSelectService = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const statBarItems: StatBarItem[] = useMemo(() => [
    {
      icon: Layers, value: stats.total, label: "Services",
      detail: (
        <div className="space-y-2">
          <p className="text-xs text-gray-muted mb-3">All GPSSA services by category</p>
          {catDistribution.map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${CAT_DOT[cat] ?? "bg-gray-muted"}`} />
              <span className="text-xs text-cream flex-1">{cat}</span>
              <span className="text-xs text-gray-muted tabular-nums">{count}</span>
            </div>
          ))}
        </div>
      ),
    },
    { icon: FolderOpen, value: stats.categories, label: "Categories" },
    {
      icon: AlertTriangle, value: stats.painPoints, label: "Pain Points",
      detail: (
        <div className="space-y-1">
          <p className="text-xs text-gray-muted mb-3">Top services by pain point count</p>
          {[...services].sort((a, b) => (b.painPoints?.length ?? 0) - (a.painPoints?.length ?? 0)).slice(0, 10).map((s) => (
            <div key={s.id} className="flex items-center gap-2 py-1">
              <span className="text-xs text-cream flex-1 truncate">{s.name}</span>
              <span className="text-xs text-red-400 tabular-nums">{s.painPoints?.length ?? 0}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: Lightbulb, value: stats.opportunities, label: "Opportunities",
      detail: (
        <div className="space-y-1">
          <p className="text-xs text-gray-muted mb-3">Top services by opportunity count</p>
          {[...services].sort((a, b) => (b.opportunities?.length ?? 0) - (a.opportunities?.length ?? 0)).slice(0, 10).map((s) => (
            <div key={s.id} className="flex items-center gap-2 py-1">
              <span className="text-xs text-cream flex-1 truncate">{s.name}</span>
              <span className="text-xs text-gpssa-green tabular-nums">{s.opportunities?.length ?? 0}</span>
            </div>
          ))}
        </div>
      ),
    },
    ...(stats.countriesCompared > 0
      ? [{ icon: Globe2, value: stats.intlCount, label: `Intl Services (${stats.countriesCompared} countries)` } as StatBarItem]
      : []),
  ], [stats, catDistribution, services]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ─── Header Row ─── */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">Service Catalog</h1>
        <div className="h-4 w-px bg-white/10" />
        <CountrySelector
          selected={comparisonCountries}
          onChange={setComparisonCountries}
          pillar="services"
          variant="inline"
        />
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-cream placeholder:text-gray-muted focus:outline-none focus:border-gpssa-green/30 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ─── Category Pills ─── */}
      <div className="shrink-0 flex items-center gap-1 px-5 py-2 border-b border-white/[0.04] overflow-x-auto scrollbar-none">
        {["All", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              activeCategory === cat
                ? "bg-gpssa-green/20 text-gpssa-green border border-gpssa-green/30"
                : "text-gray-muted hover:text-cream hover:bg-white/5 border border-transparent"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-gray-muted tabular-nums shrink-0">
          {filtered.length} of {services.length}
        </span>
      </div>

      {/* ─── Main Split Panel ─── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left panel: service list */}
        <div className="w-[62%] border-r border-white/[0.06] overflow-y-auto scrollbar-thin">
          {grouped.map(([cat, svcs]) => (
            <div key={cat}>
              <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-1.5 bg-navy/90 backdrop-blur-sm border-b border-white/[0.04]">
                <span className={`w-1.5 h-1.5 rounded-full ${CAT_DOT[cat] ?? "bg-gray-muted"}`} />
                <span className="text-[10px] font-semibold text-cream uppercase tracking-wider">{cat}</span>
                <span className="text-[10px] text-gray-muted">({svcs.length})</span>
              </div>
              {svcs.map((svc) => {
                const isActive = svc.id === selectedId;
                const painCount = svc.painPoints?.length ?? 0;
                const oppCount = svc.opportunities?.length ?? 0;
                return (
                  <button
                    key={svc.id}
                    onClick={() => handleSelectService(svc.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all border-b border-white/[0.03] group ${
                      isActive
                        ? "bg-gpssa-green/[0.07] border-l-2 border-l-gpssa-green"
                        : "hover:bg-white/[0.03] border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium leading-snug truncate ${isActive ? "text-cream" : "text-cream/80 group-hover:text-cream"}`}>
                        {svc.name}
                      </p>
                      {svc.description && (
                        <p className="text-[10px] text-gray-muted truncate mt-0.5">{svc.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {painCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-red-400">
                          <AlertTriangle size={9} />{painCount}
                        </span>
                      )}
                      {oppCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-gpssa-green">
                          <Lightbulb size={9} />{oppCount}
                        </span>
                      )}
                      <ChevronRight size={12} className={`transition-colors ${isActive ? "text-gpssa-green" : "text-gray-muted/40"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search size={24} className="text-gray-muted mb-2" />
              <p className="text-xs text-gray-muted">No services match your filters.</p>
            </div>
          )}
        </div>

        {/* Right panel: context / comparison */}
        <div className="w-[38%] overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {selectedService ? (
              <motion.div
                key={`detail-${selectedService.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-4 space-y-4"
              >
                {/* Selected service header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CountryFlag code="ARE" size="sm" />
                        <span className="text-[10px] text-gray-muted uppercase tracking-wide">GPSSA</span>
                      </div>
                      <h2 className="font-playfair text-sm font-semibold text-cream">{selectedService.name}</h2>
                    </div>
                    <Badge variant={getCategoryConfig(selectedService.category).color} size="sm">
                      {selectedService.category}
                    </Badge>
                  </div>
                  {selectedService.description && (
                    <p className="text-[11px] text-gray-muted mt-2 leading-relaxed">{selectedService.description}</p>
                  )}
                  <button
                    onClick={() => setDetailModal(selectedService)}
                    className="mt-2 text-[10px] text-gpssa-green hover:underline"
                  >
                    View full details →
                  </button>
                </div>

                {/* Pain points & opportunities summary */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-red-400/[0.06] border border-red-400/10 p-2.5">
                    <div className="flex items-center gap-1 mb-1.5">
                      <AlertTriangle size={10} className="text-red-400" />
                      <span className="text-[10px] font-medium text-red-400">Pain Points</span>
                    </div>
                    <p className="text-lg font-bold text-cream font-playfair">{selectedService.painPoints?.length ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-gpssa-green/[0.06] border border-gpssa-green/10 p-2.5">
                    <div className="flex items-center gap-1 mb-1.5">
                      <Lightbulb size={10} className="text-gpssa-green" />
                      <span className="text-[10px] font-medium text-gpssa-green">Opportunities</span>
                    </div>
                    <p className="text-lg font-bold text-cream font-playfair">{selectedService.opportunities?.length ?? 0}</p>
                  </div>
                </div>

                {/* International comparison */}
                {matchingIntl.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowLeftRight size={11} className="text-gpssa-green" />
                      <span className="text-[10px] font-semibold text-cream uppercase tracking-wider">International Comparison</span>
                    </div>
                    <div className="space-y-2">
                      {matchingIntl.map((intl) => {
                        const country = COUNTRIES.find((c) => c.iso3 === intl.countryIso3);
                        const strengths = parseJsonField<string[]>(intl.strengths) ?? [];
                        const gaps = parseJsonField<string[]>(intl.painPoints) ?? [];
                        return (
                          <div key={intl.id} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                            <div className="flex items-center gap-2 mb-1.5">
                              <CountryFlag code={intl.countryIso3} size="sm" />
                              <span className="text-[10px] text-gray-muted">{country?.name}</span>
                              {intl.maturityLevel && <Badge variant="blue" size="sm">{intl.maturityLevel}</Badge>}
                            </div>
                            <p className="text-xs font-medium text-cream mb-1">{intl.name}</p>
                            {intl.description && <p className="text-[10px] text-gray-muted line-clamp-2 mb-2">{intl.description}</p>}
                            <div className="flex items-center gap-3">
                              {intl.digitalReadiness != null && (
                                <div className="flex items-center gap-1">
                                  <Sparkles size={9} className="text-gpssa-green" />
                                  <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <motion.div
                                      className="h-full rounded-full bg-gpssa-green"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${intl.digitalReadiness}%` }}
                                      transition={{ duration: 0.5 }}
                                    />
                                  </div>
                                  <span className="text-[9px] text-gpssa-green tabular-nums">{intl.digitalReadiness}%</span>
                                </div>
                              )}
                              {intl.iloAlignment && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] text-gold">
                                  <Scale size={8} />ILO
                                </span>
                              )}
                            </div>
                            {(strengths.length > 0 || gaps.length > 0) && (
                              <div className="flex gap-3 mt-1.5 text-[9px] text-gray-muted">
                                {strengths.length > 0 && <span className="inline-flex items-center gap-0.5"><CheckCircle2 size={8} className="text-gpssa-green" />{strengths.length} strengths</span>}
                                {gaps.length > 0 && <span className="inline-flex items-center gap-0.5"><AlertTriangle size={8} className="text-red-400" />{gaps.length} gaps</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {comparisonCountries.length > 0 && matchingIntl.length === 0 && (
                  <div className="rounded-lg bg-white/[0.02] border border-white/[0.06] p-4 text-center">
                    <Globe2 size={20} className="mx-auto text-gray-muted mb-2" />
                    <p className="text-[10px] text-gray-muted">No comparable international data for this service yet.</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-5"
              >
                <div>
                  <h2 className="font-playfair text-sm font-semibold text-cream mb-1">Portfolio Overview</h2>
                  <p className="text-[10px] text-gray-muted">Select a service on the left to see detailed comparison</p>
                </div>

                {/* Category distribution */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <PieChart size={11} className="text-gpssa-green" />
                    <span className="text-[10px] font-semibold text-cream uppercase tracking-wider">By Category</span>
                  </div>
                  <div className="space-y-1.5">
                    {catDistribution.map(([cat, count]) => {
                      const pct = Math.round((count / services.length) * 100);
                      return (
                        <div key={cat} className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CAT_DOT[cat] ?? "bg-gray-muted"}`} />
                          <span className="text-[10px] text-cream w-24 truncate">{cat}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${CAT_DOT[cat]?.replace("bg-", "bg-") ?? "bg-gray-muted"}`}
                              style={{ opacity: 0.7 }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.6, delay: 0.1 }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-muted tabular-nums w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Comparison summary */}
                {comparisonCountries.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <BarChart3 size={11} className="text-gpssa-green" />
                      <span className="text-[10px] font-semibold text-cream uppercase tracking-wider">Comparison Countries</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {comparisonCountries.map((iso3) => {
                        const country = COUNTRIES.find((c) => c.iso3 === iso3);
                        const countryIntl = intlServices.filter((s) => s.countryIso3 === iso3);
                        return (
                          <div key={iso3} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
                            <div className="flex items-center gap-1.5 mb-1">
                              <CountryFlag code={iso3} size="sm" />
                              <span className="text-[10px] text-cream font-medium truncate">{country?.name}</span>
                            </div>
                            <p className="text-lg font-bold text-cream font-playfair">{countryIntl.length}</p>
                            <p className="text-[9px] text-gray-muted">services loaded</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {comparisonCountries.length === 0 && (
                  <div className="rounded-lg bg-white/[0.02] border border-dashed border-white/[0.08] p-4 text-center">
                    <Globe2 size={20} className="mx-auto text-gray-muted mb-2" />
                    <p className="text-[10px] text-gray-muted">Add comparison countries using the selector above to see international benchmarks.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Bottom Stat Bar ─── */}
      <StatBar items={statBarItems} />

      {/* ─── Detail Modal ─── */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.name} description={detailModal?.category} size="xl">
        {detailModal && (
          <div className="space-y-4">
            {detailModal.description && <p className="text-sm text-gray-muted">{detailModal.description}</p>}
            {detailModal.currentState && (
              <div>
                <span className="text-xs font-medium text-cream block mb-1">Current State</span>
                <p className="text-xs text-gray-muted glass rounded-lg p-3">{detailModal.currentState}</p>
              </div>
            )}
            {detailModal.userTypes && detailModal.userTypes.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream block mb-2">User Types</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.userTypes.map((ut) => <Badge key={ut} variant="blue" size="sm">{ut}</Badge>)}
                </div>
              </div>
            )}
            {detailModal.painPoints && detailModal.painPoints.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream block mb-2">Pain Points</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.painPoints.map((pp, i) => <Badge key={i} variant="red" size="sm">{pp}</Badge>)}
                </div>
              </div>
            )}
            {detailModal.opportunities && detailModal.opportunities.length > 0 && (
              <div>
                <span className="text-xs font-medium text-cream block mb-2">Opportunities</span>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.opportunities.map((opp, i) => <Badge key={i} variant="green" size="sm">{opp}</Badge>)}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
