"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  Star,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
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

const radarData = [
  { dimension: "Digital Skills", current: 2.2, needed: 4.5 },
  { dimension: "Data Analytics", current: 1.8, needed: 4.2 },
  { dimension: "Service Design", current: 2.5, needed: 4.0 },
  { dimension: "Project Mgmt", current: 3.2, needed: 4.3 },
  { dimension: "Change Mgmt", current: 2.0, needed: 4.0 },
  { dimension: "Innovation", current: 1.5, needed: 4.5 },
];

interface Capability {
  name: string;
  current: number;
  target: number;
  priority: "High" | "Medium" | "Low";
  description: string;
}

const capabilities: Capability[] = [
  { name: "Cloud & Infrastructure", current: 2, target: 5, priority: "High", description: "Azure, AWS, hybrid cloud architecture and operations" },
  { name: "Data Engineering", current: 1, target: 4, priority: "High", description: "ETL pipelines, data modeling, lakehouse architecture" },
  { name: "Machine Learning & AI", current: 1, target: 4, priority: "High", description: "Model development, MLOps, NLP, computer vision" },
  { name: "UX/UI Design", current: 2, target: 4, priority: "Medium", description: "User research, interaction design, design systems" },
  { name: "Agile Delivery", current: 3, target: 5, priority: "Medium", description: "Scrum, Kanban, SAFe, product-centric delivery" },
  { name: "Cybersecurity", current: 2, target: 5, priority: "High", description: "Zero-trust, threat detection, compliance frameworks" },
  { name: "API & Integration", current: 2, target: 4, priority: "Medium", description: "REST/GraphQL APIs, event-driven architecture" },
  { name: "Business Analysis", current: 3, target: 4, priority: "Low", description: "Requirements elicitation, process modeling, stakeholder management" },
  { name: "DevOps & SRE", current: 1, target: 4, priority: "High", description: "CI/CD, IaC, monitoring, incident response" },
];

const priorityVariant: Record<string, "red" | "gold" | "blue"> = {
  High: "red",
  Medium: "gold",
  Low: "blue",
};

interface TrainingProgram {
  name: string;
  quarter: string;
  duration: string;
  targetAudience: string;
  ftes: number;
}

const trainingPrograms: TrainingProgram[] = [
  { name: "Cloud Foundations (Azure AZ-900)", quarter: "Q1 2025", duration: "4 weeks", targetAudience: "IT Team", ftes: 15 },
  { name: "Data Analytics Bootcamp", quarter: "Q1 2025", duration: "8 weeks", targetAudience: "All Departments", ftes: 30 },
  { name: "Agile & Scrum Certification", quarter: "Q2 2025", duration: "2 weeks", targetAudience: "Project Leads", ftes: 12 },
  { name: "UX Design Thinking Workshop", quarter: "Q2 2025", duration: "3 weeks", targetAudience: "Product & CS", ftes: 20 },
  { name: "Cybersecurity Awareness", quarter: "Q3 2025", duration: "1 week", targetAudience: "Organization-wide", ftes: 180 },
  { name: "AI/ML Practitioner Program", quarter: "Q3 2025", duration: "12 weeks", targetAudience: "Data & IT", ftes: 8 },
  { name: "DevOps Engineering Path", quarter: "Q4 2025", duration: "10 weeks", targetAudience: "Engineering", ftes: 10 },
  { name: "Leadership & Change Mgmt", quarter: "Q4 2025", duration: "6 weeks", targetAudience: "Management", ftes: 25 },
];

function SkillDots({ level, max = 5, color = "bg-adl-blue" }: { level: number; max?: number; color?: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i < level ? color : "bg-white/10"}`}
        />
      ))}
    </div>
  );
}

export default function CapabilitiesPage() {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? capabilities : capabilities.slice(0, 6);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Capability Framework"
          description="Skills gap analysis, capability maturity assessment, and training roadmap for organizational readiness."
          badge={{ label: "Requirements", variant: "blue" }}
          actions={
            <Button variant="secondary" size="sm">
              <Sparkles size={16} />
              Generate AI Capability Assessment
            </Button>
          }
        />
      </motion.div>

      {/* Radar Chart */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Skills Gap Analysis</h2>
        <div className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: "#8A9BB0", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tick={{ fill: "#8A9BB0", fontSize: 10 }}
                tickCount={6}
              />
              <Radar
                name="Current Level"
                dataKey="current"
                stroke="#C5A572"
                fill="#C5A572"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Radar
                name="Needed Level"
                dataKey="needed"
                stroke="#2D4A8C"
                fill="#2D4A8C"
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#8A9BB0" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Capability Cards */}
      <motion.div variants={fadeUp}>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Capability Maturity</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((cap, i) => {
            const gap = cap.target - cap.current;
            return (
              <motion.div
                key={cap.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-cream text-sm">{cap.name}</h3>
                  <Badge variant={priorityVariant[cap.priority]} size="sm">{cap.priority}</Badge>
                </div>
                <p className="text-xs text-gray-muted mb-4">{cap.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-muted">Current</span>
                    <SkillDots level={cap.current} color="bg-gold" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-muted">Target</span>
                    <SkillDots level={cap.target} color="bg-adl-blue" />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs text-gray-muted">Gap</span>
                  <span className={`text-sm font-bold ${gap >= 3 ? "text-red-400" : gap >= 2 ? "text-gold" : "text-gpssa-green"}`}>
                    +{gap} levels
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
        {capabilities.length > 6 && (
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" onClick={() => setShowAll(!showAll)}>
              {showAll ? "Show Less" : `Show All ${capabilities.length} Capabilities`}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Training Roadmap */}
      <motion.div variants={fadeUp}>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Training Roadmap</h2>

        {/* Timeline */}
        <div className="relative mb-6">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-adl-blue/20" />
          <div className="space-y-4">
            {trainingPrograms.map((prog, i) => (
              <motion.div
                key={prog.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-start gap-4 pl-0"
              >
                <div className="shrink-0 w-8 flex justify-center relative z-10">
                  <div className="w-3 h-3 rounded-full bg-adl-blue/30 border-2 border-adl-blue mt-1" />
                </div>
                <div className="glass-card p-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-cream text-sm">{prog.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {prog.quarter}
                        </span>
                        <span>{prog.duration}</span>
                      </div>
                    </div>
                    <Badge variant="blue" size="sm">{prog.targetAudience}</Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FTE Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Program</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Quarter</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Duration</th>
                  <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">Audience</th>
                  <th className="text-right px-5 py-3 text-xs uppercase tracking-wide text-gray-muted font-medium">FTEs</th>
                </tr>
              </thead>
              <tbody>
                {trainingPrograms.map((prog) => (
                  <tr key={prog.name} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3 text-cream font-medium">{prog.name}</td>
                    <td className="px-5 py-3 text-gray-muted">{prog.quarter}</td>
                    <td className="px-5 py-3 text-gray-muted">{prog.duration}</td>
                    <td className="px-5 py-3 text-gray-muted">{prog.targetAudience}</td>
                    <td className="px-5 py-3 text-right font-medium text-cream tabular-nums">
                      <span className="flex items-center justify-end gap-1">
                        <Users size={12} className="text-adl-blue" />
                        {prog.ftes}
                      </span>
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
