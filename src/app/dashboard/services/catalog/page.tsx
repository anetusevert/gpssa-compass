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
  Briefcase,
  Shield,
  UserCheck,
  Globe2,
  Sword,
  FileText,
  Scale,
  List,
  BarChart3,
  Radar,
  ArrowLeftRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CountrySelector } from "@/components/comparison/CountrySelector";
import { StatBar, type StatBarItem } from "@/components/ui/StatBar";
import { COUNTRIES } from "@/lib/countries/catalog";
import { CountryFlag } from "@/components/ui/CountryFlag";

/* ═══════════════════════════════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════════════════════════════ */
const CATEGORIES = [
  "Employer", "Insured", "Beneficiary", "Agent/Guardian", "GCC", "Military", "General",
] as const;
type Category = (typeof CATEGORIES)[number];

const categoryConfig: Record<Category, { icon: typeof Layers; color: "green" | "blue" | "gold" | "gray" | "red"; accent: string; bg: string }> = {
  Employer:        { icon: Briefcase, color: "blue",  accent: "border-adl-blue/40",       bg: "bg-adl-blue/[0.08]" },
  Insured:         { icon: Shield,    color: "green", accent: "border-gpssa-green/40",     bg: "bg-gpssa-green/[0.08]" },
  Beneficiary:     { icon: UserCheck, color: "gold",  accent: "border-gold/40",            bg: "bg-gold/[0.08]" },
  "Agent/Guardian": { icon: Users,    color: "gray",  accent: "border-gray-muted/40",      bg: "bg-gray-muted/[0.08]" },
  GCC:             { icon: Globe2,    color: "blue",  accent: "border-adl-blue/40",        bg: "bg-adl-blue/[0.08]" },
  Military:        { icon: Sword,     color: "red",   accent: "border-red-400/40",         bg: "bg-red-400/[0.08]" },
  General:         { icon: FileText,  color: "green", accent: "border-gpssa-green/40",     bg: "bg-gpssa-green/[0.08]" },
};

const CAT_GLOW: Record<string, string> = {
  Employer:         "shadow-adl-blue/20",
  Insured:          "shadow-gpssa-green/20",
  Beneficiary:      "shadow-gold/20",
  "Agent/Guardian":  "shadow-gray-muted/20",
  GCC:              "shadow-adl-blue/20",
  Military:         "shadow-red-400/20",
  General:          "shadow-gpssa-green/20",
};

const COUNTRY_COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

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

type VizMode = "list" | "bar" | "radar";

/* ═══════════════════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════════════════ */
function parseJsonField<T>(val: unknown): T | null {
  if (val == null) return null;
  if (Array.isArray(val)) return val as T;
  if (typeof val === "string") { try { return JSON.parse(val) as T; } catch { return null; } }
  return val as T;
}

function getCfg(cat: string) {
  return categoryConfig[cat as Category] ?? { icon: Layers, color: "gray" as const, accent: "border-white/10", bg: "bg-white/[0.04]" };
}

/* ═══════════════════════════════════════════════════════════════════════════
   Inline sub-components
   ═══════════════════════════════════════════════════════════════════════════ */

function CategoryTile({ cat, count, isActive, onClick }: { cat: string; count: number; isActive: boolean; onClick: () => void }) {
  const cfg = getCfg(cat);
  const Icon = cfg.icon;
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex flex-col items-start p-3.5 rounded-xl border backdrop-blur-sm transition-all text-left ${
        isActive
          ? `${cfg.bg} ${cfg.accent} border-2 shadow-lg ${CAT_GLOW[cat] ?? ""}`
          : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14]"
      }`}
    >
      <div className={`p-2 rounded-lg mb-2 ${isActive ? cfg.bg : "bg-white/[0.05]"}`}>
        <Icon size={16} className={isActive ? "text-cream" : "text-gray-muted"} />
      </div>
      <span className={`text-xs font-semibold leading-tight ${isActive ? "text-cream" : "text-cream/80"}`}>{cat}</span>
      <span className="text-[10px] text-gray-muted mt-0.5">{count} service{count !== 1 ? "s" : ""}</span>
      {isActive && (
        <motion.div
          layoutId="catIndicator"
          className={`absolute -right-px top-3 bottom-3 w-[3px] rounded-full ${cfg.bg.replace("/[0.08]", "")}`}
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
    </motion.button>
  );
}

function ServiceDetailCard({ svc, onOpen }: { svc: GPSSAService; onOpen: () => void }) {
  const cfg = getCfg(svc.category);
  const pains = svc.painPoints ?? [];
  const opps = svc.opportunities ?? [];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      onClick={onOpen}
      className="rounded-xl bg-white/[0.03] border border-white/[0.07] p-4 hover:bg-white/[0.05] hover:border-white/[0.12] transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-xs font-semibold text-cream group-hover:text-white leading-snug">{svc.name}</h3>
        <Badge variant={cfg.color} size="sm">{svc.category}</Badge>
      </div>
      {svc.description && <p className="text-[10px] text-gray-muted leading-relaxed mb-2.5 line-clamp-2">{svc.description}</p>}
      {svc.currentState && (
        <p className="text-[10px] text-gray-muted/70 italic mb-2.5 line-clamp-1">{svc.currentState}</p>
      )}
      <div className="flex flex-wrap gap-1 mb-2">
        {pains.slice(0, 2).map((p, i) => <Badge key={i} variant="red" size="sm">{p}</Badge>)}
        {pains.length > 2 && <Badge variant="red" size="sm">+{pains.length - 2}</Badge>}
      </div>
      <div className="flex flex-wrap gap-1">
        {opps.slice(0, 2).map((o, i) => <Badge key={i} variant="green" size="sm">{o}</Badge>)}
        {opps.length > 2 && <Badge variant="green" size="sm">+{opps.length - 2}</Badge>}
      </div>
      {svc.userTypes && svc.userTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-white/[0.04]">
          {svc.userTypes.map((ut) => <span key={ut} className="text-[9px] text-gray-muted bg-white/[0.04] px-1.5 py-0.5 rounded">{ut}</span>)}
        </div>
      )}
    </motion.div>
  );
}

function ComparisonCategoryRow({
  cat, gpssaCount, intlCounts, maxCount, isActive, onClick,
}: {
  cat: string; gpssaCount: number; intlCounts: { iso3: string; count: number; color: string }[];
  maxCount: number; isActive: boolean; onClick: () => void;
}) {
  const cfg = getCfg(cat);
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left ${
        isActive
          ? `${cfg.bg} border border-l-2 ${cfg.accent}`
          : "hover:bg-white/[0.04] border border-transparent"
      }`}
    >
      <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? cfg.bg : "bg-white/[0.04]"}`}>
        <Icon size={13} className={isActive ? "text-cream" : "text-gray-muted"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[11px] font-medium ${isActive ? "text-cream" : "text-cream/70"}`}>{cat}</p>
        <div className="flex items-center gap-1 mt-1 h-2">
          <div className="flex-1 flex gap-px h-full rounded-sm overflow-hidden bg-white/[0.04]">
            <motion.div
              className="h-full bg-gpssa-green/70 rounded-l-sm"
              initial={{ width: 0 }}
              animate={{ width: maxCount > 0 ? `${(gpssaCount / maxCount) * 100}%` : "0%" }}
              transition={{ duration: 0.4 }}
            />
            {intlCounts.map((ic) => (
              <motion.div
                key={ic.iso3}
                className="h-full"
                style={{ backgroundColor: ic.color + "99" }}
                initial={{ width: 0 }}
                animate={{ width: maxCount > 0 ? `${(ic.count / maxCount) * 100}%` : "0%" }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            ))}
          </div>
          <span className="text-[9px] text-gray-muted tabular-nums w-4 text-right">{gpssaCount}</span>
        </div>
      </div>
    </button>
  );
}

function ComparisonListView({ gpssaServices, intlServices, countries }: {
  gpssaServices: GPSSAService[]; intlServices: IntlService[]; countries: string[];
}) {
  return (
    <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
      <div>
        <div className="flex items-center gap-1.5 mb-2 sticky top-0 bg-navy/95 backdrop-blur-sm py-1 z-10">
          <CountryFlag code="ARE" size="xs" />
          <span className="text-[10px] font-semibold text-cream uppercase tracking-wider">GPSSA</span>
          <span className="text-[9px] text-gray-muted ml-auto">{gpssaServices.length}</span>
        </div>
        <div className="space-y-1.5">
          {gpssaServices.map((svc) => (
            <div key={svc.id} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
              <p className="text-[11px] font-medium text-cream leading-snug">{svc.name}</p>
              {svc.description && <p className="text-[9px] text-gray-muted mt-0.5 line-clamp-1">{svc.description}</p>}
              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-gray-muted">
                {(svc.painPoints?.length ?? 0) > 0 && <span className="text-red-400"><AlertTriangle size={8} className="inline mr-0.5" />{svc.painPoints!.length}</span>}
                {(svc.opportunities?.length ?? 0) > 0 && <span className="text-gpssa-green"><Lightbulb size={8} className="inline mr-0.5" />{svc.opportunities!.length}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-2 sticky top-0 bg-navy/95 backdrop-blur-sm py-1 z-10">
          {countries.map((iso3) => <CountryFlag key={iso3} code={iso3} size="xs" />)}
          <span className="text-[10px] font-semibold text-cream uppercase tracking-wider">International</span>
          <span className="text-[9px] text-gray-muted ml-auto">{intlServices.length}</span>
        </div>
        <div className="space-y-1.5">
          {intlServices.length > 0 ? intlServices.map((svc) => {
            const country = COUNTRIES.find((c) => c.iso3 === svc.countryIso3);
            return (
              <div key={svc.id} className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-2.5">
                <div className="flex items-center gap-1 mb-1">
                  <CountryFlag code={svc.countryIso3} size="xs" />
                  <span className="text-[8px] text-gray-muted">{country?.name}</span>
                  {svc.maturityLevel && <Badge variant="blue" size="sm">{svc.maturityLevel}</Badge>}
                </div>
                <p className="text-[11px] font-medium text-cream leading-snug">{svc.name}</p>
                {svc.digitalReadiness != null && (
                  <div className="flex items-center gap-1 mt-1">
                    <Sparkles size={8} className="text-gpssa-green" />
                    <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div className="h-full rounded-full bg-gpssa-green/70" initial={{ width: 0 }} animate={{ width: `${svc.digitalReadiness}%` }} transition={{ duration: 0.5 }} />
                    </div>
                    <span className="text-[8px] text-gpssa-green tabular-nums">{svc.digitalReadiness}%</span>
                  </div>
                )}
                {svc.iloAlignment && <span className="inline-flex items-center gap-0.5 text-[8px] text-gold mt-1"><Scale size={7} />ILO</span>}
              </div>
            );
          }) : (
            <div className="rounded-lg bg-white/[0.02] border border-dashed border-white/[0.08] p-6 text-center">
              <Globe2 size={18} className="mx-auto text-gray-muted mb-1.5" />
              <p className="text-[10px] text-gray-muted">No international data yet. Run research agents to populate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ComparisonBarChart({ catCounts }: {
  catCounts: { cat: string; gpssa: number; intl: { iso3: string; count: number; color: string }[] }[];
}) {
  const maxVal = Math.max(1, ...catCounts.flatMap((c) => [c.gpssa, ...c.intl.map((i) => i.count)]));
  return (
    <div className="space-y-3 overflow-y-auto pr-1">
      {catCounts.map(({ cat, gpssa, intl }) => (
        <div key={cat}>
          <p className="text-[10px] font-medium text-cream mb-1.5">{cat}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CountryFlag code="ARE" size="xs" />
              <div className="flex-1 h-4 rounded bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded bg-gpssa-green/70 flex items-center justify-end pr-1"
                  initial={{ width: 0 }}
                  animate={{ width: `${(gpssa / maxVal) * 100}%` }}
                  transition={{ duration: 0.5 }}
                >
                  {gpssa > 0 && <span className="text-[8px] font-bold text-white">{gpssa}</span>}
                </motion.div>
              </div>
            </div>
            {intl.map((ic) => (
              <div key={ic.iso3} className="flex items-center gap-2">
                <CountryFlag code={ic.iso3} size="xs" />
                <div className="flex-1 h-4 rounded bg-white/[0.04] overflow-hidden">
                  <motion.div
                    className="h-full rounded flex items-center justify-end pr-1"
                    style={{ backgroundColor: ic.color + "99" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(ic.count / maxVal) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.05 }}
                  >
                    {ic.count > 0 && <span className="text-[8px] font-bold text-white">{ic.count}</span>}
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ComparisonRadar({ catCounts }: {
  catCounts: { cat: string; gpssa: number; intl: { iso3: string; count: number; color: string }[] }[];
}) {
  const cx = 140, cy = 130, r = 100;
  const n = catCounts.length;
  if (n < 3) return <p className="text-xs text-gray-muted text-center py-8">Need at least 3 categories for radar view.</p>;

  const maxVal = Math.max(1, ...catCounts.flatMap((c) => [c.gpssa, ...c.intl.map((i) => i.count)]));
  const angleStep = (2 * Math.PI) / n;

  function polarToXY(idx: number, val: number) {
    const angle = idx * angleStep - Math.PI / 2;
    const norm = (val / maxVal) * r;
    return { x: cx + norm * Math.cos(angle), y: cy + norm * Math.sin(angle) };
  }

  function makePolygon(values: number[]) {
    return values.map((v, i) => { const p = polarToXY(i, v); return `${p.x},${p.y}`; }).join(" ");
  }

  const gpssaPoints = makePolygon(catCounts.map((c) => c.gpssa));

  const allCountryIso3 = Array.from(new Set(catCounts.flatMap((c) => c.intl.map((i) => i.iso3))));
  const countryPolygons = allCountryIso3.map((iso3) => {
    const values = catCounts.map((c) => c.intl.find((i) => i.iso3 === iso3)?.count ?? 0);
    const color = catCounts[0]?.intl.find((i) => i.iso3 === iso3)?.color ?? "#888";
    return { iso3, points: makePolygon(values), color };
  });

  return (
    <div className="flex flex-col items-center overflow-y-auto pr-1">
      <svg viewBox="0 0 280 280" className="w-full max-w-[320px]">
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <polygon
            key={pct}
            points={Array.from({ length: n }, (_, i) => { const p = polarToXY(i, maxVal * pct); return `${p.x},${p.y}`; }).join(" ")}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"
          />
        ))}
        {catCounts.map((c, i) => {
          const p = polarToXY(i, maxVal);
          return (
            <g key={c.cat}>
              <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
              <text x={p.x} y={p.y} textAnchor="middle" dy={p.y < cy ? -6 : 12} className="text-[8px] fill-gray-muted">{c.cat}</text>
            </g>
          );
        })}
        {countryPolygons.map((cp) => (
          <motion.polygon
            key={cp.iso3}
            points={cp.points}
            fill={cp.color + "15"}
            stroke={cp.color}
            strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
        ))}
        <motion.polygon
          points={gpssaPoints}
          fill="rgba(34,197,94,0.12)"
          stroke="#22C55E"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        />
        {catCounts.map((c, i) => {
          const p = polarToXY(i, c.gpssa);
          return <circle key={c.cat} cx={p.x} cy={p.y} r="3" fill="#22C55E" />;
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <span className="flex items-center gap-1 text-[9px] text-cream"><span className="w-2 h-2 rounded-full bg-gpssa-green" />GPSSA</span>
        {countryPolygons.map((cp) => {
          const country = COUNTRIES.find((c) => c.iso3 === cp.iso3);
          return (
            <span key={cp.iso3} className="flex items-center gap-1 text-[9px] text-cream">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cp.color }} />
              <CountryFlag code={cp.iso3} size="xs" />{country?.name?.split(" ")[0]}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Page Component
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ServiceCatalogPage() {
  const [services, setServices] = useState<GPSSAService[]>([]);
  const [intlServices, setIntlServices] = useState<IntlService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);
  const [vizMode, setVizMode] = useState<VizMode>("list");
  const [detailModal, setDetailModal] = useState<GPSSAService | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isComparing = comparisonCountries.length > 0;

  /* ── Data loading ── */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/services");
        if (res.ok) {
          const data: Record<string, unknown>[] = await res.json();
          if (data.length > 0) {
            const enriched = STATIC_SERVICES.map((staticSvc) => {
              const apiMatch = data.find((d) => d.id === staticSvc.id || (d.name as string)?.toLowerCase() === staticSvc.name.toLowerCase());
              if (!apiMatch) return staticSvc;
              const parsed = { userTypes: parseJsonField<string[]>(apiMatch.userTypes), painPoints: parseJsonField<string[]>(apiMatch.painPoints), opportunities: parseJsonField<string[]>(apiMatch.opportunities) };
              return { ...staticSvc, painPoints: parsed.painPoints?.length ? parsed.painPoints : staticSvc.painPoints, opportunities: parsed.opportunities?.length ? parsed.opportunities : staticSvc.opportunities, userTypes: parsed.userTypes?.length ? parsed.userTypes : staticSvc.userTypes, description: (apiMatch.description as string) || staticSvc.description, currentState: (apiMatch.currentState as string) || staticSvc.currentState };
            });
            setServices(enriched);
          } else { setServices(STATIC_SERVICES); }
        } else { setServices(STATIC_SERVICES); }
      } catch { setServices(STATIC_SERVICES); } finally { setLoading(false); }
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

  /* ── Derived data ── */
  const catCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of services) map.set(s.category, (map.get(s.category) ?? 0) + 1);
    return CATEGORIES.map((cat) => ({ cat, count: map.get(cat) ?? 0 }));
  }, [services]);

  const categoryServices = useMemo(() => {
    if (!activeCategory) return [];
    let list = services.filter((s) => s.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || (s.description?.toLowerCase().includes(q) ?? false));
    }
    return list;
  }, [services, activeCategory, searchQuery]);

  const categoryIntlServices = useMemo(() => {
    if (!activeCategory || intlServices.length === 0) return [];
    return intlServices.filter((s) => s.category === activeCategory);
  }, [intlServices, activeCategory]);

  const intlByCountry = useMemo(() => {
    const map = new Map<string, IntlService[]>();
    for (const s of intlServices) {
      const list = map.get(s.countryIso3) ?? [];
      list.push(s);
      map.set(s.countryIso3, list);
    }
    return map;
  }, [intlServices]);

  const comparisonCatData = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const gpssa = services.filter((s) => s.category === cat).length;
      const intl = comparisonCountries.map((iso3, idx) => {
        const count = (intlByCountry.get(iso3) ?? []).filter((s) => s.category === cat).length;
        return { iso3, count, color: COUNTRY_COLORS[idx % COUNTRY_COLORS.length] };
      });
      return { cat, gpssa, intl };
    });
  }, [services, comparisonCountries, intlByCountry]);

  const maxCatCount = useMemo(() =>
    Math.max(1, ...comparisonCatData.flatMap((c) => [c.gpssa, ...c.intl.map((i) => i.count)]))
  , [comparisonCatData]);

  const gapCount = useMemo(() => {
    const gpssaCats = new Set(services.map((s) => s.category));
    const intlCats = new Set(intlServices.map((s) => s.category));
    let gaps = 0;
    for (const cat of Array.from(gpssaCats)) if (!intlCats.has(cat)) gaps++;
    for (const cat of Array.from(intlCats)) if (!gpssaCats.has(cat)) gaps++;
    return gaps;
  }, [services, intlServices]);

  const handleCategoryClick = useCallback((cat: string) => {
    setActiveCategory((prev) => (prev === cat ? null : cat));
  }, []);

  /* ── Stat bar ── */
  const statBarItems: StatBarItem[] = useMemo(() => {
    const items: StatBarItem[] = [
      { icon: Layers, value: services.length, label: "GPSSA Services" },
      { icon: FolderOpen, value: CATEGORIES.length, label: "Categories" },
      { icon: AlertTriangle, value: services.reduce((a, s) => a + (s.painPoints?.length ?? 0), 0), label: "Pain Points" },
      { icon: Lightbulb, value: services.reduce((a, s) => a + (s.opportunities?.length ?? 0), 0), label: "Opportunities" },
    ];
    if (isComparing) {
      items.push({ icon: Globe2, value: intlServices.length, label: `Intl (${comparisonCountries.length})` });
    }
    return items;
  }, [services, intlServices.length, comparisonCountries.length, isComparing]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ─── Header ─── */}
      <div className="shrink-0 flex items-center gap-3 px-5 py-2 border-b border-white/[0.06]">
        <h1 className="font-playfair text-base font-semibold text-cream shrink-0">Service Catalog</h1>
        <div className="h-4 w-px bg-white/10" />
        <CountrySelector selected={comparisonCountries} onChange={setComparisonCountries} pillar="services" variant="inline" />
        {activeCategory && (
          <div className="ml-auto relative">
            <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-muted" />
            <input type="text" placeholder="Filter…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 pl-7 pr-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-cream placeholder:text-gray-muted focus:outline-none focus:border-gpssa-green/30 transition-colors" />
          </div>
        )}
      </div>

      {/* ─── Comparison stats banner (Mode 2 only) ─── */}
      <AnimatePresence>
        {isComparing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 overflow-hidden"
          >
            <div className="flex items-center gap-4 px-5 py-2 border-b border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center gap-1.5">
                <CountryFlag code="ARE" size="xs" />
                <span className="text-[10px] font-semibold text-cream">{services.length}</span>
                <span className="text-[9px] text-gray-muted">services</span>
              </div>
              {comparisonCountries.map((iso3) => {
                const count = intlByCountry.get(iso3)?.length ?? 0;
                const country = COUNTRIES.find((c) => c.iso3 === iso3);
                return (
                  <div key={iso3} className="flex items-center gap-1.5">
                    <span className="text-[9px] text-gray-muted">vs</span>
                    <CountryFlag code={iso3} size="xs" />
                    <span className="text-[10px] font-semibold text-cream">{count}</span>
                    <span className="text-[9px] text-gray-muted hidden sm:inline">{country?.name?.split(" ")[0]}</span>
                  </div>
                );
              })}
              {gapCount > 0 && (
                <div className="flex items-center gap-1 ml-auto">
                  <ArrowLeftRight size={10} className="text-gold" />
                  <span className="text-[10px] font-semibold text-gold">{gapCount}</span>
                  <span className="text-[9px] text-gray-muted">category gaps</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main content ─── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* ── Left panel ── */}
        <div className={`shrink-0 border-r border-white/[0.06] overflow-y-auto scrollbar-thin ${
          isComparing ? "w-[280px]" : "w-[300px]"
        }`}>
          <AnimatePresence mode="wait">
            {isComparing ? (
              <motion.div key="compare-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3 space-y-1">
                <p className="text-[9px] text-gray-muted uppercase tracking-wider mb-2 px-1">Categories</p>
                {comparisonCatData.map((d) => (
                  <ComparisonCategoryRow
                    key={d.cat}
                    cat={d.cat}
                    gpssaCount={d.gpssa}
                    intlCounts={d.intl}
                    maxCount={maxCatCount}
                    isActive={activeCategory === d.cat}
                    onClick={() => handleCategoryClick(d.cat)}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div key="tiles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-3">
                <p className="text-[9px] text-gray-muted uppercase tracking-wider mb-2 px-1">Service Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {catCounts.map(({ cat, count }) => (
                    <CategoryTile key={cat} cat={cat} count={count} isActive={activeCategory === cat} onClick={() => handleCategoryClick(cat)} />
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.05] px-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CountryFlag code="ARE" size="xs" />
                    <span className="text-[10px] font-semibold text-cream">GPSSA Portfolio</span>
                  </div>
                  <p className="text-[9px] text-gray-muted">{services.length} services across {CATEGORIES.length} categories. Click a tile to explore.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right panel ── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Viz toggle (comparison mode only, when category selected) */}
          {isComparing && activeCategory && (
            <div className="shrink-0 flex items-center gap-1 px-4 py-2 border-b border-white/[0.04]">
              {([
                { id: "list" as VizMode, icon: List, label: "List" },
                { id: "bar" as VizMode, icon: BarChart3, label: "Bars" },
                { id: "radar" as VizMode, icon: Radar, label: "Radar" },
              ]).map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.id}
                    onClick={() => setVizMode(v.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                      vizMode === v.id
                        ? "bg-gpssa-green/15 text-gpssa-green border border-gpssa-green/25"
                        : "text-gray-muted hover:text-cream hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <Icon size={11} />{v.label}
                  </button>
                );
              })}
              <span className="ml-auto text-[9px] text-gray-muted">{activeCategory}</span>
            </div>
          )}

          {/* Content area */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4">
            <AnimatePresence mode="wait">
              {activeCategory ? (
                <motion.div key={`cat-${activeCategory}-${isComparing ? vizMode : "browse"}`} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }} className="h-full">
                  {isComparing ? (
                    vizMode === "list" ? (
                      <ComparisonListView gpssaServices={categoryServices} intlServices={categoryIntlServices} countries={comparisonCountries} />
                    ) : vizMode === "bar" ? (
                      <ComparisonBarChart catCounts={comparisonCatData} />
                    ) : (
                      <ComparisonRadar catCounts={comparisonCatData} />
                    )
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        {(() => { const cfg = getCfg(activeCategory); const Icon = cfg.icon; return <div className={`p-1.5 rounded-lg ${cfg.bg}`}><Icon size={14} className="text-cream" /></div>; })()}
                        <div>
                          <h2 className="text-sm font-semibold text-cream font-playfair">{activeCategory}</h2>
                          <p className="text-[10px] text-gray-muted">{categoryServices.length} service{categoryServices.length !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {categoryServices.map((svc) => (
                          <ServiceDetailCard key={svc.id} svc={svc} onOpen={() => setDetailModal(svc)} />
                        ))}
                      </div>
                      {categoryServices.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Search size={20} className="text-gray-muted mb-2" />
                          <p className="text-xs text-gray-muted">No services match your search.</p>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              ) : (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.08] max-w-xs">
                    <Layers size={28} className="mx-auto text-gray-muted mb-3" />
                    <h2 className="font-playfair text-sm font-semibold text-cream mb-1">
                      {isComparing ? "Select a category to compare" : "Select a category to explore"}
                    </h2>
                    <p className="text-[10px] text-gray-muted leading-relaxed">
                      {isComparing
                        ? "Choose a category on the left to see GPSSA services side-by-side with international equivalents."
                        : "Click any category tile on the left to browse GPSSA services with full details, pain points, and opportunities."
                      }
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─── Stat Bar ─── */}
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
