"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Server,
  Cloud,
  Database,
  Link2,
  ShieldCheck,
  GitBranch,
  Sparkles,
  AlertTriangle,
  DollarSign,
  Clock,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
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

const priorityVariant: Record<string, "red" | "gold" | "blue"> = {
  High: "red",
  Medium: "gold",
  Low: "blue",
};

const statusVariant: Record<string, "blue" | "gold" | "green"> = {
  Identified: "blue",
  "In Progress": "gold",
  Complete: "green",
};

interface TechCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  currentState: string;
  targetState: string;
  gapAnalysis: string;
  priority: "High" | "Medium" | "Low";
}

const techCategories: TechCategory[] = [
  {
    id: "cloud",
    name: "Cloud Infrastructure",
    icon: Cloud,
    currentState: "On-premises data center with limited virtualization. Legacy servers running critical workloads.",
    targetState: "Hybrid cloud architecture with Azure as primary provider. Auto-scaling, geo-redundancy, 99.9% uptime.",
    gapAnalysis: "No cloud migration plan exists. Skills gap in cloud operations. Need network redesign for hybrid connectivity.",
    priority: "High",
  },
  {
    id: "data",
    name: "Data Platform",
    icon: Database,
    currentState: "Siloed databases across departments. Manual reporting with Excel-based analytics.",
    targetState: "Unified data lakehouse with real-time analytics, self-service BI, and AI/ML pipelines.",
    gapAnalysis: "Data governance framework absent. No data catalog. ETL processes are manual and error-prone.",
    priority: "High",
  },
  {
    id: "integration",
    name: "Integration Layer",
    icon: Link2,
    currentState: "Point-to-point integrations. FTP-based file transfers. Limited API exposure.",
    targetState: "Enterprise API gateway with event-driven architecture. Real-time integration bus.",
    gapAnalysis: "No API strategy. Missing middleware layer. Need iPaaS evaluation and vendor selection.",
    priority: "Medium",
  },
  {
    id: "security",
    name: "Security & Compliance",
    icon: ShieldCheck,
    currentState: "Basic perimeter security. Password-based authentication. Annual compliance audits.",
    targetState: "Zero-trust architecture. MFA everywhere. Continuous compliance monitoring. SOC 2 certified.",
    gapAnalysis: "IAM modernization needed. No SIEM/SOAR solution. Encryption at rest not fully implemented.",
    priority: "High",
  },
  {
    id: "devops",
    name: "DevOps & Automation",
    icon: GitBranch,
    currentState: "Manual deployments. Limited version control adoption. No CI/CD pipelines.",
    targetState: "Full CI/CD with automated testing. Infrastructure-as-Code. Container orchestration with Kubernetes.",
    gapAnalysis: "DevOps culture not established. Need toolchain selection. Training required for engineering teams.",
    priority: "Medium",
  },
];

interface Requirement {
  name: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Identified" | "In Progress" | "Complete";
  costEstimate: string;
}

const requirements: Requirement[] = [
  { name: "Azure Landing Zone Setup", category: "Cloud Infrastructure", priority: "High", status: "Identified", costEstimate: "$450K" },
  { name: "Data Warehouse Migration", category: "Data Platform", priority: "High", status: "In Progress", costEstimate: "$380K" },
  { name: "API Management Platform", category: "Integration", priority: "Medium", status: "Identified", costEstimate: "$180K" },
  { name: "Identity & Access Management", category: "Security", priority: "High", status: "In Progress", costEstimate: "$220K" },
  { name: "CI/CD Pipeline Implementation", category: "DevOps", priority: "Medium", status: "Identified", costEstimate: "$150K" },
  { name: "Network Architecture Redesign", category: "Cloud Infrastructure", priority: "High", status: "Identified", costEstimate: "$280K" },
  { name: "Data Governance Framework", category: "Data Platform", priority: "High", status: "Identified", costEstimate: "$120K" },
  { name: "SIEM/SOAR Deployment", category: "Security", priority: "Medium", status: "Identified", costEstimate: "$200K" },
  { name: "Container Platform (K8s)", category: "DevOps", priority: "Low", status: "Identified", costEstimate: "$160K" },
  { name: "Event Bus Architecture", category: "Integration", priority: "Low", status: "Identified", costEstimate: "$140K" },
];

export default function InfrastructurePage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("cloud");

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Infrastructure Assessment"
          description="Technology requirements matrix — current state analysis, target architecture, and gap identification."
          badge={{ label: "Requirements", variant: "blue" }}
          actions={
            <Button variant="secondary" size="sm">
              <Sparkles size={16} />
              Generate AI Assessment
            </Button>
          }
        />
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Server} label="Total Requirements" value={requirements.length} trend="neutral" />
        <StatCard icon={AlertTriangle} label="Critical Gaps" value={5} trend="up" change="3 new" />
        <StatCard icon={DollarSign} label="Estimated Cost" value="$2.28M" trend="neutral" />
        <StatCard icon={Clock} label="Timeline" value="18 mo" trend="neutral" />
      </motion.div>

      {/* Technology Requirements Matrix */}
      <motion.div variants={fadeUp}>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Technology Requirements Matrix</h2>
        <div className="space-y-3">
          {techCategories.map((cat) => {
            const Icon = cat.icon;
            const isExpanded = expandedCategory === cat.id;

            return (
              <motion.div
                key={cat.id}
                layout
                className="glass-card overflow-hidden"
              >
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-adl-blue/10">
                      <Icon size={20} className="text-adl-blue" />
                    </div>
                    <span className="font-medium text-cream">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={priorityVariant[cat.priority]} size="sm">{cat.priority}</Badge>
                    <ChevronRight
                      size={16}
                      className={`text-gray-muted transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-5 pb-5 border-t border-white/5"
                  >
                    <div className="grid md:grid-cols-3 gap-4 pt-4">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-gray-muted font-medium">Current State</p>
                        <p className="text-sm text-cream/80">{cat.currentState}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-adl-blue font-medium">Target State</p>
                        <p className="text-sm text-cream/80">{cat.targetState}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-wide text-gold font-medium">Gap Analysis</p>
                        <p className="text-sm text-cream/80">{cat.gapAnalysis}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Requirements Table */}
      <motion.div variants={fadeUp}>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Requirements Detail</h2>
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Category</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Priority</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Status</th>
                  <th className="text-right px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Cost Est.</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map((req, i) => (
                  <motion.tr
                    key={req.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5 text-cream font-medium">{req.name}</td>
                    <td className="px-5 py-3.5 text-gray-muted">{req.category}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={priorityVariant[req.priority]} size="sm" dot>{req.priority}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusVariant[req.status]} size="sm">{req.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right text-cream font-medium tabular-nums">{req.costEstimate}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
