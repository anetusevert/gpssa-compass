"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Sparkles,
  ArrowRight,
  UserCheck,
  Briefcase,
  Target,
  MessageSquare,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

interface Department {
  name: string;
  head: string;
  roles: number;
  icon: React.ElementType;
}

const departments: Department[] = [
  { name: "Operations", head: "VP Operations", roles: 85, icon: Briefcase },
  { name: "Information Technology", head: "CIO", roles: 32, icon: Building2 },
  { name: "Customer Service", head: "Director CS", roles: 64, icon: MessageSquare },
  { name: "Product & Innovation", head: "VP Product", roles: 18, icon: Target },
  { name: "Strategy & Planning", head: "CSO", roles: 12, icon: Target },
];

interface FutureUnit {
  name: string;
  description: string;
  keyRoles: string[];
  headcount: string;
}

const futureUnits: FutureUnit[] = [
  {
    name: "Digital Products & Channels",
    description: "Own end-to-end digital product lifecycle — mobile, web, API-based services.",
    keyRoles: ["Product Owner", "UX Designer", "Digital Analyst", "Channel Manager"],
    headcount: "22 FTEs",
  },
  {
    name: "Data & AI Center of Excellence",
    description: "Central hub for analytics, ML models, data governance, and AI-driven automation.",
    keyRoles: ["Chief Data Officer", "Data Engineer", "ML Engineer", "Data Steward"],
    headcount: "15 FTEs",
  },
  {
    name: "Customer Experience Lab",
    description: "Research, design, and continuously improve member journeys across all touchpoints.",
    keyRoles: ["CX Director", "Service Designer", "Journey Analyst", "Voice-of-Customer Lead"],
    headcount: "10 FTEs",
  },
  {
    name: "Platform Engineering",
    description: "Build and maintain the foundational tech platform — cloud, APIs, security, DevOps.",
    keyRoles: ["Platform Lead", "Cloud Architect", "SRE", "Security Engineer"],
    headcount: "18 FTEs",
  },
];

interface RACIRow {
  activity: string;
  digitalProducts: string;
  dataAI: string;
  cxLab: string;
  platformEng: string;
  operations: string;
}

const raciMatrix: RACIRow[] = [
  { activity: "Digital Service Launch", digitalProducts: "R", dataAI: "C", cxLab: "C", platformEng: "A", operations: "I" },
  { activity: "Data Governance Policy", digitalProducts: "C", dataAI: "R", cxLab: "I", platformEng: "C", operations: "A" },
  { activity: "Customer Journey Redesign", digitalProducts: "C", dataAI: "C", cxLab: "R", platformEng: "I", operations: "A" },
  { activity: "Cloud Migration Execution", digitalProducts: "I", dataAI: "C", cxLab: "I", platformEng: "R", operations: "A" },
  { activity: "AI Model Deployment", digitalProducts: "C", dataAI: "R", cxLab: "I", platformEng: "A", operations: "I" },
  { activity: "Process Automation", digitalProducts: "C", dataAI: "A", cxLab: "I", platformEng: "R", operations: "C" },
];

interface Stakeholder {
  name: string;
  role: string;
  interest: "High" | "Medium" | "Low";
  engagement: string;
}

const stakeholders: Stakeholder[] = [
  { name: "Board of Directors", role: "Strategic Oversight", interest: "High", engagement: "Quarterly transformation updates, milestone approvals" },
  { name: "Director General", role: "Executive Sponsor", interest: "High", engagement: "Bi-weekly steering, budget holder, change champion" },
  { name: "Department Heads", role: "Transformation Leads", interest: "High", engagement: "Weekly progress reviews, resource allocation, risk escalation" },
  { name: "IT Leadership", role: "Technical Authority", interest: "High", engagement: "Architecture decisions, vendor management, security compliance" },
  { name: "Front-line Staff", role: "End Users", interest: "Medium", engagement: "Training programs, feedback loops, pilot participation" },
  { name: "External Partners", role: "Service Providers", interest: "Medium", engagement: "SLA management, integration workshops, co-innovation" },
];

const raciColors: Record<string, string> = {
  R: "bg-adl-blue/20 text-adl-blue border-adl-blue/30",
  A: "bg-gpssa-green/20 text-gpssa-green border-gpssa-green/30",
  C: "bg-gold/20 text-gold border-gold/30",
  I: "bg-gray-muted/15 text-gray-muted border-gray-muted/20",
};

export default function OrganizationPage() {
  const [view, setView] = useState<"current" | "future">("current");

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Organizational Design"
          description="Current structure analysis, future-state model, and stakeholder engagement strategy."
          badge={{ label: "Requirements", variant: "blue" }}
          actions={
            <Button variant="secondary" size="sm">
              <Sparkles size={16} />
              Generate AI Org Design
            </Button>
          }
        />
      </motion.div>

      {/* View Toggle */}
      <motion.div variants={fadeUp} className="flex gap-2">
        <button
          onClick={() => setView("current")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            view === "current"
              ? "bg-adl-blue/20 text-adl-blue border border-adl-blue/30"
              : "text-gray-muted hover:text-cream hover:bg-white/5 border border-transparent"
          }`}
        >
          Current Structure
        </button>
        <button
          onClick={() => setView("future")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            view === "future"
              ? "bg-adl-blue/20 text-adl-blue border border-adl-blue/30"
              : "text-gray-muted hover:text-cream hover:bg-white/5 border border-transparent"
          }`}
        >
          Future State
        </button>
      </motion.div>

      {view === "current" ? (
        /* Current Org Structure */
        <motion.div variants={fadeUp} key="current">
          <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Current Organizational Hierarchy</h2>

          {/* CEO Card */}
          <div className="flex flex-col items-center mb-6">
            <div className="glass-card p-5 w-64 text-center glow-blue">
              <div className="p-2.5 rounded-xl bg-adl-blue/10 inline-flex mb-2">
                <UserCheck size={22} className="text-adl-blue" />
              </div>
              <p className="font-playfair font-semibold text-cream">Chief Executive Officer</p>
              <p className="text-xs text-gray-muted mt-1">Executive Leadership</p>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <ArrowRight size={14} className="text-white/20 rotate-90" />
          </div>

          {/* Departments */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {departments.map((dept, i) => {
              const Icon = dept.icon;
              return (
                <motion.div
                  key={dept.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-4 text-center"
                >
                  <div className="p-2 rounded-xl bg-white/5 inline-flex mb-2">
                    <Icon size={18} className="text-gray-muted" />
                  </div>
                  <p className="font-medium text-cream text-sm">{dept.name}</p>
                  <p className="text-xs text-gray-muted mt-1">{dept.head}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Users size={12} className="text-adl-blue" />
                    <span className="text-xs text-adl-blue font-medium">{dept.roles} roles</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        /* Future State */
        <motion.div variants={stagger} initial="hidden" animate="show" key="future" className="space-y-8">
          {/* AI-suggested Units */}
          <motion.div variants={fadeUp}>
            <h2 className="font-playfair text-lg font-semibold text-cream mb-4">
              Proposed Organizational Units
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {futureUnits.map((unit, i) => (
                <motion.div
                  key={unit.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-playfair font-semibold text-cream">{unit.name}</h3>
                    <Badge variant="blue" size="sm">{unit.headcount}</Badge>
                  </div>
                  <p className="text-sm text-gray-muted mb-4">{unit.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {unit.keyRoles.map((role) => (
                      <span key={role} className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-cream/70 border border-white/5">
                        {role}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RACI Matrix */}
          <motion.div variants={fadeUp}>
            <h2 className="font-playfair text-lg font-semibold text-cream mb-4">RACI Matrix</h2>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Activity</th>
                      <th className="text-center px-3 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Digital Products</th>
                      <th className="text-center px-3 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Data & AI</th>
                      <th className="text-center px-3 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">CX Lab</th>
                      <th className="text-center px-3 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Platform Eng.</th>
                      <th className="text-center px-3 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raciMatrix.map((row) => (
                      <tr key={row.activity} className="border-b border-white/5 last:border-0">
                        <td className="px-5 py-3 text-cream font-medium">{row.activity}</td>
                        {[row.digitalProducts, row.dataAI, row.cxLab, row.platformEng, row.operations].map((val, j) => (
                          <td key={j} className="px-3 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border ${raciColors[val]}`}>
                              {val}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 px-5 py-3 border-t border-white/5">
                {[
                  { key: "R", label: "Responsible" },
                  { key: "A", label: "Accountable" },
                  { key: "C", label: "Consulted" },
                  { key: "I", label: "Informed" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold border ${raciColors[item.key]}`}>
                      {item.key}
                    </span>
                    <span className="text-xs text-gray-muted">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stakeholder Engagement */}
          <motion.div variants={fadeUp}>
            <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Stakeholder Engagement Model</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stakeholders.map((sh, i) => (
                <motion.div
                  key={sh.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-cream">{sh.name}</h3>
                    <Badge
                      variant={sh.interest === "High" ? "blue" : sh.interest === "Medium" ? "gold" : "gray"}
                      size="sm"
                      dot
                    >
                      {sh.interest} Interest
                    </Badge>
                  </div>
                  <p className="text-xs text-adl-blue font-medium mb-2">{sh.role}</p>
                  <p className="text-sm text-gray-muted">{sh.engagement}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
