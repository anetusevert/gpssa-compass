"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  GitCompare,
  Layers,
  Monitor,
  Lightbulb,
  Server,
  Building2,
  GraduationCap,
  DollarSign,
  Workflow,
  Map,
  ListOrdered,
  FileText,
  AlertTriangle,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ─────────────────────────────────────────────
   Types & Data
───────────────────────────────────────────── */

interface SubItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface Pillar {
  id: string;
  number: string;
  title: string;
  question: string;
  accentVar: string;          // CSS variable name e.g. "--gpssa-green"
  accentClass: string;        // Tailwind text class
  borderClass: string;        // active border class
  bgDimClass: string;         // expanded bg tint
  dotClass: string;           // sidebar-dot class
  subItems: SubItem[];
}

const PILLARS: Pillar[] = [
  {
    id: "discover",
    number: "01",
    title: "Discover & Improve",
    question: "How could we do better?",
    accentVar: "--gpssa-green",
    accentClass: "text-gpssa-green",
    borderClass: "border-gpssa-green/40",
    bgDimClass: "bg-gpssa-green/5",
    dotClass: "bg-gpssa-green",
    subItems: [
      { label: "Global Atlas",       href: "/dashboard/discover/atlas",        icon: Globe },
      { label: "Benchmarking",       href: "/dashboard/discover/benchmarking", icon: GitCompare },
      { label: "Service Landscape",  href: "/dashboard/discover/services",     icon: Layers },
      { label: "Systems & Delivery", href: "/dashboard/discover/systems",      icon: Monitor },
      { label: "Design Studio",      href: "/dashboard/discover/design",       icon: Lightbulb },
    ],
  },
  {
    id: "requirements",
    number: "02",
    title: "Requirements & Enablers",
    question: "What do we need to do it?",
    accentVar: "--adl-blue",
    accentClass: "text-adl-blue",
    borderClass: "border-adl-blue/40",
    bgDimClass: "bg-adl-blue/5",
    dotClass: "bg-adl-blue",
    subItems: [
      { label: "Infrastructure", href: "/dashboard/requirements/infrastructure", icon: Server },
      { label: "Organization",   href: "/dashboard/requirements/organization",   icon: Building2 },
      { label: "Capabilities",   href: "/dashboard/requirements/capabilities",   icon: GraduationCap },
      { label: "Investments",    href: "/dashboard/requirements/investments",     icon: DollarSign },
      { label: "Processes",      href: "/dashboard/requirements/processes",       icon: Workflow },
    ],
  },
  {
    id: "roadmap",
    number: "03",
    title: "Roadmap & Implementation",
    question: "How do we get there?",
    accentVar: "--gold",
    accentClass: "text-gold",
    borderClass: "border-gold/40",
    bgDimClass: "bg-gold/5",
    dotClass: "bg-gold",
    subItems: [
      { label: "Strategic Plan",  href: "/dashboard/roadmap/strategic",      icon: Map },
      { label: "Prioritization",  href: "/dashboard/roadmap/prioritization", icon: ListOrdered },
      { label: "Concept Sheets",  href: "/dashboard/roadmap/concepts",       icon: FileText },
      { label: "Risks",           href: "/dashboard/roadmap/risks",           icon: AlertTriangle },
      { label: "Governance & KPIs", href: "/dashboard/roadmap/governance",   icon: BarChart3 },
    ],
  },
];

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const EASE = [0.16, 1, 0.3, 1] as const;

/* ─────────────────────────────────────────────
   Sub-item button
───────────────────────────────────────────── */

function SubItemButton({
  item,
  accentVar,
  index,
  onClick,
}: {
  item: SubItem;
  accentVar: string;
  index: number;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <motion.button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 hover:bg-white/[0.06] active:scale-[0.98]"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.055, duration: 0.3, ease: EASE }}
      whileHover={{ x: 2 }}
    >
      {/* Icon */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200"
        style={{
          backgroundColor: `color-mix(in srgb, var(${accentVar}) 12%, transparent)`,
        }}
      >
        <Icon
          size={15}
          style={{ color: `var(${accentVar})` }}
          strokeWidth={1.8}
        />
      </div>

      {/* Label */}
      <span className="flex-1 text-sm font-medium text-gray-muted transition-colors duration-200 group-hover:text-cream">
        {item.label}
      </span>

      {/* Arrow */}
      <ChevronRight
        size={14}
        className="shrink-0 text-gray-muted/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-gray-muted"
        style={{ color: `color-mix(in srgb, var(${accentVar}) 50%, transparent)` }}
      />
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   Pillar Tile
───────────────────────────────────────────── */

function PillarTile({
  pillar,
  isActive,
  onToggle,
  onNavigate,
}: {
  pillar: Pillar;
  isActive: boolean;
  onToggle: () => void;
  onNavigate: (href: string) => void;
}) {
  return (
    <motion.div
      layout
      className={`
        glass-card cursor-pointer select-none overflow-hidden rounded-2xl border
        transition-colors duration-300
        ${isActive ? pillar.borderClass : "border-[var(--border)] hover:border-[var(--border-hover)]"}
      `}
      style={
        isActive
          ? {
              boxShadow: `0 0 32px color-mix(in srgb, var(${pillar.accentVar}) 10%, transparent)`,
            }
          : {}
      }
      transition={{ layout: { duration: 0.4, ease: EASE } }}
    >
      {/* ── Collapsed header (always visible) ── */}
      <motion.div
        layout="position"
        className={`flex items-center gap-4 px-6 py-5 transition-colors duration-300 ${
          isActive ? pillar.bgDimClass : ""
        }`}
        onClick={onToggle}
      >
        {/* Number */}
        <span
          className="font-playfair text-[11px] font-semibold tracking-[0.2em] opacity-40"
          style={{ color: `var(${pillar.accentVar})` }}
        >
          {pillar.number}
        </span>

        {/* Title + question */}
        <div className="flex-1 min-w-0">
          <h2 className="font-playfair text-lg font-semibold leading-tight text-cream">
            {pillar.title}
          </h2>
          <p className="mt-0.5 text-xs font-medium tracking-wide text-gray-muted/70">
            {pillar.question}
          </p>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isActive ? 90 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="shrink-0"
        >
          <ChevronRight
            size={18}
            style={{ color: `var(${pillar.accentVar})` }}
            className="opacity-60"
          />
        </motion.div>
      </motion.div>

      {/* ── Expanded sub-items ── */}
      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            key="sub-items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            {/* Divider */}
            <div
              className="mx-6 h-px"
              style={{
                background: `linear-gradient(90deg, color-mix(in srgb, var(${pillar.accentVar}) 30%, transparent), transparent)`,
              }}
            />

            {/* Items */}
            <div className="px-4 py-3">
              {pillar.subItems.map((item, i) => (
                <SubItemButton
                  key={item.href}
                  item={item}
                  accentVar={pillar.accentVar}
                  index={i}
                  onClick={() => onNavigate(item.href)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */

export default function DashboardHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = (session?.user?.name ?? "there").split(" ")[0];
  const [activePillar, setActivePillar] = useState<string | null>(null);

  function handleToggle(id: string) {
    setActivePillar((prev) => (prev === id ? null : id));
  }

  function handleNavigate(href: string) {
    router.push(href);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 md:px-16">

      {/* Ambient orbs */}
      <div
        className="orb pointer-events-none"
        style={{
          width: 480,
          height: 480,
          top: -100,
          right: -80,
          background: "radial-gradient(circle, rgba(0,168,107,0.07) 0%, transparent 70%)",
          animationDelay: "0s",
        }}
      />
      <div
        className="orb pointer-events-none"
        style={{
          width: 380,
          height: 380,
          bottom: -60,
          left: -60,
          background: "radial-gradient(circle, rgba(45,74,140,0.07) 0%, transparent 70%)",
          animationDelay: "2s",
        }}
      />
      <div
        className="orb pointer-events-none"
        style={{
          width: 300,
          height: 300,
          top: "45%",
          right: "25%",
          background: "radial-gradient(circle, rgba(197,165,114,0.05) 0%, transparent 70%)",
          animationDelay: "4s",
        }}
      />

      {/* Grid overlay */}
      <div className="grid-overlay pointer-events-none absolute inset-0" />

      {/* Header */}
      <motion.header
        className="relative z-10 mb-10 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <p className="mb-1 text-xs font-medium tracking-widest text-gray-muted/60 uppercase">
          {getFormattedDate()}
        </p>
        <h1 className="font-playfair text-3xl font-bold text-cream md:text-4xl">
          {getGreeting()}, {userName}
        </h1>
      </motion.header>

      {/* Pillar tiles — stacked column, max-width for readability */}
      <motion.div
        className="relative z-10 w-full max-w-2xl space-y-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
        }}
      >
        {PILLARS.map((pillar) => (
          <motion.div
            key={pillar.id}
            variants={{
              hidden: { opacity: 0, y: 24, scale: 0.97 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
            }}
          >
            <PillarTile
              pillar={pillar}
              isActive={activePillar === pillar.id}
              onToggle={() => handleToggle(pillar.id)}
              onNavigate={handleNavigate}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="relative z-10 mt-12 flex items-center justify-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <span className="text-xs text-gray-muted/50">powered by</span>
        <span className="font-playfair text-sm font-semibold tracking-wide text-gray-muted/70">
          Arthur D. Little
        </span>
      </motion.footer>
    </div>
  );
}
