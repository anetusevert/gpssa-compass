"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Layers,
  Package,
  Truck,
  GitCompare,
  Radio,
  Users2,
  UserCircle,
  Network,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface SubItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface Pillar {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accentVar: string;
  glowColor: string;
  items: SubItem[];
}

const PILLARS: Pillar[] = [
  {
    id: "services",
    title: "Services",
    subtitle: "31 services & channel capabilities",
    icon: Layers,
    accentVar: "--adl-blue",
    glowColor: "rgba(45,74,140,0.22)",
    items: [
      { label: "Service Catalog", href: "/dashboard/services/catalog", icon: Layers },
      { label: "Channel Capabilities", href: "/dashboard/services/channels", icon: Radio },
    ],
  },
  {
    id: "products",
    title: "Products",
    subtitle: "Portfolio & segment coverage",
    icon: Package,
    accentVar: "--gold",
    glowColor: "rgba(197,165,114,0.22)",
    items: [
      { label: "Portfolio", href: "/dashboard/products/portfolio", icon: Package },
      { label: "Segment Coverage", href: "/dashboard/products/segments", icon: Users2 },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    subtitle: "Channels, personas & models",
    icon: Truck,
    accentVar: "--teal",
    glowColor: "rgba(45,212,191,0.22)",
    items: [
      { label: "Channels", href: "/dashboard/delivery/channels", icon: Truck },
      { label: "Personas", href: "/dashboard/delivery/personas", icon: UserCircle },
      { label: "Delivery Models", href: "/dashboard/delivery/models", icon: Network },
    ],
  },
];

/* ──────────────────────────────────────────────
 *  Atlas Top Bar
 * ────────────────────────────────────────────── */

function AtlasBar() {
  const router = useRouter();

  return (
    <motion.button
      onClick={() => router.push("/dashboard/atlas")}
      className="shimmer-border glass-bar group relative w-full overflow-hidden rounded-2xl text-left"
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
      whileHover={{ scale: 1.008, y: -1 }}
      whileTap={{ scale: 0.997 }}
    >
      {/* Animated glow orb */}
      <motion.div
        className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(0,168,107,0.25) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 8, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="relative z-10 flex items-center gap-4 px-6 py-3">
        {/* Icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(0,168,107,0.15), rgba(0,168,107,0.05))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          <Globe size={18} className="text-[#00A86B]" strokeWidth={1.6} />
        </div>

        {/* Title area */}
        <div className="flex flex-1 items-center gap-3">
          <h3 className="font-playfair text-lg font-bold text-cream">
            Global Atlas
          </h3>
          <span className="hidden sm:inline-block h-4 w-px bg-white/10" />
          <p className="hidden sm:block text-xs text-white/40">
            Worldwide intelligence across 196 nations
          </p>
        </div>

        {/* Sub-links */}
        <div className="hidden md:flex items-center gap-1.5 mr-2">
          {[
            { label: "World Map", href: "/dashboard/atlas", icon: Globe },
            { label: "Benchmarking", href: "/dashboard/atlas/benchmarking", icon: GitCompare },
          ].map((link) => {
            const SubIcon = link.icon;
            return (
              <button
                key={link.href}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(link.href);
                }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/50 transition-colors duration-200 hover:bg-white/[0.06] hover:text-white/80"
              >
                <SubIcon size={12} strokeWidth={1.8} />
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Arrow */}
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] transition-colors duration-200 group-hover:bg-white/[0.08]"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        >
          <ArrowRight size={14} className="text-white/50 group-hover:text-white/80 transition-colors duration-200" />
        </motion.div>
      </div>
    </motion.button>
  );
}

/* ──────────────────────────────────────────────
 *  Pillar Tile
 * ────────────────────────────────────────────── */

function PillarTile({
  pillar,
  index,
  isOpen,
  onToggle,
}: {
  pillar: Pillar;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const Icon = pillar.icon;

  return (
    <motion.div
      className="relative flex flex-col"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.25 + index * 0.1 }}
    >
      <motion.button
        onClick={onToggle}
        className="glass-pillar group relative w-full overflow-hidden rounded-[20px] text-left"
        whileHover={isOpen ? undefined : { y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          borderColor: isOpen
            ? `color-mix(in srgb, var(${pillar.accentVar}) 25%, transparent)`
            : undefined,
        }}
      >
        {/* Animated background orb */}
        <motion.div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 180,
            height: 180,
            right: -40,
            top: -40,
            background: `radial-gradient(circle, ${pillar.glowColor} 0%, transparent 70%)`,
          }}
          animate={
            isOpen
              ? { opacity: 0.9, scale: 1.2 }
              : { opacity: 0.4, scale: 1 }
          }
          transition={{ duration: 0.6, ease: EASE }}
        />

        {/* Secondary orb, bottom-left */}
        <motion.div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 120,
            height: 120,
            left: -30,
            bottom: -30,
            background: `radial-gradient(circle, ${pillar.glowColor} 0%, transparent 70%)`,
            opacity: 0.15,
          }}
          animate={{
            x: [0, 10, 0],
            y: [0, -8, 0],
          }}
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-4 px-6 py-10 text-center min-h-[240px]">
          {/* Icon container with glow */}
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(${pillar.accentVar}) 18%, transparent), color-mix(in srgb, var(${pillar.accentVar}) 6%, transparent))`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.2)`,
            }}
            whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
          >
            <Icon size={24} className="icon-white" strokeWidth={1.4} />
          </motion.div>

          <div>
            <h3 className="font-playfair text-xl font-bold text-cream">
              {pillar.title}
            </h3>
            <p className="mt-1 text-xs text-white/35 leading-relaxed">
              {pillar.subtitle}
            </p>
          </div>

          {/* Expand indicator */}
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.05] transition-colors duration-200 group-hover:bg-white/[0.1]"
          >
            <span className="text-white/40 text-sm leading-none select-none group-hover:text-white/60 transition-colors duration-200">
              +
            </span>
          </motion.div>
        </div>
      </motion.button>

      {/* Expanded sub-items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 px-1.5 space-y-1">
              {pillar.items.map((item, i) => {
                const SubIcon = item.icon;
                return (
                  <motion.button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: EASE, delay: i * 0.06 }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="group/sub flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors duration-200 hover:bg-white/[0.05]"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, var(${pillar.accentVar}) 12%, transparent), transparent)`,
                      }}
                    >
                      <SubIcon size={14} className="icon-white" strokeWidth={1.8} />
                    </div>
                    <span className="text-sm text-white/60 group-hover/sub:text-white transition-colors duration-200">
                      {item.label}
                    </span>
                    <ArrowRight
                      size={12}
                      className="ml-auto text-white/0 group-hover/sub:text-white/40 transition-colors duration-200"
                    />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 *  Dashboard Home
 * ────────────────────────────────────────────── */

export default function DashboardHome() {
  const { data: session } = useSession();
  const rawName = (session?.user?.name ?? "there").split(" ")[0];
  const userName = rawName.split(".")[0];
  const [openPillar, setOpenPillar] = useState<string | null>(null);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
      {/* Ambient orbs */}
      <div
        className="orb pointer-events-none"
        style={{
          width: 520,
          height: 520,
          top: -120,
          right: -100,
          background: "radial-gradient(circle, rgba(0,168,107,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="orb pointer-events-none drift-slow"
        style={{
          width: 420,
          height: 420,
          bottom: -80,
          left: -80,
          background: "radial-gradient(circle, rgba(45,74,140,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="orb pointer-events-none drift-reverse"
        style={{
          width: 300,
          height: 300,
          top: "40%",
          left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(197,165,114,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-30" />
      <div className="ambient-ring left-[15%] top-[20%] h-64 w-64 opacity-15" />
      <div className="ambient-ring bottom-[10%] right-[15%] h-80 w-80 opacity-10" />

      {/* Header */}
      <motion.header
        className="relative z-10 mb-8 text-center"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <p className="mb-1 text-[11px] font-medium tracking-[0.24em] text-white/30 uppercase">
          {getFormattedDate()}
        </p>
        <h1 className="font-playfair text-3xl font-bold text-cream md:text-4xl">
          {getGreeting()}, {userName}
        </h1>
        <p className="mt-2 text-sm text-white/35">
          Social Insurance &amp; Pension Knowledge Intelligence
        </p>
      </motion.header>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-3xl px-6 space-y-3">
        {/* Atlas top bar */}
        <AtlasBar />

        {/* Three pillar tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PILLARS.map((pillar, i) => (
            <PillarTile
              key={pillar.id}
              pillar={pillar}
              index={i}
              isOpen={openPillar === pillar.id}
              onToggle={() =>
                setOpenPillar((prev) =>
                  prev === pillar.id ? null : pillar.id
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        className="relative z-10 mt-8 flex items-center justify-center gap-2.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <span className="text-[11px] text-white/25">powered by</span>
        <Image
          src="/images/adl-logo.png"
          alt="Arthur D. Little"
          width={60}
          height={20}
          className="adl-logo-white object-contain opacity-60"
        />
      </motion.footer>
    </div>
  );
}
