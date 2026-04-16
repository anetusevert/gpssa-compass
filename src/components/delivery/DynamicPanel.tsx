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
      className="h-full flex flex-col rounded-2xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-sm overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {selectedChannel ? (
          <motion.div
            key={`detail-${selectedChannel.id}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex-1 p-4 overflow-hidden"
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
            className="flex-1 flex flex-col p-4 overflow-hidden"
          >
            {/* Panel header */}
            <div className="flex items-center gap-2.5 mb-4 flex-shrink-0">
              <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <Network size={15} className="text-teal-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-playfair text-sm font-semibold text-cream">Delivery Models</h3>
                <p className="text-[10px] text-gray-muted">GTM frameworks & channel strategy</p>
              </div>
              <Sparkles size={14} className="text-gold/50 shrink-0" />
            </div>

            <p className="text-[11px] text-gray-muted leading-relaxed mb-4 flex-shrink-0">
              Select a channel to see detailed performance and country benchmarks, or explore how delivery models group channels into coherent customer journeys.
            </p>

            {/* Models list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
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
