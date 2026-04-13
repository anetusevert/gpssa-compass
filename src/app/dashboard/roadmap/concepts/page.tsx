"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Users,
  Target,
  FileText,
  BarChart3,
  Link2,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface ConceptKPI {
  name: string;
  target: string;
  baseline: string;
}

interface ConceptSheet {
  id: string;
  title: string;
  category: string;
  priority: "high" | "medium" | "low";
  description: string;
  impactScore: number;
  problemStatement: string;
  proposedSolution: string;
  targetUsers: string[];
  expectedOutcomes: string[];
  kpis: ConceptKPI[];
  dependencies: string[];
  risks: { title: string; severity: "high" | "medium" | "low" }[];
  implementationNotes: string;
}

const priorityConfig = {
  high: { variant: "red" as const, label: "High Priority" },
  medium: { variant: "gold" as const, label: "Medium Priority" },
  low: { variant: "gray" as const, label: "Low Priority" },
};

const sampleConcepts: ConceptSheet[] = [
  {
    id: "c1",
    title: "Unified Digital Portal",
    category: "Digital Transformation",
    priority: "high",
    description: "A single digital gateway for all GPSSA services including pension inquiries, benefit calculations, and document submission.",
    impactScore: 9,
    problemStatement: "Citizens currently navigate multiple disconnected systems to access pension and social security services, leading to confusion, repeated data entry, and long processing times.",
    proposedSolution: "Build a unified web portal with single sign-on, personalized dashboard, and end-to-end service completion capabilities. Integrate with existing backend systems via API gateway.",
    targetUsers: ["UAE Nationals", "Employers", "HR Departments", "Retirees"],
    expectedOutcomes: [
      "Reduce service completion time by 60%",
      "Increase digital channel adoption to 70%",
      "Decrease call center volume by 40%",
      "Improve customer satisfaction score to 4.5/5",
    ],
    kpis: [
      { name: "Digital Adoption Rate", target: "70%", baseline: "25%" },
      { name: "Avg. Service Time", target: "< 5 min", baseline: "25 min" },
      { name: "Customer Satisfaction", target: "4.5/5", baseline: "3.2/5" },
    ],
    dependencies: ["CRM Platform Setup", "API Gateway Implementation", "Identity Verification System"],
    risks: [
      { title: "Legacy system integration complexity", severity: "high" },
      { title: "User adoption resistance", severity: "medium" },
      { title: "Data migration challenges", severity: "medium" },
    ],
    implementationNotes: "Phased rollout starting with pension inquiry and contribution statements. Mobile-responsive design required. Arabic/English bilingual support mandatory.",
  },
  {
    id: "c2",
    title: "AI-Powered Customer Service",
    category: "Artificial Intelligence",
    priority: "high",
    description: "Intelligent chatbot and virtual assistant for 24/7 customer support with natural language understanding in Arabic and English.",
    impactScore: 8,
    problemStatement: "Customer service is limited to business hours, with long wait times during peak periods. Common inquiries consume significant agent time that could be spent on complex cases.",
    proposedSolution: "Deploy an AI chatbot with NLU capabilities supporting Arabic and English, integrated with knowledge base and backend systems for real-time information retrieval.",
    targetUsers: ["All GPSSA Customers", "Call Center Agents", "Service Desk Staff"],
    expectedOutcomes: [
      "Handle 50% of inquiries without human intervention",
      "Provide 24/7 service availability",
      "Reduce average response time to under 30 seconds",
      "Free up 30% of agent capacity for complex cases",
    ],
    kpis: [
      { name: "Automation Rate", target: "50%", baseline: "0%" },
      { name: "Response Time", target: "< 30s", baseline: "8 min" },
      { name: "Resolution Rate", target: "80%", baseline: "N/A" },
    ],
    dependencies: ["Knowledge Base Setup", "CRM Platform", "API Integration Layer"],
    risks: [
      { title: "Arabic NLU accuracy challenges", severity: "high" },
      { title: "Incorrect information delivery", severity: "high" },
      { title: "Customer preference for human agents", severity: "medium" },
    ],
    implementationNotes: "Start with FAQ-based responses, then expand to transactional capabilities. Requires continuous training with real interaction data. Human handoff must be seamless.",
  },
  {
    id: "c3",
    title: "Process Automation Suite",
    category: "Operational Excellence",
    priority: "medium",
    description: "RPA and workflow automation for high-volume, repetitive processes across pension registration, claims, and document processing.",
    impactScore: 7,
    problemStatement: "Manual processing of pension applications, claims, and document verification creates bottlenecks, errors, and inconsistent processing times.",
    proposedSolution: "Implement RPA bots for document verification, data entry, and routing. Deploy workflow engine for end-to-end process orchestration with business rules engine.",
    targetUsers: ["Operations Staff", "Claims Processors", "Document Handlers"],
    expectedOutcomes: [
      "Automate 70% of document processing",
      "Reduce processing errors by 90%",
      "Cut average processing time by 50%",
      "Reallocate 25% of staff to value-added activities",
    ],
    kpis: [
      { name: "Automation Coverage", target: "70%", baseline: "10%" },
      { name: "Error Rate", target: "< 1%", baseline: "8%" },
      { name: "Processing Time", target: "2 hours", baseline: "4 hours" },
    ],
    dependencies: ["Document Management System", "Business Rules Engine"],
    risks: [
      { title: "Process variability across service lines", severity: "medium" },
      { title: "Staff resistance to automation", severity: "medium" },
    ],
    implementationNotes: "Prioritize top 5 highest-volume processes. Requires process mining phase to document current state. Build exception handling workflows.",
  },
  {
    id: "c4",
    title: "Data Analytics Platform",
    category: "Data & Analytics",
    priority: "medium",
    description: "Centralized analytics platform with real-time dashboards, predictive models, and self-service reporting for data-driven decision making.",
    impactScore: 7,
    problemStatement: "Decision-making relies on fragmented, outdated reports from siloed systems. No real-time visibility into operational performance or customer behavior patterns.",
    proposedSolution: "Build a modern data platform with data warehouse, ETL pipelines, real-time dashboards, and predictive analytics capabilities. Enable self-service reporting for business users.",
    targetUsers: ["Executive Leadership", "Operations Managers", "Policy Analysts"],
    expectedOutcomes: [
      "Real-time visibility into all KPIs",
      "Predictive models for service demand",
      "Self-service reporting for 80% of information needs",
      "Data-driven policy recommendations",
    ],
    kpis: [
      { name: "Dashboard Adoption", target: "90%", baseline: "20%" },
      { name: "Report Generation Time", target: "< 1 min", baseline: "3 days" },
      { name: "Prediction Accuracy", target: "> 85%", baseline: "N/A" },
    ],
    dependencies: ["Data Governance Framework", "Cloud Infrastructure", "API Integration"],
    risks: [
      { title: "Data quality and consistency issues", severity: "high" },
      { title: "Data privacy and security compliance", severity: "high" },
      { title: "Skill gaps in analytics team", severity: "medium" },
    ],
    implementationNotes: "Start with operational dashboards, then add predictive capabilities. Requires data governance policies and data stewardship program.",
  },
  {
    id: "c5",
    title: "Mobile Experience App",
    category: "Digital Transformation",
    priority: "low",
    description: "Native mobile application providing pension services, notifications, and document upload capabilities on iOS and Android.",
    impactScore: 6,
    problemStatement: "No native mobile experience exists. Mobile web experience is suboptimal for complex transactions and document uploads.",
    proposedSolution: "Develop cross-platform mobile app using React Native with biometric authentication, push notifications, and offline document capture.",
    targetUsers: ["UAE Nationals", "Retirees", "Active Contributors"],
    expectedOutcomes: [
      "50,000+ downloads in first 6 months",
      "4.5+ app store rating",
      "30% of transactions via mobile",
      "Push notification engagement rate > 40%",
    ],
    kpis: [
      { name: "App Downloads", target: "50K", baseline: "0" },
      { name: "Mobile Transactions", target: "30%", baseline: "0%" },
      { name: "App Rating", target: "4.5+", baseline: "N/A" },
    ],
    dependencies: ["Unified Digital Portal", "API Gateway", "Push Notification Service"],
    risks: [
      { title: "Fragmented device/OS landscape", severity: "low" },
      { title: "App store approval delays", severity: "low" },
    ],
    implementationNotes: "Depends on portal API completion. Start with read-only features, then add transactional capabilities. Must support Arabic RTL layout.",
  },
];

export default function ConceptSheetsPage() {
  const [selectedConcept, setSelectedConcept] = useState<ConceptSheet | null>(null);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Initiative Concept Sheets"
          description="Detailed concept notes for top-priority initiatives"
          actions={
            <Button variant="secondary" size="sm">
              <Sparkles size={16} />
              Generate AI Concept Sheet
            </Button>
          }
        />
      </motion.div>

      {/* Concept Cards Grid */}
      <motion.div variants={fadeUp} className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sampleConcepts.map((concept, idx) => {
          const pc = priorityConfig[concept.priority];
          return (
            <motion.div
              key={concept.id}
              variants={fadeUp}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="gold" size="sm">{concept.category}</Badge>
                  <Badge variant={pc.variant} size="sm" dot>{pc.label}</Badge>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-gold">{concept.impactScore}</span>
                </div>
              </div>

              <h3 className="font-playfair text-base font-semibold text-cream mb-2">
                {concept.title}
              </h3>
              <p className="text-sm text-gray-muted line-clamp-2 mb-4 flex-1">
                {concept.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex gap-3 text-xs text-gray-muted">
                  <span className="flex items-center gap-1">
                    <Target size={11} />
                    {concept.kpis.length} KPIs
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={11} />
                    {concept.risks.length} risks
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConcept(concept)}
                >
                  <Eye size={14} />
                  View Details
                </Button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Concept Detail Modal */}
      <Modal
        isOpen={!!selectedConcept}
        onClose={() => setSelectedConcept(null)}
        title={selectedConcept?.title}
        size="xl"
      >
        {selectedConcept && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {/* Header badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="gold">{selectedConcept.category}</Badge>
              <Badge variant={priorityConfig[selectedConcept.priority].variant} dot>
                {priorityConfig[selectedConcept.priority].label}
              </Badge>
              <Badge variant="blue">Impact: {selectedConcept.impactScore}/10</Badge>
            </div>

            {/* Problem Statement */}
            <section>
              <h4 className="flex items-center gap-2 text-sm font-medium text-cream mb-2">
                <AlertTriangle size={14} className="text-red-400" />
                Problem Statement
              </h4>
              <p className="text-sm text-gray-muted leading-relaxed glass rounded-xl p-4">
                {selectedConcept.problemStatement}
              </p>
            </section>

            {/* Proposed Solution */}
            <section>
              <h4 className="flex items-center gap-2 text-sm font-medium text-cream mb-2">
                <CheckCircle2 size={14} className="text-green-400" />
                Proposed Solution
              </h4>
              <p className="text-sm text-gray-muted leading-relaxed glass rounded-xl p-4">
                {selectedConcept.proposedSolution}
              </p>
            </section>

            {/* Target Users */}
            <section>
              <h4 className="flex items-center gap-2 text-sm font-medium text-cream mb-2">
                <Users size={14} className="text-blue-400" />
                Target Users
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedConcept.targetUsers.map((user) => (
                  <Badge key={user} variant="blue" size="sm">{user}</Badge>
                ))}
              </div>
            </section>

            {/* Expected Outcomes */}
            <section>
              <h4 className="flex items-center gap-2 text-sm font-medium text-cream mb-2">
                <Target size={14} className="text-gold" />
                Expected Outcomes
              </h4>
              <ol className="space-y-1.5">
                {selectedConcept.expectedOutcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-muted">
                    <span className="mt-0.5 w-5 h-5 rounded-lg bg-gold/10 text-gold text-xs flex items-center justify-center shrink-0 font-medium">
                      {i + 1}
                    </span>
                    {outcome}
                  </li>
                ))}
              </ol>
            </section>

            {/* KPIs */}
            <section>
              <h4 className="flex items-center gap-2 text-sm font-medium text-cream mb-2">
                <BarChart3 size={14} className="text-gold" />
                Key Performance Indicators
              </h4>
              <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left p-3 text-xs uppercase tracking-wide text-gray-muted font-medium">KPI</th>
                      <th className="text-center p-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Baseline</th>
                      <th className="text-center p-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Target</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedConcept.kpis.map((kpi) => (
                      <tr key={kpi.name} className="border-b border-white/5 last:border-0">
                        <td className="p-3 text-cream">{kpi.name}</td>
                        <td className="p-3 text-center text-gray-muted">{kpi.baseline}</td>
                        <td className="p-3 text-center font-medium text-gold">{kpi.target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Dependencies */}
            <section>
              <h4 className="flex items-center gap-2 text-sm font-medium text-cream mb-2">
                <Link2 size={14} className="text-blue-400" />
                Dependencies
              </h4>
              <ul className="space-y-1.5">
                {selectedConcept.dependencies.map((dep) => (
                  <li key={dep} className="flex items-center gap-2 text-sm text-gray-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400/60 shrink-0" />
                    {dep}
                  </li>
                ))}
              </ul>
            </section>

            {/* Risks */}
            <section>
              <h4 className="flex items-center gap-2 text-sm font-medium text-cream mb-2">
                <AlertTriangle size={14} className="text-red-400" />
                Risks
              </h4>
              <div className="space-y-2">
                {selectedConcept.risks.map((risk) => (
                  <div key={risk.title} className="flex items-center justify-between glass rounded-xl p-3">
                    <span className="text-sm text-gray-muted">{risk.title}</span>
                    <Badge
                      variant={risk.severity === "high" ? "red" : risk.severity === "medium" ? "gold" : "gray"}
                      size="sm"
                    >
                      {risk.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </section>

            {/* Implementation Notes */}
            <section>
              <h4 className="flex items-center gap-2 text-sm font-medium text-cream mb-2">
                <FileText size={14} className="text-gray-muted" />
                Implementation Notes
              </h4>
              <p className="text-sm text-gray-muted leading-relaxed glass rounded-xl p-4">
                {selectedConcept.implementationNotes}
              </p>
            </section>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
