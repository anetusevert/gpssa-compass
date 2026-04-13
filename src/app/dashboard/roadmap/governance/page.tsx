"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Target,
  TrendingUp,
  Clock,
  Users,
  Zap,
  CheckCircle2,
  Shield,
  Calendar,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/ui/PageHeader";
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

interface KPIRecord {
  id: string;
  name: string;
  category: string;
  target: string;
  actual: string;
  unit: string;
  frequency: string;
  owner: string;
  status: "on-track" | "at-risk" | "off-track";
  trend: "up" | "down" | "neutral";
}

const kpiStatCards = [
  { label: "Customer Satisfaction", value: "4.2/5", change: "+0.3", icon: Users, trend: "up" as const },
  { label: "Service Fulfillment Time", value: "3.2 days", change: "-1.5d", icon: Clock, trend: "up" as const },
  { label: "Digital Adoption", value: "42%", change: "+12%", icon: TrendingUp, trend: "up" as const },
  { label: "Process Efficiency", value: "78%", change: "+8%", icon: Zap, trend: "up" as const },
  { label: "SLA Compliance", value: "94%", change: "+2%", icon: Shield, trend: "up" as const },
  { label: "Innovation Index", value: "6.8/10", change: "+1.2", icon: Target, trend: "up" as const },
];

const kpiTable: KPIRecord[] = [
  { id: "k1", name: "Customer Satisfaction Score", category: "Customer", target: "4.5", actual: "4.2", unit: "/5", frequency: "Monthly", owner: "CX Director", status: "at-risk", trend: "up" },
  { id: "k2", name: "Average Service Fulfillment Time", category: "Operational", target: "2 days", actual: "3.2 days", unit: "days", frequency: "Weekly", owner: "Ops Manager", status: "off-track", trend: "up" },
  { id: "k3", name: "Digital Channel Adoption", category: "Digital", target: "60%", actual: "42%", unit: "%", frequency: "Monthly", owner: "Digital Lead", status: "at-risk", trend: "up" },
  { id: "k4", name: "Process Automation Rate", category: "Operational", target: "70%", actual: "78%", unit: "%", frequency: "Quarterly", owner: "Automation Lead", status: "on-track", trend: "up" },
  { id: "k5", name: "SLA Compliance Rate", category: "Operational", target: "95%", actual: "94%", unit: "%", frequency: "Weekly", owner: "Quality Lead", status: "at-risk", trend: "up" },
  { id: "k6", name: "Employee NPS", category: "People", target: "50", actual: "42", unit: "score", frequency: "Quarterly", owner: "HR Director", status: "at-risk", trend: "up" },
  { id: "k7", name: "Innovation Pipeline Score", category: "Innovation", target: "8.0", actual: "6.8", unit: "/10", frequency: "Monthly", owner: "Innovation Lead", status: "at-risk", trend: "up" },
  { id: "k8", name: "System Uptime", category: "Technical", target: "99.9%", actual: "99.7%", unit: "%", frequency: "Daily", owner: "IT Ops", status: "on-track", trend: "neutral" },
  { id: "k9", name: "First Contact Resolution", category: "Customer", target: "85%", actual: "72%", unit: "%", frequency: "Weekly", owner: "Contact Center", status: "off-track", trend: "up" },
  { id: "k10", name: "Cost per Transaction", category: "Financial", target: "AED 15", actual: "AED 22", unit: "AED", frequency: "Monthly", owner: "Finance Lead", status: "off-track", trend: "down" },
];

const statusBadge: Record<string, { variant: "green" | "gold" | "red"; label: string }> = {
  "on-track": { variant: "green", label: "On Track" },
  "at-risk": { variant: "gold", label: "At Risk" },
  "off-track": { variant: "red", label: "Off Track" },
};

const cadences = [
  { name: "Daily Standup", frequency: "Daily", icon: Clock, attendees: "Project Team", focus: "Blockers & progress updates", color: "text-blue-400", bg: "bg-blue-500/10" },
  { name: "Weekly Review", frequency: "Weekly", icon: CheckCircle2, attendees: "Steering Committee", focus: "Milestone tracking & risk review", color: "text-green-400", bg: "bg-green-500/10" },
  { name: "Monthly Board", frequency: "Monthly", icon: BarChart3, attendees: "Executive Board", focus: "KPI dashboard & strategic decisions", color: "text-gold", bg: "bg-gold/10" },
  { name: "Quarterly Strategy", frequency: "Quarterly", icon: Target, attendees: "Leadership + Stakeholders", focus: "Strategy alignment & roadmap adjustment", color: "text-purple-400", bg: "bg-purple-500/10" },
];

const raciMatrix = [
  { decision: "Budget Approval > AED 1M", responsible: "PMO Lead", accountable: "DG", consulted: "Finance", informed: "Board" },
  { decision: "Technology Stack Selection", responsible: "CTO", accountable: "DG", consulted: "IT Ops", informed: "All Teams" },
  { decision: "Vendor Selection", responsible: "Procurement", accountable: "CFO", consulted: "CTO, Legal", informed: "PMO" },
  { decision: "Initiative Prioritization", responsible: "PMO Lead", accountable: "Steering Committee", consulted: "All Pillars", informed: "All Staff" },
  { decision: "Risk Escalation (Critical)", responsible: "Risk Owner", accountable: "PMO Lead", consulted: "CISO, Legal", informed: "DG" },
  { decision: "Change Request Approval", responsible: "Change Manager", accountable: "Steering Committee", consulted: "Impacted Teams", informed: "PMO" },
];

const benefitData = [
  { quarter: "Q1", planned: 15, actual: 12 },
  { quarter: "Q2", planned: 35, actual: 30 },
  { quarter: "Q3", planned: 60, actual: 48 },
  { quarter: "Q4", planned: 100, actual: 72 },
];

const escalationLevels = [
  { level: "L1", name: "Project Team", timeframe: "< 24 hours", color: "#3b82f6" },
  { level: "L2", name: "PMO Lead", timeframe: "24-48 hours", color: "#22c55e" },
  { level: "L3", name: "Steering Committee", timeframe: "48-72 hours", color: "#d4a843" },
  { level: "L4", name: "Director General", timeframe: "> 72 hours", color: "#ef4444" },
];

export default function GovernancePage() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Governance & KPIs"
          description="Performance tracking and governance framework"
        />
      </motion.div>

      {/* KPI Stat Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiStatCards.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </motion.div>

      {/* KPI Table */}
      <motion.div variants={fadeUp} className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
          <BarChart3 size={16} className="text-gold" />
          <h2 className="font-playfair text-lg font-semibold text-cream">KPI Dashboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">KPI</th>
                <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Category</th>
                <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Target</th>
                <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Actual</th>
                <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Frequency</th>
                <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Owner</th>
                <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {kpiTable.map((kpi, idx) => {
                const sb = statusBadge[kpi.status];
                return (
                  <motion.tr
                    key={kpi.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 font-medium text-cream">{kpi.name}</td>
                    <td className="p-4">
                      <Badge variant="gold" size="sm">{kpi.category}</Badge>
                    </td>
                    <td className="p-4 text-center text-gray-muted">{kpi.target}</td>
                    <td className="p-4 text-center font-medium text-cream">
                      <span className="inline-flex items-center gap-1">
                        {kpi.actual}
                        {kpi.trend === "up" && <ArrowUpRight size={12} className="text-green-400" />}
                      </span>
                    </td>
                    <td className="p-4 text-center text-gray-muted text-xs">{kpi.frequency}</td>
                    <td className="p-4 text-gray-muted whitespace-nowrap">{kpi.owner}</td>
                    <td className="p-4 text-center">
                      <Badge variant={sb.variant} size="sm" dot>{sb.label}</Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Governance Framework */}
      <motion.div variants={fadeUp}>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-gold" />
          Governance Framework
        </h2>

        {/* Review Cadence */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {cadences.map((c) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.name}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-5"
              >
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={c.color} />
                </div>
                <h3 className="font-playfair text-sm font-semibold text-cream">{c.name}</h3>
                <Badge variant="gold" size="sm" className="mt-2">{c.frequency}</Badge>
                <p className="text-xs text-gray-muted mt-3">{c.focus}</p>
                <p className="text-xs text-gray-muted mt-1 flex items-center gap-1">
                  <Users size={10} /> {c.attendees}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Decision Rights (RACI) */}
        <div className="glass-card overflow-hidden mb-6">
          <div className="p-5 border-b border-white/5">
            <h3 className="font-playfair text-base font-semibold text-cream">Decision Rights Matrix (RACI)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Decision</th>
                  <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                    <span className="text-blue-400">R</span>esponsible
                  </th>
                  <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                    <span className="text-gold">A</span>ccountable
                  </th>
                  <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                    <span className="text-green-400">C</span>onsulted
                  </th>
                  <th className="text-center p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                    <span className="text-gray-muted">I</span>nformed
                  </th>
                </tr>
              </thead>
              <tbody>
                {raciMatrix.map((row) => (
                  <tr key={row.decision} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-cream">{row.decision}</td>
                    <td className="p-4 text-center">
                      <Badge variant="blue" size="sm">{row.responsible}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="gold" size="sm">{row.accountable}</Badge>
                    </td>
                    <td className="p-4 text-center text-xs text-gray-muted">{row.consulted}</td>
                    <td className="p-4 text-center text-xs text-gray-muted">{row.informed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Escalation Path */}
        <div className="glass-card p-6 mb-6">
          <h3 className="font-playfair text-base font-semibold text-cream mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-gold" />
            Escalation Path
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {escalationLevels.map((level, idx) => (
              <div key={level.level} className="flex items-center gap-3">
                <div className="glass rounded-xl p-4 flex-1 sm:flex-initial text-center min-w-[140px]">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold mx-auto mb-2"
                    style={{ backgroundColor: `${level.color}20`, color: level.color }}
                  >
                    {level.level}
                  </div>
                  <p className="text-sm font-medium text-cream">{level.name}</p>
                  <p className="text-[10px] text-gray-muted mt-1">{level.timeframe}</p>
                </div>
                {idx < escalationLevels.length - 1 && (
                  <ArrowUpRight size={18} className="text-gray-muted hidden sm:block shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Benefit Realization Tracker */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h2 className="font-playfair text-lg font-semibold text-cream mb-6 flex items-center gap-2">
          <TrendingUp size={18} className="text-gold" />
          Benefit Realization Tracker
        </h2>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={benefitData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="quarter"
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#f5f0e8",
                  fontSize: 12,
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
              />
              <Bar dataKey="planned" name="Planned Benefits" fill="#d4a843" radius={[6, 6, 0, 0]} barSize={32} />
              <Bar dataKey="actual" name="Actual Benefits" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
