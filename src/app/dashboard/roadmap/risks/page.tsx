"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  AlertTriangle,
  Shield,
  AlertOctagon,
  AlertCircle,
  Info,
  ArrowUpDown,
  GitBranch,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Modal } from "@/components/ui/Modal";

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  probability: number;
  impact: number;
  mitigation: string;
  owner: string;
  status: "open" | "mitigated" | "closed" | "monitoring";
}

interface Dependency {
  initiative: string;
  dependsOn: string[];
}

const statusConfig: Record<string, { variant: "green" | "blue" | "gold" | "red" | "gray"; label: string }> = {
  open: { variant: "red", label: "Open" },
  mitigated: { variant: "green", label: "Mitigated" },
  closed: { variant: "gray", label: "Closed" },
  monitoring: { variant: "gold", label: "Monitoring" },
};

const categoryColors: Record<string, string> = {
  Technical: "blue",
  Organizational: "gold",
  External: "red",
  Financial: "green",
  Security: "red",
  Operational: "gold",
};

const sampleRisks: Risk[] = [
  { id: "r1", title: "Legacy System Integration Failure", description: "Core pension system may not support modern API integration patterns", category: "Technical", probability: 4, impact: 5, mitigation: "Build adapter layer; phased migration plan; maintain parallel systems during transition", owner: "CTO Office", status: "open" },
  { id: "r2", title: "Data Migration Integrity Loss", description: "Risk of data corruption or loss during migration from legacy databases", category: "Technical", probability: 3, impact: 5, mitigation: "Implement checksum validation; run parallel systems; automated reconciliation", owner: "Data Team Lead", status: "monitoring" },
  { id: "r3", title: "Staff Resistance to Change", description: "Employees may resist new digital processes and automation", category: "Organizational", probability: 4, impact: 3, mitigation: "Change management program; early involvement; training workshops; champion network", owner: "HR Director", status: "open" },
  { id: "r4", title: "Vendor Lock-in Risk", description: "Over-dependence on single technology vendor for critical systems", category: "External", probability: 3, impact: 4, mitigation: "Multi-cloud strategy; open standards; contract flexibility clauses", owner: "Procurement", status: "monitoring" },
  { id: "r5", title: "Budget Overrun", description: "Project costs exceeding approved budget due to scope creep or unforeseen technical challenges", category: "Financial", probability: 3, impact: 4, mitigation: "Agile budgeting; monthly cost reviews; contingency reserve of 15%", owner: "PMO Lead", status: "open" },
  { id: "r6", title: "Cybersecurity Vulnerability", description: "New digital channels introducing attack surface for pension data", category: "Security", probability: 2, impact: 5, mitigation: "Security-by-design; penetration testing; SOC monitoring; incident response plan", owner: "CISO", status: "mitigated" },
  { id: "r7", title: "Regulatory Compliance Gap", description: "New digital services may not meet evolving UAE data protection regulations", category: "External", probability: 2, impact: 4, mitigation: "Regular compliance audits; legal advisory engagement; privacy-by-design", owner: "Compliance Lead", status: "monitoring" },
  { id: "r8", title: "Arabic NLP Model Accuracy", description: "AI chatbot may deliver inaccurate responses in Arabic dialect", category: "Technical", probability: 4, impact: 3, mitigation: "Extensive training data collection; human-in-the-loop review; confidence thresholds", owner: "AI Team Lead", status: "open" },
  { id: "r9", title: "Service Downtime During Migration", description: "Potential service interruptions during system cutover periods", category: "Operational", probability: 3, impact: 3, mitigation: "Blue-green deployment; weekend migration windows; rollback procedures", owner: "Ops Manager", status: "open" },
  { id: "r10", title: "Low Digital Adoption Rate", description: "Citizens may not adopt digital channels as projected", category: "Organizational", probability: 3, impact: 3, mitigation: "Marketing campaign; incentives for digital usage; usability testing; onboarding support", owner: "Digital Team", status: "open" },
];

const dependencies: Dependency[] = [
  { initiative: "Digital Portal MVP", dependsOn: ["API Gateway", "Identity Verification"] },
  { initiative: "AI Chatbot Deployment", dependsOn: ["Knowledge Base", "CRM Platform"] },
  { initiative: "Omnichannel Integration", dependsOn: ["Digital Portal", "CRM Platform"] },
  { initiative: "Mobile App Launch", dependsOn: ["Digital Portal", "Push Notification Service"] },
  { initiative: "Predictive Analytics", dependsOn: ["Data Warehouse", "Analytics Dashboard v2"] },
];

function getRiskScore(p: number, i: number) {
  return p * i;
}

function getRiskLevel(score: number): { label: string; color: string; variant: "red" | "gold" | "green" | "gray" } {
  if (score >= 15) return { label: "Critical", color: "#ef4444", variant: "red" };
  if (score >= 10) return { label: "High", color: "#f59e0b", variant: "gold" };
  if (score >= 5) return { label: "Medium", color: "#d4a843", variant: "gold" };
  return { label: "Low", color: "#22c55e", variant: "green" };
}

export default function RisksPage() {
  const [sortField, setSortField] = useState<"score" | "probability" | "impact">("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const sorted = [...sampleRisks].sort((a, b) => {
    let va: number, vb: number;
    if (sortField === "score") {
      va = getRiskScore(a.probability, a.impact);
      vb = getRiskScore(b.probability, b.impact);
    } else {
      va = a[sortField];
      vb = b[sortField];
    }
    return sortAsc ? va - vb : vb - va;
  });

  const riskStats = {
    total: sampleRisks.length,
    critical: sampleRisks.filter((r) => getRiskScore(r.probability, r.impact) >= 15).length,
    high: sampleRisks.filter((r) => { const s = getRiskScore(r.probability, r.impact); return s >= 10 && s < 15; }).length,
    medium: sampleRisks.filter((r) => { const s = getRiskScore(r.probability, r.impact); return s >= 5 && s < 10; }).length,
  };

  const heatmapCells = Array.from({ length: 25 }, (_, idx) => {
    const row = 4 - Math.floor(idx / 5);
    const col = idx % 5;
    const prob = col + 1;
    const imp = row + 1;
    const risksInCell = sampleRisks.filter((r) => r.probability === prob && r.impact === imp);
    const score = getRiskScore(prob, imp);
    return { prob, imp, risksInCell, score };
  });

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Risk & Dependencies"
          description="Risk register and dependency management"
          actions={
            <Button variant="secondary" size="sm" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Add Risk
            </Button>
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Risks" value={riskStats.total} icon={Shield} trend="neutral" />
        <StatCard label="Critical" value={riskStats.critical} icon={AlertOctagon} trend="down" change="1" />
        <StatCard label="High" value={riskStats.high} icon={AlertTriangle} trend="neutral" />
        <StatCard label="Medium" value={riskStats.medium} icon={Info} trend="up" change="+2" />
      </motion.div>

      {/* Risk Heatmap */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <h2 className="font-playfair text-lg font-semibold text-cream mb-6">
          Risk Heatmap
        </h2>
        <div className="flex items-end gap-2">
          <div className="flex flex-col items-center mr-1">
            <span className="text-[10px] text-gray-muted -rotate-90 whitespace-nowrap mb-4">
              Impact →
            </span>
          </div>
          <div>
            <div className="grid grid-cols-5 gap-1">
              {heatmapCells.map((cell, idx) => {
                const bg =
                  cell.score >= 15
                    ? "bg-red-500/30 border-red-500/40"
                    : cell.score >= 10
                    ? "bg-orange-500/20 border-orange-500/30"
                    : cell.score >= 5
                    ? "bg-yellow-500/15 border-yellow-500/25"
                    : "bg-green-500/10 border-green-500/20";

                return (
                  <div
                    key={idx}
                    className={`w-16 h-16 lg:w-20 lg:h-20 rounded-lg border flex flex-col items-center justify-center gap-0.5 ${bg} relative group`}
                  >
                    {cell.risksInCell.length > 0 && (
                      <div className="flex gap-0.5 flex-wrap justify-center">
                        {cell.risksInCell.map((r) => (
                          <div
                            key={r.id}
                            className="w-3 h-3 rounded-full bg-cream/80 border border-white/20"
                            title={r.title}
                          />
                        ))}
                      </div>
                    )}
                    <span className="text-[9px] text-gray-muted mt-0.5">
                      {cell.prob}×{cell.imp}
                    </span>
                    {cell.risksInCell.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold text-navy text-[9px] font-bold flex items-center justify-center">
                        {cell.risksInCell.length}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 px-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className="text-[10px] text-gray-muted w-16 lg:w-20 text-center">
                  {n}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-gray-muted text-center mt-1">Probability →</p>
          </div>
        </div>
      </motion.div>

      {/* Risk Register Table */}
      <motion.div variants={fadeUp} className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-playfair text-lg font-semibold text-cream">Risk Register</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Risk</th>
                <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Category</th>
                <th className="p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  <button onClick={() => { setSortField("probability"); setSortAsc((v) => sortField === "probability" ? !v : false); }} className="inline-flex items-center gap-1 hover:text-cream transition-colors">
                    Prob. <ArrowUpDown size={11} />
                  </button>
                </th>
                <th className="p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  <button onClick={() => { setSortField("impact"); setSortAsc((v) => sortField === "impact" ? !v : false); }} className="inline-flex items-center gap-1 hover:text-cream transition-colors">
                    Impact <ArrowUpDown size={11} />
                  </button>
                </th>
                <th className="p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">
                  <button onClick={() => { setSortField("score"); setSortAsc((v) => sortField === "score" ? !v : false); }} className="inline-flex items-center gap-1 hover:text-cream transition-colors">
                    Score <ArrowUpDown size={11} />
                  </button>
                </th>
                <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Status</th>
                <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium hidden xl:table-cell">Mitigation</th>
                <th className="text-left p-4 text-xs uppercase tracking-wide text-gray-muted font-medium">Owner</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((risk, idx) => {
                const score = getRiskScore(risk.probability, risk.impact);
                const level = getRiskLevel(score);
                const sc = statusConfig[risk.status];
                return (
                  <motion.tr
                    key={risk.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-medium text-cream">{risk.title}</p>
                      <p className="text-xs text-gray-muted mt-0.5 line-clamp-1">{risk.description}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant={(categoryColors[risk.category] as "blue" | "gold" | "red" | "green") ?? "gray"} size="sm">
                        {risk.category}
                      </Badge>
                    </td>
                    <td className="p-4 text-center font-mono text-cream">{risk.probability}</td>
                    <td className="p-4 text-center font-mono text-cream">{risk.impact}</td>
                    <td className="p-4 text-center">
                      <span
                        className="font-bold font-mono px-2 py-0.5 rounded-lg text-xs"
                        style={{ backgroundColor: `${level.color}20`, color: level.color }}
                      >
                        {score}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge>
                    </td>
                    <td className="p-4 hidden xl:table-cell">
                      <p className="text-xs text-gray-muted line-clamp-2 max-w-xs">{risk.mitigation}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-muted whitespace-nowrap">{risk.owner}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Dependency View */}
      <motion.div variants={fadeUp} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <GitBranch size={16} className="text-gold" />
          <h2 className="font-playfair text-lg font-semibold text-cream">Dependency Map</h2>
        </div>
        <div className="space-y-4">
          {dependencies.map((dep) => (
            <div key={dep.initiative} className="glass rounded-xl p-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-cream">{dep.initiative}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-gray-muted">depends on:</span>
                    {dep.dependsOn.map((d) => (
                      <Badge key={d} variant="blue" size="sm">{d}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add Risk Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Risk" size="lg">
        <form
          onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-medium text-cream mb-1.5">Risk Title</label>
            <input type="text" className="w-full glass rounded-xl px-4 py-2.5 text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:ring-1 focus:ring-gold/50" placeholder="Enter risk title" />
          </div>
          <div>
            <label className="block text-xs font-medium text-cream mb-1.5">Description</label>
            <textarea className="w-full glass rounded-xl px-4 py-2.5 text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:ring-1 focus:ring-gold/50 resize-none h-20" placeholder="Describe the risk" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cream mb-1.5">Category</label>
              <select className="w-full glass rounded-xl px-4 py-2.5 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-gold/50 bg-transparent">
                <option value="Technical">Technical</option>
                <option value="Organizational">Organizational</option>
                <option value="External">External</option>
                <option value="Financial">Financial</option>
                <option value="Security">Security</option>
                <option value="Operational">Operational</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-cream mb-1.5">Owner</label>
              <input type="text" className="w-full glass rounded-xl px-4 py-2.5 text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:ring-1 focus:ring-gold/50" placeholder="Risk owner" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-cream mb-1.5">Probability (1-5)</label>
              <input type="number" min={1} max={5} defaultValue={3} className="w-full glass rounded-xl px-4 py-2.5 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-gold/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-cream mb-1.5">Impact (1-5)</label>
              <input type="number" min={1} max={5} defaultValue={3} className="w-full glass rounded-xl px-4 py-2.5 text-sm text-cream focus:outline-none focus:ring-1 focus:ring-gold/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-cream mb-1.5">Mitigation Strategy</label>
            <textarea className="w-full glass rounded-xl px-4 py-2.5 text-sm text-cream placeholder:text-gray-muted focus:outline-none focus:ring-1 focus:ring-gold/50 resize-none h-20" placeholder="How will this risk be mitigated?" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Risk
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
