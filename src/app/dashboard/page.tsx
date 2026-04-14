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
  Sparkles,
  Users2,
  Lightbulb,
  UserCircle,
  Network,
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
    id: "atlas",
    title: "Global Atlas",
    subtitle: "Worldwide intelligence across 196 nations",
    icon: Globe,
    accentVar: "--gpssa-green",
    glowColor: "rgba(0,168,107,0.18)",
    items: [
      { label: "World Map", href: "/dashboard/atlas", icon: Globe },
      {
        label: "Benchmarking",
        href: "/dashboard/atlas/benchmarking",
        icon: GitCompare,
      },
    ],
  },
  {
    id: "services",
    title: "Services",
    subtitle: "31 services, channels & analysis",
    icon: Layers,
    accentVar: "--adl-blue",
    glowColor: "rgba(45,74,140,0.18)",
    items: [
      {
        label: "Service Catalog",
        href: "/dashboard/services/catalog",
        icon: Layers,
      },
      {
        label: "Channel Capabilities",
        href: "/dashboard/services/channels",
        icon: Radio,
      },
      {
        label: "Service Analysis",
        href: "/dashboard/services/analysis",
        icon: Sparkles,
      },
    ],
  },
  {
    id: "products",
    title: "Products",
    subtitle: "Portfolio, segments & innovation",
    icon: Package,
    accentVar: "--gold",
    glowColor: "rgba(197,165,114,0.18)",
    items: [
      {
        label: "Portfolio",
        href: "/dashboard/products/portfolio",
        icon: Package,
      },
      {
        label: "Segment Coverage",
        href: "/dashboard/products/segments",
        icon: Users2,
      },
      {
        label: "Innovation",
        href: "/dashboard/products/innovation",
        icon: Lightbulb,
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    subtitle: "Channels, personas & models",
    icon: Truck,
    accentVar: "--teal",
    glowColor: "rgba(45,212,191,0.18)",
    items: [
      {
        label: "Channels",
        href: "/dashboard/delivery/channels",
        icon: Truck,
      },
      {
        label: "Personas",
        href: "/dashboard/delivery/personas",
        icon: UserCircle,
      },
      {
        label: "Delivery Models",
        href: "/dashboard/delivery/models",
        icon: Network,
      },
    ],
  },
];

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
      className="relative"
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.15 + index * 0.08 }}
    >
      <motion.button
        onClick={onToggle}
        className="group glass-card surface-depth tile-no-frame relative w-full overflow-hidden rounded-[24px] text-left transition-colors duration-300"
        style={{
          background: isOpen
            ? `linear-gradient(145deg, color-mix(in srgb, var(${pillar.accentVar}) 16%, transparent), rgba(10,22,40,0.9))`
            : `linear-gradient(145deg, color-mix(in srgb, var(${pillar.accentVar}) 8%, transparent), rgba(10,22,40,0.85))`,
        }}
        whileHover={isOpen ? undefined : { y: -3, scale: 1.015 }}
        whileTap={{ scale: 0.99 }}
      >
        <div
          className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-50 blur-3xl transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${pillar.glowColor} 0%, transparent 75%)`,
            opacity: isOpen ? 0.8 : 0.4,
          }}
        />

        <div className="relative z-10 flex items-center gap-4 px-6 py-5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06]"
            style={{
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            <Icon size={20} className="icon-white" strokeWidth={1.5} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-playfair text-lg font-bold text-cream">
              {pillar.title}
            </h3>
            <p className="text-[11px] text-white/40 mt-0.5 truncate">
              {pillar.subtitle}
            </p>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06]"
          >
            <span className="text-white/70 text-sm leading-none select-none">
              +
            </span>
          </motion.div>
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 px-1 space-y-1">
              {pillar.items.map((item, i) => {
                const SubIcon = item.icon;
                return (
                  <motion.button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: EASE,
                      delay: i * 0.05,
                    }}
                    whileHover={{ x: 4, scale: 1.01 }}
                    className="group flex w-full items-center gap-3 rounded-xl px-5 py-3 text-left transition-colors duration-200 hover:bg-white/[0.05]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                      <SubIcon
                        size={15}
                        className="icon-white"
                        strokeWidth={1.8}
                      />
                    </div>
                    <span className="text-sm text-white/75 group-hover:text-white transition-colors duration-200">
                      {item.label}
                    </span>
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

export default function DashboardHome() {
  const { data: session } = useSession();
  const userName = (session?.user?.name ?? "there").split(" ")[0];
  const [openPillar, setOpenPillar] = useState<string | null>(null);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
      <div
        className="orb pointer-events-none"
        style={{
          width: 480,
          height: 480,
          top: -100,
          right: -80,
          background:
            "radial-gradient(circle, rgba(0,168,107,0.06) 0%, transparent 70%)",
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
            "radial-gradient(circle, rgba(45,74,140,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-30" />
      <div className="ambient-ring left-[15%] top-[20%] h-64 w-64 opacity-15" />
      <div className="ambient-ring bottom-[10%] right-[15%] h-80 w-80 opacity-10" />

      <motion.header
        className="relative z-10 mb-10 text-center"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <p className="mb-1 text-[11px] font-medium tracking-[0.24em] text-white/35 uppercase">
          {getFormattedDate()}
        </p>
        <h1 className="font-playfair text-3xl font-bold text-cream md:text-4xl">
          {getGreeting()}, {userName}
        </h1>
        <p className="mt-2 text-sm text-white/40">
          Social Insurance &amp; Pension Knowledge Intelligence
        </p>
      </motion.header>

      <div className="relative z-10 w-full max-w-4xl px-6 space-y-3">
        <PillarTile
          pillar={PILLARS[0]}
          index={0}
          isOpen={openPillar === PILLARS[0].id}
          onToggle={() =>
            setOpenPillar((prev) =>
              prev === PILLARS[0].id ? null : PILLARS[0].id
            )
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PILLARS.slice(1).map((pillar, i) => (
            <PillarTile
              key={pillar.id}
              pillar={pillar}
              index={i + 1}
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

      <motion.footer
        className="relative z-10 mt-10 flex items-center justify-center gap-2.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <span className="text-[11px] text-white/30">powered by</span>
        <Image
          src="/images/adl-logo.png"
          alt="Arthur D. Little"
          width={60}
          height={20}
          className="adl-logo-white object-contain opacity-70"
        />
      </motion.footer>
    </div>
  );
}
