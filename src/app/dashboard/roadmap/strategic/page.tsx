"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileDown,
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  GitBranch,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Initiative {
  id: string;
  title: string;
  status: "planned" | "in-progress" | "completed" | "at-risk";
  owner: string;
  dependencies: string[];
}

interface Phase {
  id: string;
  name: string;
  subtitle: string;
  startMonth: number;
  endMonth: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  objectives: string[];
  initiatives: Initiative[];
}

const statusConfig: Record<string, { variant: "green" | "blue" | "gold" | "red" | "gray"; label: string }> = {
  planned: { variant: "gray", label: "Planned" },
  "in-progress": { variant: "blue", label: "In Progress" },
  completed: { variant: "green", label: "Completed" },
  "at-risk": { variant: "red", label: "At Risk" },
};

const phases: Phase[] = [
  {
    id: "p1",
    name: "Phase 1: Foundation",
    subtitle: "Months 1–3",
    startMonth: 1,
    endMonth: 3,
    color: "#3b82f6",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    objectives: [
      "Establish governance framework",
      "Complete technology audit",
      "Define service taxonomy",
      "Set baseline KPIs",
    ],
    initiatives: [
      { id: "i1", title: "Governance Framework Setup", status: "completed", owner: "PMO Lead", dependencies: [] },
      { id: "i2", title: "Technology Stack Assessment", status: "in-progress", owner: "CTO Office", dependencies: [] },
      { id: "i3", title: "Service Catalog Mapping", status: "in-progress", owner: "Service Design", dependencies: ["i1"] },
      { id: "i4", title: "KPI Baseline Study", status: "planned", owner: "Analytics Team", dependencies: ["i1"] },
    ],
  },
  {
    id: "p2",
    name: "Phase 2: Quick Wins",
    subtitle: "Months 3–6",
    startMonth: 3,
    endMonth: 6,
    color: "#22c55e",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    textColor: "text-green-400",
    objectives: [
      "Launch digital portal MVP",
      "Automate top 5 processes",
      "Implement CRM foundation",
      "Deploy self-service kiosks",
    ],
    initiatives: [
      { id: "i5", title: "Digital Portal MVP", status: "in-progress", owner: "Digital Team", dependencies: ["i2"] },
      { id: "i6", title: "Process Automation Wave 1", status: "planned", owner: "Ops Lead", dependencies: ["i3"] },
      { id: "i7", title: "CRM Platform Setup", status: "at-risk", owner: "IT Director", dependencies: ["i2"] },
      { id: "i8", title: "Self-Service Kiosk Pilot", status: "planned", owner: "Branch Ops", dependencies: ["i5"] },
    ],
  },
  {
    id: "p3",
    name: "Phase 3: Transformation",
    subtitle: "Months 6–9",
    startMonth: 6,
    endMonth: 9,
    color: "#d4a843",
    bgColor: "bg-gold/10",
    borderColor: "border-gold/30",
    textColor: "text-gold",
    objectives: [
      "Full digital channel rollout",
      "AI-powered service delivery",
      "Integrated analytics dashboard",
      "Employee training program",
    ],
    initiatives: [
      { id: "i9", title: "Omnichannel Integration", status: "planned", owner: "Digital Team", dependencies: ["i5", "i7"] },
      { id: "i10", title: "AI Chatbot Deployment", status: "planned", owner: "AI Team", dependencies: ["i7"] },
      { id: "i11", title: "Analytics Dashboard v2", status: "planned", owner: "Analytics Team", dependencies: ["i4"] },
      { id: "i12", title: "Staff Training Program", status: "planned", owner: "HR Lead", dependencies: [] },
    ],
  },
  {
    id: "p4",
    name: "Phase 4: Optimization",
    subtitle: "Months 9–12",
    startMonth: 9,
    endMonth: 12,
    color: "#a855f7",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
    objectives: [
      "Continuous improvement cycles",
      "Advanced predictive analytics",
      "Full mobile app launch",
      "Performance optimization",
    ],
    initiatives: [
      { id: "i13", title: "Mobile App Launch", status: "planned", owner: "Mobile Team", dependencies: ["i9"] },
      { id: "i14", title: "Predictive Analytics Engine", status: "planned", owner: "Data Science", dependencies: ["i11"] },
      { id: "i15", title: "Performance Tuning Sprint", status: "planned", owner: "Engineering", dependencies: ["i9", "i10"] },
      { id: "i16", title: "Continuous Improvement Framework", status: "planned", owner: "PMO Lead", dependencies: ["i12"] },
    ],
  },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const allInitiatives = phases.flatMap((p) => p.initiatives);
const stats = {
  total: allInitiatives.length,
  onTrack: allInitiatives.filter((i) => i.status === "in-progress" || i.status === "completed").length,
  atRisk: allInitiatives.filter((i) => i.status === "at-risk").length,
  completed: allInitiatives.filter((i) => i.status === "completed").length,
};

export default function StrategicRoadmapPage() {
  const [expandedPhase, setExpandedPhase] = useState<string | null>("p1");

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Strategic Roadmap"
          description="12-month phased implementation plan"
          actions={
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                <Sparkles size={16} />
                Generate AI Roadmap
              </Button>
              <Button variant="secondary" size="sm">
                <FileDown size={16} />
                Export PDF
              </Button>
            </div>
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Initiatives" value={stats.total} icon={Target} trend="neutral" />
        <StatCard label="On Track" value={stats.onTrack} icon={Clock} trend="up" change="+2" />
        <StatCard label="At Risk" value={stats.atRisk} icon={AlertCircle} trend="down" change="1" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} trend="up" change="+1" />
      </motion.div>

      {/* Timeline / Gantt */}
      <motion.div variants={fadeUp} className="glass-card p-6 overflow-x-auto">
        <h2 className="font-playfair text-lg font-semibold text-cream mb-6">
          12-Month Timeline
        </h2>

        <div className="min-w-[700px]">
          {/* Month headers */}
          <div className="flex">
            <div className="w-48 shrink-0" />
            <div className="flex-1 grid grid-cols-12 gap-px">
              {months.map((m) => (
                <div key={m} className="text-center text-xs text-gray-muted py-2">
                  {m}
                </div>
              ))}
            </div>
          </div>

          {/* Phase lanes */}
          <div className="space-y-3 mt-2">
            {phases.map((phase) => (
              <div key={phase.id} className="flex items-center">
                <div className="w-48 shrink-0 pr-4">
                  <p className={`text-sm font-medium ${phase.textColor} truncate`}>
                    {phase.name.replace("Phase ", "P")}
                  </p>
                  <p className="text-xs text-gray-muted">{phase.subtitle}</p>
                </div>
                <div className="flex-1 grid grid-cols-12 gap-px relative h-10">
                  {/* Background grid cells */}
                  {months.map((_, i) => (
                    <div
                      key={i}
                      className="border border-white/5 rounded-sm"
                    />
                  ))}
                  {/* Phase bar overlay */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="absolute top-1 bottom-1 rounded-lg flex items-center px-3"
                    style={{
                      left: `${((phase.startMonth - 1) / 12) * 100}%`,
                      width: `${((phase.endMonth - phase.startMonth + 1) / 12) * 100}%`,
                      backgroundColor: `${phase.color}20`,
                      border: `1px solid ${phase.color}50`,
                      transformOrigin: "left",
                    }}
                  >
                    <span className="text-xs font-medium truncate" style={{ color: phase.color }}>
                      {phase.initiatives.length} initiatives
                    </span>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Phase Detail Cards */}
      <motion.div variants={fadeUp} className="space-y-4">
        <h2 className="font-playfair text-lg font-semibold text-cream">
          Phase Details
        </h2>

        {phases.map((phase, phaseIdx) => {
          const isExpanded = expandedPhase === phase.id;
          return (
            <motion.div
              key={phase.id}
              variants={fadeUp}
              className={`glass-card overflow-hidden border ${phase.borderColor}`}
            >
              {/* Phase header */}
              <button
                onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${phase.color}20`, color: phase.color }}
                  >
                    {phaseIdx + 1}
                  </div>
                  <div>
                    <h3 className="font-playfair font-semibold text-cream">
                      {phase.name}
                    </h3>
                    <p className="text-sm text-gray-muted">{phase.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="gold" size="sm">
                    {phase.initiatives.length} initiatives
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-gray-muted" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-muted" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-white/5"
                >
                  <div className="p-5 grid lg:grid-cols-2 gap-6">
                    {/* Objectives */}
                    <div>
                      <h4 className="text-sm font-medium text-cream mb-3 flex items-center gap-2">
                        <Target size={14} className="text-gold" />
                        Objectives
                      </h4>
                      <ul className="space-y-2">
                        {phase.objectives.map((obj, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-muted">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gold/60 shrink-0" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Initiatives */}
                    <div>
                      <h4 className="text-sm font-medium text-cream mb-3 flex items-center gap-2">
                        <GitBranch size={14} className="text-gold" />
                        Initiatives
                      </h4>
                      <div className="space-y-2">
                        {phase.initiatives.map((init) => {
                          const sc = statusConfig[init.status];
                          return (
                            <div
                              key={init.id}
                              className="glass rounded-xl p-3 flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-cream truncate">
                                  {init.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="flex items-center gap-1 text-xs text-gray-muted">
                                    <User size={11} />
                                    {init.owner}
                                  </span>
                                  {init.dependencies.length > 0 && (
                                    <span className="text-xs text-gray-muted">
                                      {init.dependencies.length} dep{init.dependencies.length > 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Badge variant={sc.variant} size="sm" dot>
                                {sc.label}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
