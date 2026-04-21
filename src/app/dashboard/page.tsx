"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
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
  X,
  Scale,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCompassTourStore } from "@/components/tour/tour-store";

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
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
 *  Mandate Top Bar (sits above the Atlas bar)
 * ────────────────────────────────────────────── */

function MandateBar() {
  const router = useRouter();

  const subLinks = [
    { label: "Mandate", href: "/dashboard/mandate", icon: Scale },
    { label: "RFI Alignment", href: "/dashboard/mandate/rfi-alignment", icon: Network },
  ];

  return (
    <motion.button
      type="button"
      data-tour="compass-mandate-bar"
      onClick={() => router.push("/dashboard/mandate")}
      className="shimmer-border glass-bar group relative w-full overflow-hidden rounded-2xl text-left"
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
      whileHover={{ scale: 1.008, y: -1 }}
      whileTap={{ scale: 0.997 }}
    >
      <motion.div
        className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(0,168,107,0.22) 0%, transparent 70%)",
        }}
        animate={{ x: [0, -20, 0], y: [0, 6, 0], scale: [1, 1.18, 1] }}
        transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(45,74,140,0.25) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 18, 0], y: [0, -8, 0] }}
        transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="relative z-10 flex items-center gap-4 px-6 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,168,107,0.18), rgba(45,74,140,0.06))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          <Scale size={18} className="text-[#00A86B]" strokeWidth={1.6} />
        </div>

        <div className="flex flex-1 items-center">
          <h3 className="font-playfair text-lg font-bold text-cream">
            Mandate
          </h3>
        </div>

        <div className="hidden md:flex items-center gap-1.5 mr-2">
          {subLinks.map((link) => {
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
 *  Atlas Top Bar
 * ────────────────────────────────────────────── */

function AtlasBar() {
  const router = useRouter();

  return (
    <motion.button
      type="button"
      data-tour="compass-atlas-bar"
      onClick={() => router.push("/dashboard/atlas")}
      className="shimmer-border glass-bar group relative w-full overflow-hidden rounded-2xl text-left"
      initial={{ opacity: 0, y: -20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
      whileHover={{ scale: 1.008, y: -1 }}
      whileTap={{ scale: 0.997 }}
    >
      <motion.div
        className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(0,168,107,0.25) 0%, transparent 70%)",
        }}
        animate={{ x: [0, 30, 0], y: [0, 8, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
      />

      <div className="relative z-10 flex items-center gap-4 px-6 py-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(0,168,107,0.15), rgba(0,168,107,0.05))",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          <Globe size={18} className="text-[#00A86B]" strokeWidth={1.6} />
        </div>

        <div className="flex flex-1 items-center">
          <h3 className="font-playfair text-lg font-bold text-cream">
            Global Atlas
          </h3>
        </div>

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
 *  Pillar Tile (with inline sub-item pills)
 * ────────────────────────────────────────────── */

function PillarTile({
  pillar,
  index,
  onOpenModal,
}: {
  pillar: Pillar;
  index: number;
  onOpenModal: () => void;
}) {
  const router = useRouter();
  const Icon = pillar.icon;

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.25 + index * 0.1 }}
    >
      <motion.button
        onClick={onOpenModal}
        className="glass-pillar group relative h-full w-full overflow-hidden rounded-[20px] text-left"
        whileHover={{ y: -6, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 180,
            height: 180,
            right: -40,
            top: -40,
            background: `radial-gradient(circle, ${pillar.glowColor} 0%, transparent 70%)`,
            opacity: 0.4,
          }}
          animate={{ x: [0, 8, 0], y: [0, -6, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, ease: "easeInOut", repeat: Infinity }}
        />

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
          animate={{ x: [0, 10, 0], y: [0, -8, 0] }}
          transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
        />

        <div className="relative z-10 flex flex-col items-center justify-between gap-3 px-5 py-7 text-center h-full">
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, var(${pillar.accentVar}) 18%, transparent), color-mix(in srgb, var(${pillar.accentVar}) 6%, transparent))`,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              <Icon size={22} className="icon-white" strokeWidth={1.4} />
            </motion.div>

            <div>
              <h3 className="font-playfair text-lg font-bold text-cream">
                {pillar.title}
              </h3>
              <p className="mt-0.5 text-[11px] text-white/35">
                {pillar.subtitle}
              </p>
            </div>
          </div>

          {/* Inline sub-item pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
            {pillar.items.map((item) => {
              const SubIcon = item.icon;
              return (
                <span
                  key={item.href}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(item.href);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      router.push(item.href);
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-[10px] text-white/50 transition-all duration-200 hover:bg-white/[0.1] hover:text-white/80 cursor-pointer"
                >
                  <SubIcon size={10} strokeWidth={1.8} />
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────
 *  Pillar Modal (cinematic zoom-in)
 * ────────────────────────────────────────────── */

function PillarModal({
  pillar,
  onClose,
}: {
  pillar: Pillar;
  onClose: () => void;
}) {
  const router = useRouter();
  const Icon = pillar.icon;

  const handleNavigate = useCallback(
    (href: string) => {
      onClose();
      router.push(href);
    },
    [onClose, router]
  );

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      {/* Modal card */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none"
        initial={{ opacity: 0, scale: 0.88, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <div
          className="pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-[28px]"
          style={{
            background:
              "linear-gradient(160deg, rgba(17, 34, 64, 0.92), rgba(7, 17, 34, 0.96))",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: `0 40px 120px rgba(0,0,0,0.5), 0 0 120px ${pillar.glowColor}`,
          }}
        >
          {/* Accent glow */}
          <motion.div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full"
            style={{
              background: `radial-gradient(circle, ${pillar.glowColor} 0%, transparent 65%)`,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full"
            style={{
              background: `radial-gradient(circle, ${pillar.glowColor} 0%, transparent 70%)`,
              opacity: 0.2,
            }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-white/50 transition-colors duration-200 hover:bg-white/[0.12] hover:text-white"
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="relative z-10 px-8 py-10">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4"
                style={{
                  background: `linear-gradient(135deg, color-mix(in srgb, var(${pillar.accentVar}) 22%, transparent), color-mix(in srgb, var(${pillar.accentVar}) 8%, transparent))`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.25)`,
                }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
              >
                <Icon size={28} className="icon-white" strokeWidth={1.3} />
              </motion.div>

              <motion.h2
                className="font-playfair text-2xl font-bold text-cream"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.15 }}
              >
                {pillar.title}
              </motion.h2>
              <motion.p
                className="mt-1.5 text-sm text-white/40"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
              >
                {pillar.subtitle}
              </motion.p>
            </div>

            {/* Separator */}
            <motion.div
              className="mx-auto mb-6 h-px w-24"
              style={{
                background: `linear-gradient(90deg, transparent, color-mix(in srgb, var(${pillar.accentVar}) 40%, transparent), transparent)`,
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
            />

            {/* Sub-item cards */}
            <div className="space-y-2">
              {pillar.items.map((item, i) => {
                const SubIcon = item.icon;
                return (
                  <motion.button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: EASE, delay: 0.3 + i * 0.07 }}
                    whileHover={{ x: 6, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="group/card flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-250 hover:bg-white/[0.06]"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-shadow duration-300"
                      style={{
                        background: `linear-gradient(135deg, color-mix(in srgb, var(${pillar.accentVar}) 15%, transparent), color-mix(in srgb, var(${pillar.accentVar}) 5%, transparent))`,
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 6px 20px rgba(0,0,0,0.15)",
                      }}
                    >
                      <SubIcon size={18} className="icon-white" strokeWidth={1.6} />
                    </div>
                    <span className="flex-1 text-sm font-medium text-white/70 group-hover/card:text-white transition-colors duration-200">
                      {item.label}
                    </span>
                    <ArrowRight
                      size={14}
                      className="text-white/0 group-hover/card:text-white/50 transition-all duration-200 group-hover/card:translate-x-1"
                    />
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ──────────────────────────────────────────────
 *  Dashboard Home
 * ────────────────────────────────────────────── */

export default function DashboardHome() {
  const { data: session } = useSession();
  const replayTour = useCompassTourStore((s) => s.replay);
  const userType = (session?.user as { userType?: string } | undefined)?.userType;
  const isDemo = userType === "demo";
  const rawName = (session?.user?.name ?? "there").split(" ")[0];
  const userName = rawName.split(".")[0];
  const [openPillar, setOpenPillar] = useState<string | null>(null);

  // Defer locale-/clock-dependent rendering to client mount so SSR and the first
  // hydration match (otherwise the server's TZ vs the browser's TZ diverge and
  // we trip React #418/#425).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
  }, []);

  const greeting = now ? greetingFor(now) : "";
  const dateString = now ? formatDate(now) : "\u00A0";

  const activePillar = PILLARS.find((p) => p.id === openPillar) ?? null;

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
        <div className="mb-3 flex justify-center">
          <motion.button
            type="button"
            onClick={() => replayTour()}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 transition-colors hover:border-[var(--gpssa-green)]/35 hover:bg-white/[0.07] hover:text-white/75"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={11} className="text-[var(--gpssa-green)]/90" strokeWidth={2} />
            Guided tour
          </motion.button>
        </div>
        <p className="mb-1 text-[11px] font-medium tracking-[0.24em] text-white/30 uppercase">
          {dateString}
        </p>
        <h1 className="font-playfair text-3xl font-bold text-cream md:text-4xl">
          {isDemo
            ? greeting || "Welcome"
            : greeting
              ? `${greeting}, ${userName}`
              : `Hello, ${userName}`}
        </h1>
        <p className="mt-2 text-sm text-white/35">
          {isDemo
            ? "Welcome to the GPSSA Compass — explore the platform freely."
            : "Social Insurance & Pension Knowledge Intelligence"}
        </p>
      </motion.header>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-3xl px-6 space-y-3">
        <AtlasBar />

        <div
          className="grid grid-cols-1 sm:grid-cols-3 items-stretch gap-3"
          data-tour="compass-pillar-grid"
        >
          {PILLARS.map((pillar, i) => (
            <PillarTile
              key={pillar.id}
              pillar={pillar}
              index={i}
              onOpenModal={() => setOpenPillar(pillar.id)}
            />
          ))}
        </div>

        <MandateBar />
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

      {/* Pillar Modal */}
      <AnimatePresence>
        {activePillar && (
          <PillarModal
            key={activePillar.id}
            pillar={activePillar}
            onClose={() => setOpenPillar(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
