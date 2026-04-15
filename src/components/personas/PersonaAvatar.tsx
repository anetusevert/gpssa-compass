"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { type Persona } from "@/data/personas";

interface PersonaAvatarProps {
  persona: Persona;
  size?: "sm" | "md" | "lg" | "xl";
  showGlow?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { container: "w-12 h-12", icon: "w-6 h-6", ring: "ring-2", iconBg: "p-2", glowScale: 1.15 },
  md: { container: "w-16 h-16", icon: "w-8 h-8", ring: "ring-2", iconBg: "p-3", glowScale: 1.15 },
  lg: { container: "w-20 h-20", icon: "w-10 h-10", ring: "ring-[3px]", iconBg: "p-4", glowScale: 1.15 },
  xl: { container: "w-28 h-28", icon: "w-12 h-12", ring: "ring-4", iconBg: "p-5", glowScale: 1.12 },
};

const colorConfig: Record<string, { gradient: string; ring: string; glow: string; iconBg: string }> = {
  purple:  { gradient: "from-purple-600 to-violet-700",  ring: "ring-purple-500/30",  glow: "shadow-purple-500/40",  iconBg: "bg-purple-500/20"  },
  cyan:    { gradient: "from-cyan-600 to-teal-700",      ring: "ring-cyan-500/30",    glow: "shadow-cyan-500/40",    iconBg: "bg-cyan-500/20"    },
  blue:    { gradient: "from-blue-600 to-indigo-700",     ring: "ring-blue-500/30",    glow: "shadow-blue-500/40",    iconBg: "bg-blue-500/20"    },
  amber:   { gradient: "from-amber-600 to-orange-700",    ring: "ring-amber-500/30",   glow: "shadow-amber-500/40",   iconBg: "bg-amber-500/20"   },
  indigo:  { gradient: "from-indigo-600 to-blue-700",     ring: "ring-indigo-500/30",  glow: "shadow-indigo-500/40",  iconBg: "bg-indigo-500/20"  },
  rose:    { gradient: "from-rose-600 to-pink-700",       ring: "ring-rose-500/30",    glow: "shadow-rose-500/40",    iconBg: "bg-rose-500/20"    },
  emerald: { gradient: "from-emerald-600 to-green-700",   ring: "ring-emerald-500/30", glow: "shadow-emerald-500/40", iconBg: "bg-emerald-500/20" },
  orange:  { gradient: "from-orange-600 to-amber-700",    ring: "ring-orange-500/30",  glow: "shadow-orange-500/40",  iconBg: "bg-orange-500/20"  },
  slate:   { gradient: "from-slate-500 to-gray-700",      ring: "ring-slate-400/30",   glow: "shadow-slate-400/40",   iconBg: "bg-slate-500/20"   },
  lime:    { gradient: "from-lime-600 to-green-700",      ring: "ring-lime-500/30",    glow: "shadow-lime-500/40",    iconBg: "bg-lime-500/20"    },
};

export function PersonaAvatar({ persona, size = "md", showGlow = true, className }: PersonaAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const Icon = persona.icon;
  const sizes = sizeConfig[size];
  const colors = colorConfig[persona.color] || colorConfig.cyan;
  const hasImage = persona.avatarUrl && !imageError;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative flex items-center justify-center ${className ?? ""}`}
    >
      {showGlow && (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-0 rounded-full blur-xl bg-gradient-to-br ${colors.gradient} ${colors.glow} shadow-lg`}
          style={{ transform: "scale(1.2)" }}
        />
      )}

      <div
        className={`relative rounded-full overflow-hidden ${sizes.container} ${sizes.ring} ${colors.ring} bg-gradient-to-br ${colors.gradient} transition-all duration-300`}
      >
        {hasImage ? (
          <img
            src={persona.avatarUrl}
            alt={persona.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colors.gradient}`}>
            <div className={`rounded-full flex items-center justify-center ${colors.iconBg} ${sizes.iconBg}`}>
              <Icon className={`${sizes.icon} text-white/90`} />
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 pointer-events-none" />
      </div>

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-dashed border-white/10 pointer-events-none"
        style={{ transform: `scale(${sizes.glowScale})`, transformOrigin: "center" }}
      />
    </motion.div>
  );
}
