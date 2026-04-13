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
  ChevronRight,
  Loader2,
  CheckCircle2,
  Briefcase,
  Shield,
  UserCheck,
  Globe2,
  Sword,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface ServiceAnalysis {
  id: string;
  serviceId: string;
  analysis: Record<string, unknown>;
  model: string | null;
  createdAt: string;
}

interface GPSSAService {
  id: string;
  name: string;
  category: string;
  description: string | null;
  userTypes: string[] | null;
  currentState: string | null;
  painPoints: string[] | null;
  opportunities: string[] | null;
  analyses?: ServiceAnalysis[];
}

// -------------------------------------------------------------------
// Static fallback data (all 31 GPSSA services from RFI)
// -------------------------------------------------------------------

const CATEGORIES = [
  "Employer",
  "Insured",
  "Beneficiary",
  "Agent/Guardian",
  "GCC",
  "Military",
  "General",
] as const;

type Category = (typeof CATEGORIES)[number];

const categoryConfig: Record<
  Category,
  { icon: typeof Layers; color: "green" | "blue" | "gold" | "gray" | "red" }
> = {
  Employer: { icon: Briefcase, color: "blue" },
  Insured: { icon: Shield, color: "green" },
  Beneficiary: { icon: UserCheck, color: "gold" },
  "Agent/Guardian": { icon: Users, color: "gray" },
  GCC: { icon: Globe2, color: "blue" },
  Military: { icon: Sword, color: "red" },
  General: { icon: FileText, color: "green" },
};

const STATIC_SERVICES: GPSSAService[] = [
  // Employer (9)
  { id: "s-01", name: "Registration of an Insured", category: "Employer", description: "Register new insured individuals under an employer's account with GPSSA.", userTypes: ["Employer", "HR"], currentState: "Semi-digital process with paper-based document submission.", painPoints: ["Manual document verification", "Long processing times", "Duplicate entry risks"], opportunities: ["Digital onboarding portal", "AI document verification", "Real-time validation"] },
  { id: "s-02", name: "Employers Registration", category: "Employer", description: "Register new employers with GPSSA for pension and social security contributions.", userTypes: ["Employer"], currentState: "Partially online with in-person verification required.", painPoints: ["Complex registration forms", "Multiple visits required", "Inconsistent processing"], opportunities: ["End-to-end digital registration", "eKYC integration", "Automated compliance checks"] },
  { id: "s-03", name: "Apply for End Of Service - Civil", category: "Employer", description: "Process end-of-service benefits for civil sector employees.", userTypes: ["Employer", "HR"], currentState: "Manual calculation with multi-step approval workflow.", painPoints: ["Complex benefit calculations", "Delayed payments", "Paper-heavy process"], opportunities: ["Automated benefit calculator", "Digital approval workflow", "Direct bank transfers"] },
  { id: "s-04", name: "Benefit Exchange - Inward", category: "Employer", description: "Handle incoming benefit transfers from other pension authorities.", userTypes: ["Employer", "Insured"], currentState: "Manual inter-authority coordination.", painPoints: ["Slow inter-authority communication", "Data reconciliation issues", "Lack of transparency"], opportunities: ["API integration with GCC authorities", "Blockchain-based verification", "Real-time tracking"] },
  { id: "s-05", name: "Benefit Exchange - Outward", category: "Employer", description: "Process outgoing benefit transfers to other pension authorities.", userTypes: ["Employer", "Insured"], currentState: "Paper-based with manual tracking.", painPoints: ["Long transfer timelines", "Documentation overhead", "Status uncertainty"], opportunities: ["Digital transfer protocols", "Automated documentation", "Cross-border digital identity"] },
  { id: "s-06", name: "Service Awareness Request", category: "Employer", description: "Handle employer requests for information about GPSSA services and obligations.", userTypes: ["Employer", "HR"], currentState: "Call center and email-based inquiries.", painPoints: ["High call volumes", "Inconsistent information", "No self-service"], opportunities: ["AI chatbot", "Knowledge base portal", "Personalized employer dashboards"] },
  { id: "s-07", name: "Work Fitness Assessment", category: "Employer", description: "Assess work fitness for insured individuals returning from medical leave.", userTypes: ["Employer", "Medical"], currentState: "Manual assessment with physical report submission.", painPoints: ["Scheduling delays", "Paper medical reports", "Subjective assessments"], opportunities: ["Digital health record integration", "Telemedicine options", "Standardized assessment tools"] },
  { id: "s-08", name: "Employer DeRegistration", category: "Employer", description: "Process the deregistration of employers from GPSSA.", userTypes: ["Employer"], currentState: "Multi-step manual process requiring clearance.", painPoints: ["Complex clearance requirements", "Outstanding balance issues", "Long processing time"], opportunities: ["Digital clearance workflow", "Automated balance reconciliation", "Exit process automation"] },
  { id: "s-09", name: "Workplace Injury Compensation", category: "Employer", description: "Process compensation claims for workplace injuries.", userTypes: ["Employer", "Insured"], currentState: "Paper-based claims with manual medical review.", painPoints: ["Slow claims processing", "Fragmented medical records", "Dispute resolution delays"], opportunities: ["Digital claims portal", "Integrated medical records", "AI-assisted assessment"] },

  // Insured (7)
  { id: "s-10", name: "Merge Service Period - Civil", category: "Insured", description: "Merge service periods from multiple employers for civil sector workers.", userTypes: ["Insured"], currentState: "Complex manual process requiring documentation from multiple employers.", painPoints: ["Multiple employer coordination", "Document gathering burden", "Calculation complexity"], opportunities: ["Automated service period reconciliation", "Digital employer verification", "Self-service portal"] },
  { id: "s-11", name: "Purchase of Service Years", category: "Insured", description: "Allow insured individuals to purchase additional service years for pension benefits.", userTypes: ["Insured"], currentState: "In-person application with manual actuarial calculations.", painPoints: ["Complex cost calculations", "Limited payment options", "Lengthy approval process"], opportunities: ["Online purchase portal", "Instant cost calculator", "Flexible payment plans"] },
  { id: "s-12", name: "Cancel Merge/Purchase Payments", category: "Insured", description: "Process cancellation of previously arranged merge or purchase payment plans.", userTypes: ["Insured"], currentState: "Manual cancellation requiring multiple approvals.", painPoints: ["Refund delays", "Complex reversal calculations", "Lack of self-service"], opportunities: ["Self-service cancellation", "Automated refund processing", "Real-time balance updates"] },
  { id: "s-13", name: "Pension Advisory Service", category: "Insured", description: "Provide personalized pension planning advice to insured individuals.", userTypes: ["Insured"], currentState: "Limited in-person advisory with long wait times.", painPoints: ["Limited advisor availability", "Generic advice", "No digital tools"], opportunities: ["AI-powered pension simulator", "Digital advisory platform", "Personalized recommendations"] },
  { id: "s-14", name: "Update Payment Schedule", category: "Insured", description: "Modify existing payment schedules for service purchases or contributions.", userTypes: ["Insured"], currentState: "Requires in-person visit for schedule changes.", painPoints: ["No online modification", "Rigid schedule options", "Processing delays"], opportunities: ["Self-service schedule management", "Flexible payment options", "Automated reminders"] },
  { id: "s-15", name: "Change Payment Method", category: "Insured", description: "Allow insured individuals to change their payment method for contributions.", userTypes: ["Insured"], currentState: "Paper form submission with bank verification.", painPoints: ["Manual bank verification", "Form processing delays", "Limited payment methods"], opportunities: ["Digital payment integration", "Multiple payment gateways", "Instant verification"] },
  { id: "s-16", name: "Shourak Payment", category: "Insured", description: "Process Shourak (voluntary contribution) payments for pension enhancement.", userTypes: ["Insured"], currentState: "Semi-digital with manual reconciliation.", painPoints: ["Limited awareness", "Manual tracking", "Reconciliation errors"], opportunities: ["Integrated digital payments", "Automated reconciliation", "Contribution tracking dashboard"] },

  // Beneficiary (3)
  { id: "s-17", name: "Beneficiary Registration", category: "Beneficiary", description: "Register beneficiaries to receive pension benefits from a deceased or retired insured person.", userTypes: ["Beneficiary", "Family"], currentState: "Paper-based registration with extensive documentation.", painPoints: ["Emotional process burden", "Extensive documentation", "Long verification times"], opportunities: ["Compassionate digital process", "Pre-registration options", "Simplified verification"] },
  { id: "s-18", name: "Pension Entitlement Update", category: "Beneficiary", description: "Update pension entitlement details for registered beneficiaries.", userTypes: ["Beneficiary"], currentState: "Manual update process requiring supporting documents.", painPoints: ["Repeated document submission", "Slow updates", "Unclear eligibility rules"], opportunities: ["Self-service updates", "Document reuse", "Clear eligibility calculator"] },
  { id: "s-19", name: "Report a Death", category: "Beneficiary", description: "Report the death of an insured person or beneficiary to initiate benefit transfers.", userTypes: ["Beneficiary", "Family"], currentState: "In-person reporting with death certificate submission.", painPoints: ["Sensitive timing", "Multiple office visits", "Delayed benefit activation"], opportunities: ["Digital reporting with gov integration", "Automated benefit activation", "Proactive family support"] },

  // Agent/Guardian (3)
  { id: "s-20", name: "Agent Enrollment", category: "Agent/Guardian", description: "Enroll authorized agents to act on behalf of insured individuals or employers.", userTypes: ["Agent"], currentState: "Paper-based authorization with notarization.", painPoints: ["Notarization requirements", "Limited agent portal", "Authorization verification delays"], opportunities: ["Digital power of attorney", "Agent self-service portal", "Real-time authorization"] },
  { id: "s-21", name: "Guardian Enrollment", category: "Agent/Guardian", description: "Enroll legal guardians to manage pension affairs for minors or incapacitated beneficiaries.", userTypes: ["Guardian", "Family"], currentState: "Court document-based enrollment.", painPoints: ["Court document processing", "Complex eligibility verification", "Limited digital access"], opportunities: ["Digital court integration", "Simplified guardian portal", "Automated eligibility checks"] },
  { id: "s-22", name: "Caretaker Enrollment", category: "Agent/Guardian", description: "Enroll caretakers for beneficiaries requiring assisted management.", userTypes: ["Caretaker", "Family"], currentState: "Manual enrollment with medical certification.", painPoints: ["Medical certification overhead", "Renewal complexity", "Lack of tracking"], opportunities: ["Digital medical integration", "Automated renewals", "Caretaker dashboard"] },

  // GCC (4)
  { id: "s-23", name: "Registration of GCC Nationals", category: "GCC", description: "Register GCC nationals working in the UAE for pension benefits.", userTypes: ["Employer", "GCC National"], currentState: "Inter-country coordination with manual data exchange.", painPoints: ["Cross-border data exchange", "Inconsistent processes", "Long registration times"], opportunities: ["GCC-wide digital identity", "API-based data exchange", "Unified registration portal"] },
  { id: "s-24", name: "Registration of UAE Nationals in GCC", category: "GCC", description: "Register UAE nationals working in GCC countries for benefit coordination.", userTypes: ["UAE National", "Employer"], currentState: "Manual coordination with GCC pension authorities.", painPoints: ["Multiple authority coordination", "Documentation burden", "Status tracking difficulty"], opportunities: ["Bilateral digital agreements", "Automated status sync", "Cross-border portal"] },
  { id: "s-25", name: "End of Service of GCC Nationals", category: "GCC", description: "Process end-of-service benefits for GCC nationals in the UAE.", userTypes: ["GCC National", "Employer"], currentState: "Complex cross-border settlement process.", painPoints: ["Multi-currency settlements", "Lengthy processing", "Regulatory complexity"], opportunities: ["Automated settlement engine", "Real-time currency conversion", "Digital compliance checks"] },
  { id: "s-26", name: "End of Service for UAE Nationals in GCC", category: "GCC", description: "Process end-of-service benefits for UAE nationals working in GCC countries.", userTypes: ["UAE National"], currentState: "Manual benefit calculation with inter-country coordination.", painPoints: ["Benefit portability issues", "Calculation discrepancies", "Communication gaps"], opportunities: ["Portable benefit framework", "Unified calculation engine", "Digital liaison platform"] },

  // Military (2)
  { id: "s-27", name: "Apply for End Of Service - Military", category: "Military", description: "Process end-of-service benefits for military sector personnel.", userTypes: ["Military Personnel", "MOD"], currentState: "Classified process with specialized handling.", painPoints: ["Security clearance requirements", "Specialized calculations", "Limited transparency"], opportunities: ["Secure digital processing", "Role-based access controls", "Encrypted benefit calculations"] },
  { id: "s-28", name: "Merge Service Period - Military", category: "Military", description: "Merge military service periods with civil service for comprehensive benefit calculation.", userTypes: ["Military Personnel"], currentState: "Cross-sector manual coordination.", painPoints: ["Inter-sector data silos", "Complex eligibility rules", "Manual reconciliation"], opportunities: ["Cross-sector data integration", "Automated eligibility engine", "Unified service record"] },

  // General (3)
  { id: "s-29", name: "Generate Certificates", category: "General", description: "Generate various certificates including service certificates, pension certificates, and salary certificates.", userTypes: ["Insured", "Employer", "Beneficiary"], currentState: "Semi-digital with manual approval steps.", painPoints: ["Approval bottlenecks", "Format inconsistencies", "No instant generation"], opportunities: ["Instant digital certificate generation", "QR code verification", "API for third-party verification"] },
  { id: "s-30", name: "Submit Complaint", category: "General", description: "Submit and track complaints about GPSSA services.", userTypes: ["Insured", "Employer", "Beneficiary"], currentState: "Multi-channel submission with manual routing.", painPoints: ["Inconsistent routing", "Slow resolution", "Poor tracking"], opportunities: ["AI-powered routing", "Sentiment analysis", "SLA tracking dashboard"] },
  { id: "s-31", name: "Submit Inquiry / Suggestion", category: "General", description: "Submit inquiries or suggestions for GPSSA service improvements.", userTypes: ["Insured", "Employer", "Beneficiary"], currentState: "Email and call-based with limited tracking.", painPoints: ["No structured tracking", "Feedback black hole", "Limited follow-up"], opportunities: ["Feedback management platform", "Idea voting system", "Automated acknowledgment"] },
];

// -------------------------------------------------------------------
// Helper
// -------------------------------------------------------------------

function getCategoryConfig(cat: string) {
  return (
    categoryConfig[cat as Category] ?? { icon: Layers, color: "gray" as const }
  );
}

// -------------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------------

function ServiceCard({
  service,
  onSelect,
}: {
  service: GPSSAService;
  onSelect: (s: GPSSAService) => void;
}) {
  const config = getCategoryConfig(service.category);
  const CatIcon = config.icon;
  const painCount = service.painPoints?.length ?? 0;
  const oppCount = service.opportunities?.length ?? 0;
  const hasAnalysis = (service.analyses?.length ?? 0) > 0;

  return (
    <Card hover variant="glass" padding="md" onClick={() => onSelect(service)}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-white/5">
          <CatIcon size={18} className="text-gray-muted" />
        </div>
        <Badge variant={config.color} size="sm">
          {service.category}
        </Badge>
      </div>

      <h3 className="font-playfair text-sm font-semibold text-cream mb-1 line-clamp-2">
        {service.name}
      </h3>

      {service.description && (
        <p className="text-xs text-gray-muted mb-3 line-clamp-2">
          {service.description}
        </p>
      )}

      {service.userTypes && service.userTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {service.userTypes.slice(0, 3).map((ut) => (
            <span
              key={ut}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-muted"
            >
              {ut}
            </span>
          ))}
          {service.userTypes.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-muted">
              +{service.userTypes.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pt-3 border-t border-border text-xs text-gray-muted">
        <span className="inline-flex items-center gap-1">
          <AlertTriangle size={12} className="text-red-400" />
          {painCount} pain point{painCount !== 1 ? "s" : ""}
        </span>
        <span className="inline-flex items-center gap-1">
          <Lightbulb size={12} className="text-gpssa-green" />
          {oppCount} opportunit{oppCount !== 1 ? "ies" : "y"}
        </span>
        {hasAnalysis && (
          <span className="ml-auto inline-flex items-center gap-1 text-gpssa-green">
            <CheckCircle2 size={12} />
            Analyzed
          </span>
        )}
      </div>
    </Card>
  );
}

function AnalysisSection({ analysis }: { analysis: Record<string, unknown> }) {
  const a = analysis as {
    summary?: string;
    digitalReadiness?: { score?: number; assessment?: string };
    recommendations?: { title: string; priority: string; description: string }[];
    estimatedImpact?: Record<string, string>;
  };

  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      <h4 className="font-playfair text-sm font-semibold text-cream flex items-center gap-2">
        <Sparkles size={14} className="text-gpssa-green" />
        AI Analysis
      </h4>

      {a.summary && <p className="text-xs text-gray-muted">{a.summary}</p>}

      {a.digitalReadiness && (
        <div className="glass rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-muted">Digital Readiness</span>
            <span className="text-sm font-bold text-cream">
              {a.digitalReadiness.score}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gpssa-green to-gpssa-green-light"
              style={{ width: `${a.digitalReadiness.score ?? 0}%` }}
            />
          </div>
          {a.digitalReadiness.assessment && (
            <p className="text-[11px] text-gray-muted mt-2">
              {a.digitalReadiness.assessment}
            </p>
          )}
        </div>
      )}

      {a.recommendations && a.recommendations.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-cream">
            Recommendations
          </span>
          {a.recommendations.map((rec, i) => (
            <div key={i} className="glass rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-cream">
                  {rec.title}
                </span>
                <Badge
                  variant={rec.priority === "high" ? "red" : "gold"}
                  size="sm"
                >
                  {rec.priority}
                </Badge>
              </div>
              <p className="text-[11px] text-gray-muted">{rec.description}</p>
            </div>
          ))}
        </div>
      )}

      {a.estimatedImpact && (
        <div className="glass rounded-xl p-3">
          <span className="text-xs font-medium text-cream block mb-2">
            Estimated Impact
          </span>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(a.estimatedImpact).map(([key, val]) => (
              <div key={key} className="text-center">
                <p className="text-sm font-bold text-gpssa-green">{val}</p>
                <p className="text-[10px] text-gray-muted capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------------
// Page
// -------------------------------------------------------------------

export default function ServicesPage() {
  const [services, setServices] = useState<GPSSAService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedService, setSelectedService] = useState<GPSSAService | null>(
    null
  );
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    function parseJsonField<T>(val: unknown): T | null {
      if (val == null) return null;
      if (Array.isArray(val)) return val as T;
      if (typeof val === "string") {
        try { return JSON.parse(val) as T; } catch { return null; }
      }
      return val as T;
    }

    function hydrateService(s: any): GPSSAService {
      // Find the matching static service to use as enrichment fallback
      const staticMatch = STATIC_SERVICES.find(
        (st) => st.id === s.id || st.name.toLowerCase() === s.name.toLowerCase()
      );

      const parsed = {
        ...s,
        userTypes: parseJsonField<string[]>(s.userTypes),
        painPoints: parseJsonField<string[]>(s.painPoints),
        opportunities: parseJsonField<string[]>(s.opportunities),
        analyses: s.analyses?.map((a: any) => ({
          ...a,
          analysis: typeof a.analysis === "string" ? JSON.parse(a.analysis) : a.analysis,
        })) ?? [],
      };

      // Merge static enrichment — API data takes precedence only when non-empty
      if (staticMatch) {
        return {
          ...staticMatch,
          ...parsed,
          painPoints: parsed.painPoints?.length ? parsed.painPoints : staticMatch.painPoints,
          opportunities: parsed.opportunities?.length ? parsed.opportunities : staticMatch.opportunities,
          userTypes: parsed.userTypes?.length ? parsed.userTypes : staticMatch.userTypes,
          description: parsed.description || staticMatch.description,
          currentState: parsed.currentState || staticMatch.currentState,
        };
      }

      return parsed;
    }

    async function load() {
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data: any[] = await res.json();
          if (data.length > 0) {
            // Merge API records with static enrichment
            const hydrated = data.map(hydrateService);
            // Also include any static services not yet in the DB
            const apiIds = new Set(hydrated.map((s) => s.id));
            const missing = STATIC_SERVICES.filter((s) => !apiIds.has(s.id));
            setServices([...hydrated, ...missing]);
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

  const filtered = useMemo(() => {
    let list = services;
    if (activeCategory !== "All") {
      list = list.filter((s) => s.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.description?.toLowerCase().includes(q) ?? false)
      );
    }
    return list;
  }, [services, activeCategory, searchQuery]);

  const stats = useMemo(() => {
    const cats = new Set(services.map((s) => s.category));
    const painTotal = services.reduce(
      (acc, s) => acc + (s.painPoints?.length ?? 0),
      0
    );
    const oppTotal = services.reduce(
      (acc, s) => acc + (s.opportunities?.length ?? 0),
      0
    );
    return {
      total: services.length,
      categories: cats.size,
      painPoints: painTotal,
      opportunities: oppTotal,
    };
  }, [services]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedService) return;
    setAnalyzing(true);
    try {
      const res = await fetch(
        `/api/services/${selectedService.id}/analyze`,
        { method: "POST" }
      );
      if (res.ok) {
        const analysis = await res.json();
        setSelectedService((prev) =>
          prev
            ? {
                ...prev,
                analyses: [analysis, ...(prev.analyses ?? [])],
              }
            : null
        );
        setServices((prev) =>
          prev.map((s) =>
            s.id === selectedService.id
              ? { ...s, analyses: [analysis, ...(s.analyses ?? [])] }
              : s
          )
        );
      }
    } catch {
      // silently handle
    } finally {
      setAnalyzing(false);
    }
  }, [selectedService]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const latestAnalysis =
    selectedService?.analyses?.[0]?.analysis as Record<string, unknown> | undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Service & Product Landscape"
        description="GPSSA's current service portfolio and enhancement opportunities"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Total Services" value={stats.total} trend="neutral" />
        <StatCard icon={FolderOpen} label="Categories" value={stats.categories} trend="neutral" />
        <StatCard icon={AlertTriangle} label="Pain Points Identified" value={stats.painPoints} trend="down" change={`${stats.painPoints}`} />
        <StatCard icon={Lightbulb} label="Opportunities Found" value={stats.opportunities} trend="up" change={`${stats.opportunities}`} />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted"
          />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-border text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:border-gpssa-green/40 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-gpssa-green/20 text-gpssa-green border border-gpssa-green/30"
                  : "text-gray-muted hover:text-cream hover:bg-white/5 border border-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-muted">
        Showing {filtered.length} of {services.length} services
        {activeCategory !== "All" && (
          <> in <span className="text-cream">{activeCategory}</span></>
        )}
      </p>

      {/* Service grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((service) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ServiceCard
                service={service}
                onSelect={setSelectedService}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="glass rounded-2xl p-4 mb-4">
            <Search size={28} className="text-gray-muted" />
          </div>
          <p className="text-sm text-gray-muted">No services match your filters.</p>
        </div>
      )}

      {/* Detail modal */}
      <Modal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        title={selectedService?.name}
        description={selectedService?.category}
        size="xl"
      >
        {selectedService && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 -mr-1">
            {selectedService.description && (
              <p className="text-sm text-gray-muted">
                {selectedService.description}
              </p>
            )}

            {selectedService.currentState && (
              <div>
                <span className="text-xs font-medium text-cream block mb-1">
                  Current State
                </span>
                <p className="text-xs text-gray-muted glass rounded-lg p-3">
                  {selectedService.currentState}
                </p>
              </div>
            )}

            {selectedService.userTypes &&
              selectedService.userTypes.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-cream block mb-2">
                    User Types
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedService.userTypes.map((ut) => (
                      <Badge key={ut} variant="blue" size="sm">
                        {ut}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {selectedService.painPoints &&
              selectedService.painPoints.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-cream block mb-2">
                    Pain Points
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedService.painPoints.map((pp, i) => (
                      <Badge key={i} variant="red" size="sm">
                        {pp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {selectedService.opportunities &&
              selectedService.opportunities.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-cream block mb-2">
                    Opportunities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedService.opportunities.map((opp, i) => (
                      <Badge key={i} variant="green" size="sm">
                        {opp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {/* AI Analysis button */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="sm"
                loading={analyzing}
                onClick={handleAnalyze}
              >
                <Sparkles size={14} />
                Generate AI Analysis
              </Button>
            </div>

            {/* Existing analysis */}
            {latestAnalysis && <AnalysisSection analysis={latestAnalysis} />}
          </div>
        )}
      </Modal>
    </div>
  );
}
