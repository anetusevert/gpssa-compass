"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  Sparkles,
  TrendingUp,
  Clock,
  Zap,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
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

const budgetData = [
  { name: "Technology", value: 4200000, color: "#2D4A8C" },
  { name: "People", value: 2800000, color: "#00A86B" },
  { name: "Process", value: 1500000, color: "#C5A572" },
  { name: "External Services", value: 1800000, color: "#5B7FD1" },
];

const totalInvestment = budgetData.reduce((sum, d) => sum + d.value, 0);

interface Initiative {
  name: string;
  cost: string;
  benefit: string;
  roi: number;
  paybackPeriod: string;
  category: string;
}

const initiatives: Initiative[] = [
  { name: "Cloud Migration Program", cost: "$2.1M", benefit: "$4.8M (3yr)", roi: 128, paybackPeriod: "18 months", category: "Technology" },
  { name: "Data Analytics Platform", cost: "$1.4M", benefit: "$3.6M (3yr)", roi: 157, paybackPeriod: "14 months", category: "Technology" },
  { name: "Digital Service Portal", cost: "$1.2M", benefit: "$2.8M (3yr)", roi: 133, paybackPeriod: "16 months", category: "Technology" },
  { name: "Workforce Upskilling", cost: "$1.8M", benefit: "$3.2M (3yr)", roi: 78, paybackPeriod: "22 months", category: "People" },
  { name: "Process Automation Suite", cost: "$900K", benefit: "$2.4M (3yr)", roi: 167, paybackPeriod: "12 months", category: "Process" },
  { name: "Customer Experience Redesign", cost: "$750K", benefit: "$1.9M (3yr)", roi: 153, paybackPeriod: "15 months", category: "External Services" },
];

interface MatrixItem {
  name: string;
  impact: "high" | "low";
  effort: "high" | "low";
}

const matrixItems: MatrixItem[] = [
  { name: "Self-Service Portal", impact: "high", effort: "low" },
  { name: "Chatbot Integration", impact: "high", effort: "low" },
  { name: "Mobile App Launch", impact: "high", effort: "high" },
  { name: "Cloud Migration", impact: "high", effort: "high" },
  { name: "Data Lake Setup", impact: "high", effort: "high" },
  { name: "Email Automation", impact: "low", effort: "low" },
  { name: "Document Digitization", impact: "low", effort: "low" },
  { name: "Legacy System Rewrite", impact: "low", effort: "high" },
  { name: "Full ERP Replacement", impact: "low", effort: "high" },
];

const quadrantLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  "high-low": { label: "Quick Wins", color: "text-gpssa-green", icon: Zap },
  "high-high": { label: "Major Projects", color: "text-adl-blue", icon: Target },
  "low-low": { label: "Fill-ins", color: "text-gold", icon: Clock },
  "low-high": { label: "Thankless Tasks", color: "text-red-400", icon: ArrowDownRight },
};

function formatCurrency(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="glass-panel rounded-xl px-4 py-3 border border-white/10 shadow-xl">
      <p className="text-sm font-medium text-cream">{d.name}</p>
      <p className="text-xs text-gray-muted mt-1">{formatCurrency(d.value)} ({((d.value / totalInvestment) * 100).toFixed(0)}%)</p>
    </div>
  );
}

export default function InvestmentsPage() {
  const grouped = {
    "high-low": matrixItems.filter((i) => i.impact === "high" && i.effort === "low"),
    "high-high": matrixItems.filter((i) => i.impact === "high" && i.effort === "high"),
    "low-low": matrixItems.filter((i) => i.impact === "low" && i.effort === "low"),
    "low-high": matrixItems.filter((i) => i.impact === "low" && i.effort === "high"),
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Investment Blueprint"
          description="Budget allocation, cost-benefit analysis, and strategic investment prioritization."
          badge={{ label: "Requirements", variant: "blue" }}
          actions={
            <Button variant="secondary" size="sm">
              <Sparkles size={16} />
              Generate AI Business Cases
            </Button>
          }
        />
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Investment" value={formatCurrency(totalInvestment)} trend="neutral" />
        <StatCard icon={TrendingUp} label="Avg. ROI" value="136%" trend="up" change="+12%" />
        <StatCard icon={Clock} label="Avg. Payback" value="16 mo" trend="neutral" />
        <StatCard icon={Zap} label="Quick Wins" value={grouped["high-low"].length} trend="up" change="identified" />
      </motion.div>

      {/* Budget Pie Chart */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Budget Allocation</h2>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {budgetData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value: string) => <span className="text-xs text-gray-muted">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {budgetData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-cream">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-cream tabular-nums">{formatCurrency(item.value)}</span>
                  <span className="text-xs text-gray-muted ml-2">({((item.value / totalInvestment) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Cost-Benefit Analysis */}
      <motion.div variants={fadeUp}>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Cost-Benefit Analysis</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initiatives.map((init, i) => (
            <motion.div
              key={init.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-cream text-sm">{init.name}</h3>
                <Badge variant={init.roi >= 150 ? "green" : init.roi >= 100 ? "blue" : "gold"} size="sm">
                  {init.roi}% ROI
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-muted">Investment</span>
                  <span className="text-cream font-medium">{init.cost}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-muted">Expected Benefit</span>
                  <span className="text-gpssa-green font-medium">{init.benefit}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-muted">Payback Period</span>
                  <span className="text-cream font-medium">{init.paybackPeriod}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5">
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-adl-blue to-gpssa-green"
                    style={{ width: `${Math.min(init.roi, 200) / 2}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-muted mt-1 text-right">{init.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Impact vs Effort Matrix */}
      <motion.div variants={fadeUp}>
        <h2 className="font-playfair text-lg font-semibold text-cream mb-4">Impact vs. Effort Matrix</h2>
        <div className="grid grid-cols-2 gap-3">
          {(["high-low", "high-high", "low-low", "low-high"] as const).map((key) => {
            const q = quadrantLabels[key];
            const Icon = q.icon;
            const items = grouped[key];
            const [impact, effort] = key.split("-");

            return (
              <div key={key} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={16} className={q.color} />
                  <h3 className={`font-medium text-sm ${q.color}`}>{q.label}</h3>
                </div>
                <p className="text-[10px] text-gray-muted uppercase tracking-wide mb-3">
                  {impact === "high" ? "High Impact" : "Low Impact"} · {effort === "high" ? "High Effort" : "Low Effort"}
                </p>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        key === "high-low" ? "bg-gpssa-green" :
                        key === "high-high" ? "bg-adl-blue" :
                        key === "low-low" ? "bg-gold" : "bg-red-400"
                      }`} />
                      <span className="text-xs text-cream">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
