"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Users,
  Target,
  Zap,
  Wrench,
  BarChart3,
  AlertTriangle,
  FileText,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type UserType = "Employer" | "Insured" | "Beneficiary" | "Internal Staff" | "Government Entity";

interface ConceptSheet {
  problemStatement: string;
  proposedSolution: string;
  targetUsers: UserType[];
  expectedOutcomes: string[];
  kpis: string[];
  dependencies: string[];
  risks: string[];
  implementationNotes: string;
}

interface ServiceConcept {
  id: string;
  title: string;
  description: string;
  category: string;
  targetUsers: UserType[];
  impactScore: number;
  effortScore: number;
  feasibilityScore: number;
  dependencies: string[];
  conceptSheet: ConceptSheet;
}

// ---------------------------------------------------------------------------
// Static data
// ---------------------------------------------------------------------------

const CATEGORIES = [
  "Digital Services",
  "Process Automation",
  "Data & Analytics",
  "Customer Experience",
  "Compliance & Governance",
  "Integration & Interoperability",
];

const USER_TYPES: UserType[] = [
  "Employer",
  "Insured",
  "Beneficiary",
  "Internal Staff",
  "Government Entity",
];

const currentStateServices = [
  { name: "Paper-based enrollment", pain: "Manual data entry, delays" },
  { name: "Branch-only claims", pain: "Long wait times, limited access" },
  { name: "Batch contribution processing", pain: "Monthly reconciliation lag" },
  { name: "Static benefit statements", pain: "No real-time visibility" },
  { name: "Manual compliance checks", pain: "Error-prone, resource heavy" },
];

const futureStateVision = [
  { name: "Digital self-enrollment", benefit: "Instant, paperless onboarding" },
  { name: "Omnichannel claims", benefit: "Submit & track from anywhere" },
  { name: "Real-time contributions", benefit: "Continuous reconciliation" },
  { name: "AI pension dashboards", benefit: "Personalized projections" },
  { name: "Automated compliance", benefit: "Real-time regulatory monitoring" },
];

const sampleConcepts: ServiceConcept[] = [
  {
    id: "c1",
    title: "AI-Powered Pension Calculator",
    description:
      "An intelligent calculator that uses machine learning to provide personalized retirement projections based on contribution history, life events, and economic scenarios.",
    category: "Data & Analytics",
    targetUsers: ["Insured", "Beneficiary"],
    impactScore: 88,
    effortScore: 65,
    feasibilityScore: 78,
    dependencies: ["Data warehouse modernization", "ML platform setup", "API gateway"],
    conceptSheet: {
      problemStatement:
        "Insured members lack visibility into projected pension benefits and cannot model different retirement scenarios, leading to poor financial planning and low member engagement.",
      proposedSolution:
        "Deploy an AI-powered calculator that ingests contribution history, salary trajectories, and economic indicators to generate personalized, dynamic retirement projections accessible via web and mobile.",
      targetUsers: ["Insured", "Beneficiary"],
      expectedOutcomes: [
        "40% increase in member self-service engagement",
        "30% reduction in call center inquiries about benefit estimates",
        "Improved member satisfaction scores by 25%",
      ],
      kpis: [
        "Monthly active users of calculator",
        "Average session duration",
        "Net Promoter Score (NPS)",
        "Call center deflection rate",
      ],
      dependencies: ["Data warehouse modernization", "ML platform setup", "API gateway", "Mobile app v2"],
      risks: [
        "Model accuracy concerns with limited historical data",
        "Data privacy regulations around predictive analytics",
        "User trust in AI-generated projections",
      ],
      implementationNotes:
        "Phase 1: Rule-based calculator with current formula. Phase 2: ML-enhanced projections with scenario modeling. Phase 3: Proactive push notifications with retirement readiness alerts.",
    },
  },
  {
    id: "c2",
    title: "Smart Employer Onboarding Portal",
    description:
      "Automated employer registration workflow with document verification, digital signatures, and real-time compliance validation.",
    category: "Digital Services",
    targetUsers: ["Employer", "Internal Staff"],
    impactScore: 82,
    effortScore: 45,
    feasibilityScore: 90,
    dependencies: ["Digital identity integration (UAE Pass)", "Document management system"],
    conceptSheet: {
      problemStatement:
        "Employer registration takes 15-20 business days with manual document verification, paper forms, and multiple branch visits, resulting in frustration and compliance delays.",
      proposedSolution:
        "A fully digital onboarding portal with OCR document scanning, UAE Pass integration for identity verification, e-signatures, and automated compliance checks that reduce registration to under 48 hours.",
      targetUsers: ["Employer", "Internal Staff"],
      expectedOutcomes: [
        "90% reduction in employer registration time",
        "70% decrease in manual data entry errors",
        "95% digital adoption rate within 12 months",
      ],
      kpis: [
        "Average registration completion time",
        "First-time right rate",
        "Digital vs. manual registration ratio",
        "Employer satisfaction score",
      ],
      dependencies: ["Digital identity integration (UAE Pass)", "Document management system", "E-signature platform"],
      risks: [
        "Integration complexity with UAE Pass",
        "Change management for employers accustomed to manual process",
        "Legal validity of e-signatures for pension documents",
      ],
      implementationNotes:
        "Leverage existing UAE Pass APIs. Start with simple employer types, expand to complex entities. Include Arabic/English bilingual interface from day one.",
    },
  },
  {
    id: "c3",
    title: "Proactive Beneficiary Notifications",
    description:
      "Event-driven notification engine that proactively alerts beneficiaries about pension milestones, required actions, and benefit changes.",
    category: "Customer Experience",
    targetUsers: ["Beneficiary", "Insured"],
    impactScore: 75,
    effortScore: 35,
    feasibilityScore: 92,
    dependencies: ["Notification gateway", "Event-driven architecture"],
    conceptSheet: {
      problemStatement:
        "Beneficiaries frequently miss important deadlines, are unaware of benefit changes, and must proactively check their status, leading to delayed payments and poor service experience.",
      proposedSolution:
        "An event-driven notification engine delivering personalized, multi-channel alerts (SMS, email, app push, WhatsApp) for pension milestones, required actions, documentation deadlines, and benefit disbursements.",
      targetUsers: ["Beneficiary", "Insured"],
      expectedOutcomes: [
        "50% reduction in missed documentation deadlines",
        "35% fewer follow-up inquiries to service desk",
        "20% faster benefit disbursement cycle",
      ],
      kpis: [
        "Notification delivery rate",
        "Notification open rate",
        "Deadline compliance rate",
        "Average disbursement cycle time",
      ],
      dependencies: ["Notification gateway", "Event-driven architecture", "CRM integration"],
      risks: [
        "Notification fatigue from over-communication",
        "Multi-channel delivery reliability",
        "Personal data handling across channels",
      ],
      implementationNotes:
        "Start with SMS and email for critical alerts. Phase 2 adds WhatsApp Business API and app push notifications. Implement user preference center for channel and frequency control.",
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scoreColor(score: number): string {
  if (score >= 80) return "text-gpssa-green";
  if (score >= 60) return "text-gold";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-gpssa-green/15";
  if (score >= 60) return "bg-gold/15";
  return "bg-red-400/15";
}

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreIndicator({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${scoreBg(score)} ${scoreColor(score)}`}>
        {score}
      </div>
      <span className="text-[10px] text-gray-muted uppercase tracking-wide">{label}</span>
    </div>
  );
}

function ConceptSheetModal({
  concept,
  isOpen,
  onClose,
}: {
  concept: ServiceConcept | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!concept) return null;
  const cs = concept.conceptSheet;

  const sections: { label: string; icon: React.ReactNode; content: React.ReactNode }[] = [
    {
      label: "Problem Statement",
      icon: <AlertTriangle size={14} className="text-gold" />,
      content: <p className="text-sm text-gray-muted leading-relaxed">{cs.problemStatement}</p>,
    },
    {
      label: "Proposed Solution",
      icon: <Lightbulb size={14} className="text-gpssa-green" />,
      content: <p className="text-sm text-gray-muted leading-relaxed">{cs.proposedSolution}</p>,
    },
    {
      label: "Target Users",
      icon: <Users size={14} className="text-adl-blue" />,
      content: (
        <div className="flex flex-wrap gap-1.5">
          {cs.targetUsers.map((u) => (
            <Badge key={u} variant="blue" size="sm">{u}</Badge>
          ))}
        </div>
      ),
    },
    {
      label: "Expected Outcomes",
      icon: <Target size={14} className="text-gpssa-green" />,
      content: (
        <ul className="space-y-1">
          {cs.expectedOutcomes.map((o, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-muted">
              <ChevronRight size={14} className="text-gpssa-green shrink-0 mt-0.5" />
              {o}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "KPIs",
      icon: <BarChart3 size={14} className="text-gold" />,
      content: (
        <ul className="space-y-1">
          {cs.kpis.map((k, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
              {k}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Dependencies",
      icon: <Wrench size={14} className="text-gray-muted" />,
      content: (
        <div className="flex flex-wrap gap-1.5">
          {cs.dependencies.map((d) => (
            <Badge key={d} variant="gray" size="sm">{d}</Badge>
          ))}
        </div>
      ),
    },
    {
      label: "Risks",
      icon: <AlertTriangle size={14} className="text-red-400" />,
      content: (
        <ul className="space-y-1">
          {cs.risks.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
              {r}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "Implementation Notes",
      icon: <FileText size={14} className="text-adl-blue" />,
      content: <p className="text-sm text-gray-muted leading-relaxed">{cs.implementationNotes}</p>,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={concept.title} description="Full Concept Sheet" size="xl">
      <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 -mr-1">
        {sections.map((s) => (
          <div key={s.label}>
            <div className="flex items-center gap-2 mb-2">
              {s.icon}
              <h4 className="text-xs font-semibold text-cream uppercase tracking-wide">{s.label}</h4>
            </div>
            {s.content}
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DesignStudioPage() {
  const [concepts, setConcepts] = useState<ServiceConcept[]>(sampleConcepts);
  const [selectedConcept, setSelectedConcept] = useState<ServiceConcept | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState(CATEGORIES[0]);
  const [formUsers, setFormUsers] = useState<UserType[]>([]);
  const [formProblem, setFormProblem] = useState("");
  const [generating, setGenerating] = useState(false);

  const toggleUser = useCallback((user: UserType) => {
    setFormUsers((prev) =>
      prev.includes(user) ? prev.filter((u) => u !== user) : [...prev, user]
    );
  }, []);

  const handleGenerate = useCallback(() => {
    if (!formName.trim() || !formProblem.trim()) return;

    setGenerating(true);

    // Simulate AI generation delay
    setTimeout(() => {
      const newConcept: ServiceConcept = {
        id: `c${Date.now()}`,
        title: formName,
        description: formProblem.slice(0, 140) + (formProblem.length > 140 ? "..." : ""),
        category: formCategory,
        targetUsers: formUsers.length > 0 ? formUsers : ["Insured"],
        impactScore: Math.floor(Math.random() * 30) + 65,
        effortScore: Math.floor(Math.random() * 40) + 30,
        feasibilityScore: Math.floor(Math.random() * 25) + 70,
        dependencies: ["Core platform integration", "Data migration"],
        conceptSheet: {
          problemStatement: formProblem,
          proposedSolution: `An AI-generated solution concept for "${formName}" addressing the identified problem through innovative digital service design and automation.`,
          targetUsers: formUsers.length > 0 ? formUsers : ["Insured"],
          expectedOutcomes: [
            "Improved service delivery efficiency",
            "Enhanced user satisfaction",
            "Reduced processing time",
          ],
          kpis: ["User adoption rate", "Processing time reduction", "Satisfaction score"],
          dependencies: ["Core platform integration", "Data migration"],
          risks: ["Integration complexity", "Change management challenges"],
          implementationNotes: "Phased rollout recommended. Start with pilot group before full deployment.",
        },
      };

      setConcepts((prev) => [newConcept, ...prev]);
      setFormName("");
      setFormProblem("");
      setFormUsers([]);
      setGenerating(false);
    }, 1500);
  }, [formName, formCategory, formUsers, formProblem]);

  const openSheet = useCallback((concept: ServiceConcept) => {
    setSelectedConcept(concept);
    setModalOpen(true);
  }, []);

  const inputClass =
    "w-full rounded-xl bg-white/5 border border-border px-4 py-2.5 text-sm text-cream placeholder:text-gray-muted/60 focus:outline-none focus:border-gpssa-green/50 focus:ring-1 focus:ring-gpssa-green/20 transition-colors";

  return (
    <div className="space-y-10">
      <PageHeader
        title="Future Design Studio"
        description="AI-powered service design workspace for GPSSA's future portfolio"
        badge={{ label: "Design", variant: "gold" }}
      />

      {/* ── Current → Future State Journey ──────────────────────────── */}
      <motion.section variants={stagger} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-5">
          <Zap size={18} className="text-gpssa-green" />
          <h2 className="font-playfair text-lg font-semibold text-cream">
            Current to Future State Journey
          </h2>
        </div>

        <motion.div className="grid gap-4 md:grid-cols-3" variants={stagger}>
          {/* Current State */}
          <motion.div variants={fadeUp}>
            <Card className="h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <h3 className="text-sm font-semibold text-cream uppercase tracking-wide">
                  Current State
                </h3>
              </div>
              <div className="space-y-3">
                {currentStateServices.map((s) => (
                  <div key={s.name} className="p-3 rounded-xl bg-white/[0.03] border border-border">
                    <p className="text-xs font-medium text-cream mb-0.5">{s.name}</p>
                    <p className="text-[11px] text-red-400/80">{s.pain}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Transition */}
          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center">
            <Card className="h-full w-full flex flex-col items-center justify-center text-center">
              <div className="space-y-6">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gpssa-green/10 flex items-center justify-center">
                  <Sparkles size={24} className="text-gpssa-green" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-cream mb-1">
                    Digital Transformation
                  </h3>
                  <p className="text-xs text-gray-muted leading-relaxed max-w-[220px] mx-auto">
                    AI-driven modernization of pension services through phased innovation and stakeholder collaboration
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <ArrowRight size={16} className="text-gpssa-green" />
                  <ArrowRight size={16} className="text-gpssa-green opacity-60" />
                  <ArrowRight size={16} className="text-gpssa-green opacity-30" />
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <Badge variant="green" size="sm">Phase 1: Foundation</Badge>
                  <Badge variant="blue" size="sm">Phase 2: Innovation</Badge>
                  <Badge variant="gold" size="sm">Phase 3: Excellence</Badge>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Future State */}
          <motion.div variants={fadeUp}>
            <Card className="h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-gpssa-green" />
                <h3 className="text-sm font-semibold text-cream uppercase tracking-wide">
                  Future State
                </h3>
              </div>
              <div className="space-y-3">
                {futureStateVision.map((s) => (
                  <div key={s.name} className="p-3 rounded-xl bg-gpssa-green/[0.04] border border-gpssa-green/10">
                    <p className="text-xs font-medium text-cream mb-0.5">{s.name}</p>
                    <p className="text-[11px] text-gpssa-green">{s.benefit}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── Concept Generator ───────────────────────────────────────── */}
      <motion.section variants={stagger} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-5">
          <Lightbulb size={18} className="text-gold" />
          <h2 className="font-playfair text-lg font-semibold text-cream">
            Concept Generator
          </h2>
        </div>

        <motion.div variants={fadeUp}>
          <Card padding="lg">
            <div className="grid gap-5 md:grid-cols-2">
              {/* Service name */}
              <div>
                <label className="block text-xs font-medium text-cream mb-1.5">
                  Service Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Smart Claims Portal"
                  className={inputClass}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-cream mb-1.5">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className={inputClass}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Target Users */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-cream mb-1.5">
                  Target Users
                </label>
                <div className="flex flex-wrap gap-2">
                  {USER_TYPES.map((u) => {
                    const active = formUsers.includes(u);
                    return (
                      <button
                        key={u}
                        type="button"
                        onClick={() => toggleUser(u)}
                        className={`
                          px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
                          ${active
                            ? "bg-gpssa-green/15 border-gpssa-green/30 text-gpssa-green"
                            : "bg-white/5 border-border text-gray-muted hover:text-cream hover:border-border-hover"
                          }
                        `}
                      >
                        {u}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Problem Statement */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-cream mb-1.5">
                  Problem Statement
                </label>
                <textarea
                  value={formProblem}
                  onChange={(e) => setFormProblem(e.target.value)}
                  rows={3}
                  placeholder="Describe the problem or opportunity this service concept addresses..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Submit */}
              <div className="md:col-span-2 flex justify-end">
                <Button
                  onClick={handleGenerate}
                  loading={generating}
                  disabled={!formName.trim() || !formProblem.trim()}
                >
                  <Sparkles size={16} />
                  Generate AI Concept
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.section>

      {/* ── Generated Concepts ──────────────────────────────────────── */}
      <motion.section variants={stagger} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-5">
          <FileText size={18} className="text-gpssa-green" />
          <h2 className="font-playfair text-lg font-semibold text-cream">
            Generated Concepts
          </h2>
          <Badge variant="gray" size="sm">{concepts.length}</Badge>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={stagger}>
            {concepts.map((concept) => (
              <motion.div
                key={concept.id}
                variants={fadeUp}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card hover className="h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-cream">{concept.title}</h3>
                    <Badge variant="blue" size="sm">{concept.category}</Badge>
                  </div>

                  <p className="text-xs text-gray-muted leading-relaxed mb-3 flex-1">
                    {concept.description}
                  </p>

                  {/* Target Users */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {concept.targetUsers.map((u) => (
                      <Badge key={u} variant="green" size="sm">{u}</Badge>
                    ))}
                  </div>

                  {/* Scores */}
                  <div className="flex justify-around mb-4 py-3 rounded-xl bg-white/[0.02] border border-border">
                    <ScoreIndicator label="Impact" score={concept.impactScore} />
                    <ScoreIndicator label="Effort" score={concept.effortScore} />
                    <ScoreIndicator label="Feasibility" score={concept.feasibilityScore} />
                  </div>

                  {/* Dependencies */}
                  <div className="mb-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-muted mb-1.5">
                      Dependencies
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {concept.dependencies.map((d) => (
                        <Badge key={d} variant="gray" size="sm">{d}</Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => openSheet(concept)}
                  >
                    <FileText size={14} />
                    View Full Concept Sheet
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.section>

      {/* Concept Sheet Modal */}
      <ConceptSheetModal
        concept={selectedConcept}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
