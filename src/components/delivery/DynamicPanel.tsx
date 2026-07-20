"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Network, Sparkles } from "lucide-react";
import type { ChannelData } from "./ChannelTile";
import type { DeliveryModelData } from "./DeliveryModelCard";
import { DeliveryModelCard } from "./DeliveryModelCard";
import { ChannelDetail } from "./ChannelDetail";

interface DynamicPanelProps {
  selectedChannel: ChannelData | null;
  channels: ChannelData[];
  models: DeliveryModelData[];
  onBack: () => void;
}

const panelVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 280, damping: 26, delay: 0.3 },
  },
};

export function DynamicPanel({ selectedChannel, models, onBack }: DynamicPanelProps) {
  return (
    <motion.div
      variants={panelVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        {selectedChannel ? (
          <motion.div
            key={`detail-${selectedChannel.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="min-h-0 flex-1 overflow-hidden p-4"
          >
            <ChannelDetail
              channel={selectedChannel}
              models={models}
              onBack={onBack}
            />
          </motion.div>
        ) : (
          <motion.div
            key="models-overview"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex min-h-0 flex-1 flex-col overflow-hidden p-4"
          >
            <div className="mb-3 flex shrink-0 items-center gap-2.5">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2">
                <Network size={15} className="text-teal-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-playfair text-sm font-semibold text-cream">Delivery Models</h3>
                <p className="text-[10px] text-gray-muted">GTM frameworks & channel strategy</p>
              </div>
              <Sparkles size={14} className="shrink-0 text-gold/50" />
            </div>

            <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5 scrollbar-thin">
              {models.map((model, index) => (
                <DeliveryModelCard key={model.id} model={model} index={index} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
