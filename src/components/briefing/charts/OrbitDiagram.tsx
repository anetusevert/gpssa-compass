"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

export interface OrbitNode {
  id: string;
  label: string;
  count: number | string;
  icon: LucideIcon;
  color: string;
}

interface OrbitDiagramProps {
  centerLabel: string;
  centerSub?: string;
  nodes: OrbitNode[];
  radius?: number;
  size?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

export function OrbitDiagram({
  centerLabel,
  centerSub,
  nodes,
  radius = 200,
  size = 520,
}: OrbitDiagramProps) {
  const center = size / 2;

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
    >
      {/* Orbit ring */}
      <motion.svg
        className="absolute inset-0"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial={{ opacity: 0, rotate: -20 }}
        animate={{ opacity: 1, rotate: 0 }}
        transition={{ duration: 1, ease: EASE, delay: 0.2 }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
        <circle
          cx={center}
          cy={center}
          r={radius - 28}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />
      </motion.svg>

      {/* Slow rotation overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#orbitGrad)"
            strokeWidth="1.2"
            strokeDasharray="80 600"
            strokeLinecap="round"
            opacity="0.6"
          />
          <defs>
            <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00A86B" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Center node */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}
      >
        <motion.div
          className="flex h-32 w-32 items-center justify-center rounded-full"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(0,168,107,0.32), rgba(45,74,140,0.32) 60%, rgba(7,17,34,0.95) 100%)",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.18), 0 16px 60px rgba(0,168,107,0.2), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
          animate={{
            boxShadow: [
              "inset 0 1px 0 rgba(255,255,255,0.18), 0 16px 60px rgba(0,168,107,0.2), 0 0 0 1px rgba(255,255,255,0.06)",
              "inset 0 1px 0 rgba(255,255,255,0.22), 0 18px 72px rgba(0,168,107,0.32), 0 0 0 1px rgba(255,255,255,0.1)",
              "inset 0 1px 0 rgba(255,255,255,0.18), 0 16px 60px rgba(0,168,107,0.2), 0 0 0 1px rgba(255,255,255,0.06)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="text-center">
            <div className="font-playfair text-2xl font-bold text-cream tracking-wide">
              {centerLabel}
            </div>
            {centerSub && (
              <div className="mt-1 text-[9px] uppercase tracking-[0.28em] text-white/55">
                {centerSub}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Orbit nodes */}
      {nodes.map((node, i) => {
        const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        const Icon = node.icon;
        return (
          <motion.div
            key={node.id}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: x, top: y }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              ease: EASE,
              delay: 0.7 + i * 0.12,
            }}
          >
            {/* Connection line drawn from node to center via SVG overlay */}
            <motion.div
              className="flex flex-col items-center gap-2"
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 5 + i * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3,
              }}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, color-mix(in srgb, ${node.color} 22%, transparent), color-mix(in srgb, ${node.color} 6%, transparent))`,
                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 32px color-mix(in srgb, ${node.color} 22%, transparent)`,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Icon size={22} className="text-cream" strokeWidth={1.6} />
              </div>
              <div className="text-center">
                <div className="font-playfair text-xl font-bold text-cream leading-none">
                  {node.count}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/55">
                  {node.label}
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      {/* Connection lines */}
      <svg
        className="absolute inset-0 z-0 pointer-events-none"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {nodes.map((_, i) => {
          const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
          const x = center + (radius - 30) * Math.cos(angle);
          const y = center + (radius - 30) * Math.sin(angle);
          const innerX = center + 70 * Math.cos(angle);
          const innerY = center + 70 * Math.sin(angle);
          return (
            <motion.line
              key={i}
              x1={innerX}
              y1={innerY}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
              strokeDasharray="3 5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.6 + i * 0.1,
                ease: EASE,
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}
