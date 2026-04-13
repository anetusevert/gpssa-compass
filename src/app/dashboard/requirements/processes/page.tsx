"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Workflow,
  Sparkles,
  ArrowRight,
  Bot,
  Clock,
  User,
  Zap,
  TrendingDown,
  HeadphonesIcon,
  ShieldCheck,
  Settings,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const processCategoryTabs = [
  { id: "service", label: "Service Delivery", icon: HeadphonesIcon },
  { id: "customer", label: "Customer Journey", icon: Users },
  { id: "internal", label: "Internal Operations", icon: Settings },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
];

interface ProcessStep {
  name: string;
  duration: string;
  owner: string;
  automationPotential: "High" | "Medium" | "Low" | "None";
}

interface ProcessFlow {
  asIs: ProcessStep[];
  toBe: ProcessStep[];
}

const processFlows: Record<string, ProcessFlow> = {
  service: {
    asIs: [
      { name: "Request Received", duration: "1 day", owner: "Customer Service", automationPotential: "High" },
      { name: "Manual Verification", duration: "3 days", owner: "Operations", automationPotential: "High" },
      { name: "Document Review", duration: "2 days", owner: "Compliance", automationPotential: "Medium" },
      { name: "Approval Process", duration: "5 days", owner: "Management", automationPotential: "Medium" },
      { name: "Service Activation", duration: "2 days", owner: "IT", automationPotential: "High" },
      { name: "Confirmation Sent", duration: "1 day", owner: "Customer Service", automationPotential: "High" },
    ],
    toBe: [
      { name: "Digital Submission", duration: "Instant", owner: "Self-Service", automationPotential: "None" },
      { name: "Auto-Verification", duration: "5 min", owner: "AI Engine", automationPotential: "None" },
      { name: "Smart Review", duration: "1 hour", owner: "AI + Compliance", automationPotential: "None" },
      { name: "Auto-Approval", duration: "Instant", owner: "Rules Engine", automationPotential: "None" },
      { name: "Instant Activation", duration: "Instant", owner: "Platform", automationPotential: "None" },
      { name: "Real-time Notification", duration: "Instant", owner: "Platform", automationPotential: "None" },
    ],
  },
  customer: {
    asIs: [
      { name: "Inquiry via Phone/Visit", duration: "30 min", owner: "Front Desk", automationPotential: "High" },
      { name: "Information Gathering", duration: "1 day", owner: "Customer Service", automationPotential: "Medium" },
      { name: "Eligibility Check", duration: "2 days", owner: "Operations", automationPotential: "High" },
      { name: "Application Processing", duration: "5 days", owner: "Back Office", automationPotential: "Medium" },
      { name: "Decision & Notification", duration: "3 days", owner: "Management", automationPotential: "High" },
    ],
    toBe: [
      { name: "Omnichannel Inquiry", duration: "Instant", owner: "Digital Platform", automationPotential: "None" },
      { name: "AI-Assisted Guidance", duration: "5 min", owner: "Chatbot + Agent", automationPotential: "None" },
      { name: "Real-time Eligibility", duration: "Instant", owner: "Rules Engine", automationPotential: "None" },
      { name: "Automated Processing", duration: "1 hour", owner: "Workflow Engine", automationPotential: "None" },
      { name: "Instant Decision", duration: "Instant", owner: "AI + Platform", automationPotential: "None" },
    ],
  },
  internal: {
    asIs: [
      { name: "Paper-based Request", duration: "1 day", owner: "Requester", automationPotential: "High" },
      { name: "Manager Approval", duration: "3 days", owner: "Department Head", automationPotential: "Medium" },
      { name: "Budget Verification", duration: "2 days", owner: "Finance", automationPotential: "High" },
      { name: "Procurement", duration: "10 days", owner: "Procurement Team", automationPotential: "Medium" },
      { name: "Delivery & Receipt", duration: "5 days", owner: "Operations", automationPotential: "Low" },
    ],
    toBe: [
      { name: "Digital Request Form", duration: "5 min", owner: "Self-Service", automationPotential: "None" },
      { name: "Auto-Routing & Approval", duration: "1 hour", owner: "Workflow Engine", automationPotential: "None" },
      { name: "Real-time Budget Check", duration: "Instant", owner: "ERP System", automationPotential: "None" },
      { name: "e-Procurement", duration: "2 days", owner: "Procurement Platform", automationPotential: "None" },
      { name: "Digital Receipt & Track", duration: "1 day", owner: "Platform", automationPotential: "None" },
    ],
  },
  compliance: {
    asIs: [
      { name: "Manual Data Collection", duration: "5 days", owner: "Compliance Team", automationPotential: "High" },
      { name: "Spreadsheet Analysis", duration: "3 days", owner: "Analysts", automationPotential: "High" },
      { name: "Report Drafting", duration: "5 days", owner: "Compliance Officer", automationPotential: "Medium" },
      { name: "Review & Revision", duration: "5 days", owner: "Management", automationPotential: "Low" },
      { name: "Submission", duration: "2 days", owner: "Compliance Team", automationPotential: "High" },
    ],
    toBe: [
      { name: "Automated Data Pull", duration: "Instant", owner: "Integration Layer", automationPotential: "None" },
      { name: "AI-powered Analysis", duration: "1 hour", owner: "Analytics Engine", automationPotential: "None" },
      { name: "Auto-generated Report", duration: "30 min", owner: "AI + Templates", automationPotential: "None" },
      { name: "Digital Review", duration: "1 day", owner: "Management Portal", automationPotential: "None" },
      { name: "One-click Submission", duration: "Instant", owner: "RegTech Platform", automationPotential: "None" },
    ],
  },
};

const automationBadgeVariant: Record<string, "green" | "gold" | "gray" | "blue"> = {
  High: "green",
  Medium: "gold",
  Low: "gray",
  None: "blue",
};

interface AutomationOpportunity {
  process: string;
  currentEffort: string;
  potential: "High" | "Medium" | "Low";
  expectedSavings: string;
}

const automationOpportunities: AutomationOpportunity[] = [
  { process: "Document Verification", currentEffort: "120 hrs/month", potential: "High", expectedSavings: "85% effort reduction" },
  { process: "Eligibility Assessment", currentEffort: "200 hrs/month", potential: "High", expectedSavings: "90% effort reduction" },
  { process: "Report Generation", currentEffort: "80 hrs/month", potential: "High", expectedSavings: "75% effort reduction" },
  { process: "Data Entry & Validation", currentEffort: "160 hrs/month", potential: "High", expectedSavings: "95% effort reduction" },
  { process: "Email Correspondence", currentEffort: "100 hrs/month", potential: "Medium", expectedSavings: "60% effort reduction" },
  { process: "Meeting Scheduling", currentEffort: "40 hrs/month", potential: "Medium", expectedSavings: "80% effort reduction" },
  { process: "Approval Routing", currentEffort: "60 hrs/month", potential: "Medium", expectedSavings: "70% effort reduction" },
];

interface SLATarget {
  service: string;
  currentSLA: string;
  targetSLA: string;
  gap: string;
}

const slaTargets: SLATarget[] = [
  { service: "Pension Inquiry Response", currentSLA: "48 hours", targetSLA: "4 hours", gap: "-44 hours" },
  { service: "New Member Registration", currentSLA: "14 days", targetSLA: "1 day", gap: "-13 days" },
  { service: "Benefit Calculation", currentSLA: "10 days", targetSLA: "Instant", gap: "-10 days" },
  { service: "Complaint Resolution", currentSLA: "30 days", targetSLA: "5 days", gap: "-25 days" },
  { service: "Document Processing", currentSLA: "7 days", targetSLA: "1 hour", gap: "-~7 days" },
  { service: "System Uptime", currentSLA: "95%", targetSLA: "99.9%", gap: "-4.9%" },
];

export default function ProcessesPage() {
  const [activeCategory, setActiveCategory] = useState("service");
  const [flowView, setFlowView] = useState<"asIs" | "toBe">("asIs");

  const currentFlow = processFlows[activeCategory];
  const steps = currentFlow[flowView];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Process Architecture"
          description="Process mapping, automation opportunities, and SLA target definition."
          badge={{ label: "Requirements", variant: "blue" }}
          actions={
            <Button variant="secondary" size="sm">
              <Sparkles size={16} />
              Generate AI Process Map
            </Button>
          }
        />
      </motion.div>

      {/* Process Category Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs
          tabs={processCategoryTabs}
          activeTab={activeCategory}
          onChange={setActiveCategory}
          variant="pills"
        />
      </motion.div>

      {/* As-Is / To-Be Toggle */}
      <motion.div variants={fadeUp} className="flex gap-2">
        <button
          onClick={() => setFlowView("asIs")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            flowView === "asIs"
              ? "bg-gold/20 text-gold border border-gold/30"
              : "text-gray-muted hover:text-cream hover:bg-white/5 border border-transparent"
          }`}
        >
          As-Is Process
        </button>
        <button
          onClick={() => setFlowView("toBe")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            flowView === "toBe"
              ? "bg-adl-blue/20 text-adl-blue border border-adl-blue/30"
              : "text-gray-muted hover:text-cream hover:bg-white/5 border border-transparent"
          }`}
        >
          To-Be Process
        </button>
      </motion.div>

      {/* Process Flow */}
      <motion.div variants={fadeUp}>
        <div className="flex flex-wrap items-start gap-2">
          {steps.map((step, i) => (
            <div key={`${activeCategory}-${flowView}-${i}`} className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className={`glass-card p-4 w-48 shrink-0 ${flowView === "toBe" ? "border-adl-blue/20" : ""}`}
              >
                <p className="font-medium text-cream text-sm mb-2">{step.name}</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-gray-muted">
                    <Clock size={11} />
                    {step.duration}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-muted">
                    <User size={11} />
                    {step.owner}
                  </div>
                </div>
                {step.automationPotential !== "None" && (
                  <div className="mt-2">
                    <Badge variant={automationBadgeVariant[step.automationPotential]} size="sm">
                      <Bot size={10} /> {step.automationPotential}
                    </Badge>
                  </div>
                )}
              </motion.div>
              {i < steps.length - 1 && (
                <ArrowRight size={16} className="text-white/20 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Automation Opportunities */}
      <motion.div variants={fadeUp}>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Automation Opportunities</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automationOpportunities.map((opp, i) => (
            <motion.div
              key={opp.process}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-cream text-sm">{opp.process}</h3>
                <Badge variant={automationBadgeVariant[opp.potential]} size="sm" dot>
                  {opp.potential}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-muted">Current Effort</span>
                  <span className="text-cream font-medium">{opp.currentEffort}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-muted">Expected Savings</span>
                  <span className="text-gpssa-green font-medium flex items-center gap-1">
                    <TrendingDown size={11} />
                    {opp.expectedSavings}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* SLA Targets */}
      <motion.div variants={fadeUp}>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4">SLA Targets</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Service</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Current SLA</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Target SLA</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Gap</th>
                </tr>
              </thead>
              <tbody>
                {slaTargets.map((sla) => (
                  <tr key={sla.service} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-cream font-medium">{sla.service}</td>
                    <td className="px-5 py-3.5 text-gray-muted">{sla.currentSLA}</td>
                    <td className="px-5 py-3.5 text-adl-blue font-medium">{sla.targetSLA}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-red-400 font-medium">{sla.gap}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
