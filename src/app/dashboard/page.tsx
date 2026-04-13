"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Globe,
  Layers,
  Package,
  Truck,
  ChevronRight,
  GitCompare,
  Database,
  TrendingUp,
  Users2,
  Radio,
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

const EASE = [0.16, 1, 0.3, 1] as const;

interface KnowledgePillar {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  accentVar: string;
  icon: LucideIcon;
  href: string;
  stats: { label: string; value: string; icon: LucideIcon }[];
}

const PILLARS: KnowledgePillar[] = [
  {
    id: "services",
    title: "Services",
    subtitle: "Service Intelligence",
    description:
      "Deep knowledge on GPSSA's 31 services, their capabilities across channels, digital readiness, and enhancement opportunities.",
    accentVar: "--adl-blue",
    icon: Layers,
    href: "/dashboard/services/catalog",
    stats: [
      { label: "Services", value: "31", icon: Layers },
      { label: "Categories", value: "7", icon: Database },
      { label: "Channels", value: "6", icon: Radio },
    ],
  },
  {
    id: "products",
    title: "Products",
    subtitle: "Product Intelligence",
    description:
      "Comprehensive product portfolio covering pension, insurance, and social protection products across core, complementary, and non-core offerings.",
    accentVar: "--gold",
    icon: Package,
    href: "/dashboard/products/portfolio",
    stats: [
      { label: "Products", value: "15+", icon: Package },
      { label: "Segments", value: "8", icon: Users2 },
      { label: "Coverage Types", value: "5", icon: TrendingUp },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    subtitle: "Delivery Intelligence",
    description:
      "How services and products reach customers through digital portals, mobile apps, service centers, partnerships, and cross-border channels.",
    accentVar: "--teal",
    icon: Truck,
    href: "/dashboard/delivery/channels",
    stats: [
      { label: "Channels", value: "6", icon: Truck },
      { label: "Personas", value: "8", icon: Users2 },
      { label: "Models", value: "4", icon: GitCompare },
    ],
  },
];

function AtlasHero({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="group glass-card surface-depth tile-no-frame relative w-full overflow-hidden rounded-[28px] text-left"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,168,107,0.12) 0%, rgba(10,22,40,0.88) 48%, rgba(45,74,140,0.14) 100%)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      whileHover={{ y: -4, scale: 1.006 }}
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="grid-overlay" />
      </div>
      <div
        className="absolute -right-20 top-1/2 h-52 w-52 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(0,168,107,0.22) 0%, transparent 72%)",
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 px-8 py-8 md:py-10">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-[22px] bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <Globe size={34} className="icon-white" strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gpssa-green/70">
              Knowledge Layer
            </span>
          </div>
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-cream mb-2">
            Global Atlas
          </h2>
          <p className="text-sm text-gray-muted max-w-xl">
            Explore the worldwide landscape of social insurance and pension
            systems. Country-level intelligence, institutional benchmarking, and
            comparative analysis across 196 nations.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-cream">196</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-muted/70">
              Countries
            </p>
          </div>
          <div className="w-px h-10 bg-[var(--border)]" />
          <div className="text-center">
            <p className="text-2xl font-bold text-cream">50+</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-muted/70">
              Institutions
            </p>
          </div>
          <div className="w-px h-10 bg-[var(--border)]" />
          <div className="text-center">
            <p className="text-2xl font-bold text-cream">12</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-muted/70">
              Dimensions
            </p>
          </div>
        </div>

        <ChevronRight
          size={24}
          className="icon-white shrink-0 transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--gpssa-green), transparent)",
          opacity: 0.2,
        }}
      />
    </motion.button>
  );
}

function PillarCard({
  pillar,
  index,
  onClick,
}: {
  pillar: KnowledgePillar;
  index: number;
  onClick: () => void;
}) {
  const Icon = pillar.icon;

  return (
    <motion.button
      onClick={onClick}
      className="group glass-card surface-depth tile-no-frame relative w-full overflow-hidden rounded-[28px] text-left"
      style={{
        background: `linear-gradient(145deg, color-mix(in srgb, var(${pillar.accentVar}) 12%, transparent), rgba(10,22,40,0.82))`,
      }}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.55,
        ease: EASE,
        delay: 0.3 + index * 0.12,
      }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <div
        className="absolute -right-12 top-8 h-28 w-28 rounded-full opacity-60 blur-3xl"
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, var(${pillar.accentVar}) 30%, transparent) 0%, transparent 75%)`,
        }}
      />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05]"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 34px rgba(0,0,0,0.18)",
            }}
          >
            <Icon size={22} className="icon-white" strokeWidth={1.5} />
          </div>
          <ChevronRight
            size={18}
            className="icon-white opacity-80 transition-all duration-300 group-hover:translate-x-1"
          />
        </div>

        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em] block mb-1"
          style={{
            color: `color-mix(in srgb, var(${pillar.accentVar}) 70%, transparent)`,
          }}
        >
          {pillar.subtitle}
        </span>

        <h3 className="font-playfair text-xl font-bold text-cream mb-2">
          {pillar.title}
        </h3>

        <p className="text-xs text-gray-muted mb-5 line-clamp-2">
          {pillar.description}
        </p>

        <div
          className="h-px mb-4"
          style={{
            background: `linear-gradient(90deg, color-mix(in srgb, var(${pillar.accentVar}) 25%, transparent), transparent)`,
          }}
        />

        <div className="grid grid-cols-3 gap-3">
          {pillar.stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <StatIcon size={12} className="icon-white mr-1 opacity-80" />
                  <span className="text-lg font-bold text-cream">
                    {stat.value}
                  </span>
                </div>
                <p className="text-[9px] uppercase tracking-wider text-gray-muted/60">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.button>
  );
}

export default function DashboardHome() {
  const { data: session } = useSession();
  const router = useRouter();
  const userName = (session?.user?.name ?? "there").split(" ")[0];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 md:px-16">
      <div
        className="orb pointer-events-none"
        style={{
          width: 480,
          height: 480,
          top: -100,
          right: -80,
          background:
            "radial-gradient(circle, rgba(0,168,107,0.07) 0%, transparent 70%)",
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
          background:
            "radial-gradient(circle, rgba(45,74,140,0.07) 0%, transparent 70%)",
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
          background:
            "radial-gradient(circle, rgba(197,165,114,0.05) 0%, transparent 70%)",
          animationDelay: "4s",
        }}
      />

      <div className="grid-overlay pointer-events-none absolute inset-0" />
      <div className="ambient-ring left-[18%] top-[20%] h-72 w-72 opacity-20" />
      <div className="ambient-ring bottom-[8%] right-[18%] h-96 w-96 opacity-10" />

      <motion.header
        className="relative z-10 mb-8 text-center"
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
        <p className="mt-2 text-sm text-gray-muted/70">
          Social Insurance &amp; Pension Knowledge Intelligence
        </p>
      </motion.header>

      <div className="relative z-10 w-full max-w-5xl space-y-4">
        <AtlasHero onClick={() => router.push("/dashboard/atlas")} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((pillar, i) => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              index={i}
              onClick={() => router.push(pillar.href)}
            />
          ))}
        </div>
      </div>

      <motion.footer
        className="relative z-10 mt-12 flex items-center justify-center gap-2.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <span className="text-xs text-gray-muted/50">powered by</span>
        <Image
          src="/images/adl-logo.png"
          alt="Arthur D. Little"
          width={64}
          height={22}
          className="adl-logo-white object-contain opacity-85"
        />
      </motion.footer>
    </div>
  );
}
